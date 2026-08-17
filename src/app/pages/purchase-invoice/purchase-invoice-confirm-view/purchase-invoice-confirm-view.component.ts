import { Component, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { of, switchMap } from 'rxjs';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';

/**
 * Melengkapi faktur pada penerimaan yang menunggu — kerangka form-buat.
 *
 * Barang dan jumlahnya BACA SAJA: keduanya milik penerimaan dan sudah
 * mengubah stok; yang dilengkapi di sini hanya nomor faktur supplier,
 * faktur pajak, tanggal faktur, harga-diskon per baris, dan diskon
 * dokumen — persis muatan PUT /good-receipt/confirm. Tanda buku pada
 * baris menyimpan harganya ke master barang, sama seperti di formulir
 * penerimaan dan faktur penjualan.
 *
 * Menolak penerimaan (barang dikembalikan, dokumen batal) juga dari sini,
 * lewat tombol bahaya dengan konfirmasinya sendiri.
 */
@Component({
  selector: 'app-purchase-invoice-confirm-view',
  templateUrl: './purchase-invoice-confirm-view.component.html',
  styleUrls: ['./purchase-invoice-confirm-view.component.scss'],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    DatePipe,
    ReactiveFormsModule,
    NgxMaskDirective,
    TranslatePipe,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatInput,
    MatDatepicker,
    MatDatepickerInput,
  ],
  providers: [DatePipe],
})
export class PurchaseInvoiceConfirmViewComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private pageTitleService: PageTitleService,
  ) {}

  isLoading = true;
  isSubmitting = false;

  /** Data penerimaan apa adanya — sumber tampilan baca-saja. */
  penerimaan: any = null;

  metaFormGroup: FormGroup = new FormGroup({
    invoice_name: new FormControl('', Validators.required),
    /* 16 digit faktur pajak, atau kosong bila belum ada. */
    faktur: new FormControl('', Validators.pattern(/^$|^[0-9]{16}$/)),
    date: new FormControl(new Date(), Validators.required),
  });

  itemsFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
    discount: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  ngOnInit(): void {
    this.pageTitleService.pasangKonteks({
      kembaliLabel: 'purchase-invoice__queue__title',
      kembaliJalur: '/Purchase-invoice',
      tag: 'purchase-invoice__complete__tag',
    });

    this.apiService
      .get(`good-receipt/${this.route.snapshot.params['id']}`)
      .subscribe({
        next: (data: any) => {
          if (!data || data.is_confirm || data.is_delete) {
            this.alertService.showSuccess(
              this.translateService.instant('general__already-confirmed'),
            );
            this.router.navigate(['/Purchase-invoice']);
            return;
          }

          this.penerimaan = data;

          this.metaFormGroup.patchValue({
            invoice_name: data.invoice_name ?? '',
            faktur: data.faktur ?? '',
            date: data.date,
          });
          this.itemsFormGroup.patchValue({ discount: data.discount ?? 0 });

          (data.good_receipt as any[]).forEach((x) => {
            this.t.push(
              this.formBuilder.group({
                id: [x.id],
                product_id: [x.product_id],
                product_unit_id: [x.product_unit_id],
                reference: [x.product?.reference],
                description: [x.product?.description],
                quantity: [Number(x.quantity)],
                unit: [
                  x.product_unit == null ? x.product?.unit : x.product_unit.unit,
                ],
                conversion: [
                  x.product_unit == null ? 1 : Number(x.product_unit.conversion),
                ],
                default_unit: [x.product?.unit],
                price: [
                  Number(x.price),
                  [Validators.required, Validators.min(0)],
                ],
                discount: [
                  Number(x.discount),
                  [Validators.required, Validators.min(0)],
                ],
                save_price: [false],
              }),
            );
          });
        },
        error: (error) => {
          this.alertService.showError(error);
          this.router.navigate(['/Purchase-invoice']);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  get t(): FormArray {
    return this.itemsFormGroup.controls['items'] as FormArray;
  }

  getFormGroupAt(i: number): FormGroup {
    return this.t.at(i) as FormGroup;
  }

  /* ---------------------------------------------------------------- */
  /* Nilai-nilai                                                       */
  /* ---------------------------------------------------------------- */

  totalBaris(i: number): number {
    const g = this.getFormGroupAt(i);
    return (
      (Number(g.get('price')?.value) - Number(g.get('discount')?.value)) *
      Number(g.get('quantity')?.value)
    );
  }

  get subtotal(): number {
    return this.t.controls.reduce(
      (a, b) =>
        a + Number(b.get('price')?.value) * Number(b.get('quantity')?.value),
      0,
    );
  }

  get diskonItem(): number {
    return this.t.controls.reduce(
      (a, b) =>
        a + Number(b.get('discount')?.value) * Number(b.get('quantity')?.value),
      0,
    );
  }

  get diskonDokumen(): number {
    return Number(this.itemsFormGroup.controls['discount'].value ?? 0);
  }

  get total(): number {
    return this.subtotal - this.diskonItem - this.diskonDokumen;
  }

  /* ---------------------------------------------------------------- */
  /* Checklist                                                         */
  /* ---------------------------------------------------------------- */

  get nomorFakturTerisi(): boolean {
    return this.metaFormGroup.controls['invoice_name'].valid;
  }

  get fakturPajakSah(): boolean {
    return this.metaFormGroup.controls['faktur'].valid;
  }

  get fakturPajakKosong(): boolean {
    return !this.metaFormGroup.controls['faktur'].value;
  }

  get diskonSah(): boolean {
    return this.diskonDokumen <= this.subtotal - this.diskonItem;
  }

  get bisaTerbitkan(): boolean {
    return (
      !this.isSubmitting &&
      !this.isLoading &&
      this.penerimaan != null &&
      this.metaFormGroup.valid &&
      this.itemsFormGroup.valid &&
      this.diskonSah
    );
  }

  /* ---------------------------------------------------------------- */
  /* Kirim                                                             */
  /* ---------------------------------------------------------------- */

  batal(): void {
    this.router.navigate(['/Purchase-invoice']);
  }

  terbitkan(): void {
    if (!this.bisaTerbitkan) {
      return;
    }

    this.isSubmitting = true;
    this.apiService
      .put('good-receipt/confirm', {
        id: Number(this.penerimaan.id),
        name: this.penerimaan.name,
        invoice_name: this.metaFormGroup.value.invoice_name,
        faktur: this.metaFormGroup.value.faktur,
        date: this.datePipe.transform(
          this.metaFormGroup.value.date,
          'yyyy-MM-dd',
        ),
        discount: this.diskonDokumen,
        good_receipt: this.t.controls.map((x) => ({
          id: x.get('id')?.value,
          price: Number(x.get('price')?.value),
          discount: Number(x.get('discount')?.value),
        })),
      })
      .pipe(
        /* Baris bertanda buku: harganya ikut disimpan ke master barang. */
        switchMap((hasil) => {
          if (!hasil) return of(null);

          const disimpan = this.t.controls
            .filter((x) => x.get('save_price')?.value)
            .map((x) => ({
              product_id: x.get('product_id')?.value,
              product_unit_id: x.get('product_unit_id')?.value,
              price: Number(x.get('price')?.value),
              discount: Number(x.get('discount')?.value),
            }));

          if (disimpan.length > 0) {
            return this.apiService.put('product/price-purchase', {
              items: disimpan,
            });
          }
          return of(null);
        }),
      )
      .subscribe({
        next: (_) => {
          this.alertService.showSuccess(
            this.translateService.instant(
              'purchase-invoice__confirm__confirm__success',
            ),
          );
          this.router.navigate(['/Purchase-invoice']);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  tolak(): void {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'purchase-invoice__confirm__delete__title',
          ),
        },
      })
      .afterClosed()
      .subscribe((hasil) => {
        /*
          Konfirmasi menutup dengan `true` HANYA lewat tombolnya; batal
          (atau backdrop) mengirim undefined. Tanpa pemeriksaan ini,
          membatalkan konfirmasi tetap menolak penerimaannya.
        */
        if (hasil !== true) {
          return;
        }

        this.isSubmitting = true;
        this.apiService
          .put('good-receipt/reject', { id: Number(this.penerimaan.id) })
          .subscribe({
            next: (_) => {
              this.alertService.showSuccess(
                this.translateService.instant(
                  'purchase-invoice__confirm__delete__success',
                ),
              );
              this.router.navigate(['/Purchase-invoice']);
            },
            error: (error) => {
              this.alertService.showError(error);
            },
          })
          .add(() => {
            this.isSubmitting = false;
          });
      });
  }
}

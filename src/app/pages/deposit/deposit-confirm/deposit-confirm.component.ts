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
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxMaskDirective } from 'ngx-mask';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import { PaymentSelectorComponent } from 'src/app/components/payment-selector/payment-selector.component';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';
import { PAYMENT_ROUNDING_TOLERANCE } from 'src/app/constants/payment.constant';

/**
 * Konfirmasi deposit — kerangka form-buat 5a.
 *
 * Mengeksekusi deposit menjadi faktur: barang, diskon, pengiriman, dan
 * servis dibaca apa adanya dari depositnya dan TIDAK bisa diubah di sini —
 * muatan POST /sales-deposit/confirm memang hanya id, tanggal faktur, dan
 * pembayaran. Bentuk lamanya menggambar checkbox "masuk faktur" per barang
 * yang tidak pernah dikirim ke mana-mana.
 *
 * Pembayaran dua lapis: yang tercatat saat deposit dibuat (baca saja) dan
 * pelunasan baru yang ditambahkan sekarang. Bentuk lamanya menjumlahkan
 * pembayaran dari kontrol `amount` yang tidak pernah ada — barisnya
 * bernama `value` — sehingga totalnya NaN, penjagaan "pembayaran melebihi
 * tagihan" tidak pernah menyala, dan is_paid selalu terkirim false.
 */
@Component({
  selector: 'app-deposit-confirm',
  templateUrl: './deposit-confirm.component.html',
  styleUrls: ['./deposit-confirm.component.scss'],
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
export class DepositConfirmComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private datePipe: DatePipe,
    private sheet: MatBottomSheet,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private pageTitleService: PageTitleService,
  ) {}

  isLoading = true;
  isSubmitting = false;
  paymentOptions: any[] = [];

  /** Data deposit apa adanya — sumber tampilan baca-saja. */
  deposit: any = null;

  metaFormGroup: FormGroup = new FormGroup({
    date: new FormControl(new Date(), Validators.required),
  });

  paymentsFormGroup: FormGroup = new FormGroup({
    pembayaran_baru: new FormArray([]),
  });

  ngOnInit(): void {
    /* Jalan pulang ke daftar deposit ada di topbar, seperti penerimaan barang. */
    this.pageTitleService.pasangKonteks({
      kembaliLabel: 'deposit__list__title',
      kembaliJalur: '/Deposit',
      tag: 'deposit__confirm__title',
    });

    const id = this.activatedRoute.snapshot.params['id'];

    this.apiService
      .get(`sales-deposit/${id}`)
      .subscribe({
        next: (data: any) => {
          if (data.is_delete || data.isDelete) {
            this.alertService.showSuccess(
              this.translateService.instant(
                'deposit__confirm__already-confirmed',
              ),
            );
            this.router.navigate(['/Deposit']);
            return;
          }

          this.deposit = data;
        },
        error: (error) => {
          this.alertService.showError(error);
          this.router.navigate(['/Deposit']);
        },
      })
      .add(() => {
        this.isLoading = false;
      });

    this.apiService
      .get('payment-method/all', { keyword: '', page: 1 })
      .subscribe({
        next: (data: any) => {
          this.paymentOptions = data;
        },
      });
  }

  get p(): FormArray {
    return this.paymentsFormGroup.controls['pembayaran_baru'] as FormArray;
  }

  getFormGroupAtPayment(i: number): FormGroup {
    return this.p.at(i) as FormGroup;
  }

  /* ---------------------------------------------------------------- */
  /* Nilai-nilai                                                       */
  /* ---------------------------------------------------------------- */

  get nilaiBarang(): number {
    return (this.deposit?.sales_deposit ?? []).reduce(
      (a: number, b: any) => a + (b.price - b.discount) * b.quantity,
      0,
    );
  }

  totalBaris(x: any): number {
    return (x.price - x.discount) * x.quantity;
  }

  satuanBaris(x: any): string {
    return x.product_unit == null ? x.product.unit : x.product_unit.unit;
  }

  /** Total tagihan: barang netto + pengiriman + servis − diskon dokumen. */
  get totalTagihan(): number {
    if (this.deposit == null) {
      return 0;
    }

    return (
      this.nilaiBarang +
      Number(this.deposit.delivery ?? 0) +
      Number(this.deposit.service ?? 0) +
      /* Biaya admin ditagihkan ke pelanggan, jadi ia bagian dari yang harus
         dibayar — server menghitungnya begitu, dan layar harus sepakat. */
      Number(this.deposit.adminFee ?? 0) -
      Number(this.deposit.discount ?? 0)
    );
  }

  get sudahDibayar(): number {
    return (this.deposit?.sales_deposit_payment ?? []).reduce(
      (a: number, b: any) => a + Number(b.value),
      0,
    );
  }

  get pembayaranBaru(): number {
    return this.p.controls.reduce(
      (a, b) => a + Number(b.get('value')?.value ?? 0),
      0,
    );
  }

  get totalPembayaran(): number {
    return this.sudahDibayar + this.pembayaranBaru;
  }

  get sisa(): number {
    return this.totalTagihan - this.totalPembayaran;
  }

  get lunas(): boolean {
    /* Kesamaan persis menggantungkan dokumen gara-gara receh pembulatan. */
    return (
      this.totalTagihan - this.totalPembayaran <= PAYMENT_ROUNDING_TOLERANCE
    );
  }

  /** Pembayaran tidak boleh melebihi tagihan — server menolaknya juga. */
  get pembayaranSah(): boolean {
    return this.totalPembayaran <= this.totalTagihan;
  }

  /* ---------------------------------------------------------------- */
  /* Pembayaran baru                                                   */
  /* ---------------------------------------------------------------- */

  openPaymentSelector(): void {
    this.sheet
      .open(PaymentSelectorComponent, {
        data: this.paymentOptions,
      })
      .afterDismissed()
      .subscribe((data: any) => {
        if (!data) {
          return;
        }

        const sudahAda = this.p.controls.some(
          (x) => x.get('payment_method_id')?.value == data.id,
        );
        if (sudahAda) {
          this.alertService.showSuccess(
            this.translateService.instant('general__payment__exists'),
          );
          return;
        }

        /* Nilai awal: sisa tagihan, seperti kartu pembayaran faktur. */
        this.p.push(
          this.formBuilder.group({
            payment_method_id: [data.id, Validators.required],
            name: [data.name],
            description: [data.description],
            value: [
              Math.max(this.sisa, 0),
              [Validators.required, Validators.min(0.01)],
            ],
          }),
        );
      });
  }

  deletePayment(i: number): void {
    this.p.removeAt(i);
  }

  /* ---------------------------------------------------------------- */
  /* Kirim                                                             */
  /* ---------------------------------------------------------------- */

  get bisaSimpan(): boolean {
    return (
      !this.isSubmitting &&
      !this.isLoading &&
      this.deposit != null &&
      this.metaFormGroup.valid &&
      this.paymentsFormGroup.valid &&
      this.pembayaranSah
    );
  }

  batal(): void {
    this.router.navigate(['/Deposit']);
  }

  submit(): void {
    if (!this.bisaSimpan) {
      return;
    }

    const tanggalFaktur = this.datePipe.transform(
      this.metaFormGroup.value.date,
      'yyyy-MM-dd',
    );

    this.isSubmitting = true;
    this.apiService
      .post('sales-deposit/confirm', {
        id: Number(this.activatedRoute.snapshot.params['id']),
        date: tanggalFaktur,
        sales_invoice_payment: [
          /* Pembayaran lama memakai tanggalnya sendiri… */
          ...(this.deposit.sales_deposit_payment ?? []).map((x: any) => ({
            payment_method_id: x.payment_method_id,
            value: Number(x.value),
            date: this.datePipe.transform(x.date, 'yyyy-MM-dd'),
          })),
          /* …pelunasan baru tercatat pada tanggal fakturnya. */
          ...this.p.controls.map((x) => ({
            payment_method_id: x.get('payment_method_id')?.value,
            value: Number(x.get('value')?.value),
            date: tanggalFaktur,
          })),
        ],
        is_paid: this.lunas,
      })
      .subscribe({
        next: (_) => {
          this.alertService.showSuccess(
            this.translateService.instant('deposit__confirm__success'),
          );
          this.router.navigate(['/Deposit']);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }
}

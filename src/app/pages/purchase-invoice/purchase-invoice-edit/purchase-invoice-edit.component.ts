import { DatePipe, NgIf, NgFor, DecimalPipe, Location } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NgxMaskDirective } from 'ngx-mask';
import { v4 } from 'uuid';

import {
  ProductSelectorComponent,
  ProductSelectorType,
} from 'src/app/components/product-selector/product-selector.component';
import { ComboSearchComponent } from 'src/app/components/combo-search/combo-search.component';
import { UpdateProductPurchasePriceComponent } from 'src/app/components/update-product-purchase-price/update-product-purchase-price.component';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { PageTitleService } from 'src/app/services/page-title.service';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
  MatHint,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';

/**
 * Ubah faktur pembelian — kembaran anatomi buat penerimaan barang.
 *
 * Dokumen yang diubah di sini SUDAH lengkap dan terkonfirmasi, jadi tidak
 * ada pilihan keadaan surat-jalan/lengkap: kartu faktur supplier selalu
 * tampil. Kiriman simpannya PUT good-receipt — penerimaan dan faktur
 * pembelian memang satu catatan.
 *
 * Bentuk lamanya menyimpan barang dengan ruas `item_unit_id` yang tidak
 * pernah ada di formulirnya, sehingga SATUAN TAMBAHAN HILANG pada setiap
 * penyuntingan; kuantitas juga dipangkas parseInt. Keduanya dibenahi di
 * submitForm.
 */
@Component({
  selector: 'app-purchase-invoice-edit',
  templateUrl: './purchase-invoice-edit.component.html',
  styleUrls: ['./purchase-invoice-edit.component.scss'],
  imports: [
    ComboSearchComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatSuffix,
    MatDatepicker,
    MatHint,
    NgxMaskDirective,
    NgIf,
    NgFor,
    DecimalPipe,
    TranslatePipe,
  ],
})
export class PurchaseInvoiceEditComponent implements OnInit, OnDestroy {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private dynamicComponentService: DynamicComponentService,
    private _hotkeysService: HotkeysService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private translateService: TranslateService,
    private pageTitleService: PageTitleService,
    private sheet: MatBottomSheet,
  ) {
    this._hotkeysService.add([
      new Hotkey('alt+a', (): boolean => {
        this.openItemSelector();
        return false;
      }),
      new Hotkey('alt+s', (): boolean => {
        this.submitForm();
        return false;
      }),
    ]);
  }

  isLoading = true;
  isSubmitting = false;

  /*
   * Sama seperti buat penerimaan barang: hanya peran 5 dan 7 yang melihat
   * kolom harga. Batas kerasnya administratorMiddleware di server.
   */
  bolehUbahHarga = inject(AuthService).isAdministrator();

  namaSupplier = '';
  namaPerusahaan = '';

  metaFormGroup: FormGroup = new FormGroup({
    uuid: new FormControl(v4(), Validators.required),
    company_id: new FormControl('', Validators.required),
    supplier_id: new FormControl('', Validators.required),
  });

  documentFormGroup: FormGroup = new FormGroup({
    date: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    invoice_name: new FormControl('', Validators.required),
    faktur: new FormControl('', Validators.pattern(/(^$|(^([0-9]{16})$))/g)),
  });

  itemFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
  });

  /** Diskon tingkat dokumen — di luar diskon tiap baris. */
  discountControl = new FormControl(0, [
    Validators.required,
    Validators.min(0),
  ]);

  get t(): FormArray {
    return this.itemFormGroup.controls['items'] as FormArray;
  }

  ngOnInit(): void {
    this.pageTitleService.pasangKonteks({
      kembaliLabel: 'purchase-invoice__title',
      kembaliJalur: '/Purchase-invoice',
      tag: 'purchase-invoice__edit__title',
    });

    this.apiService
      .get(`good-receipt/${this.route.snapshot.paramMap.get('id')}`)
      .subscribe({
        next: (data: any) => {
          /* Hanya dokumen hidup yang sudah lengkap yang bisa diubah di sini. */
          if (data.is_delete || !data.is_confirm) {
            this.alertService.showError(
              this.translateService.instant('general__not-found'),
            );
            this.router.navigate(['/Purchase-invoice']);
            return;
          }

          this.metaFormGroup.patchValue({
            company_id: data.company_id,
            supplier_id: data.supplier_id,
          });
          this.namaSupplier = data.supplier?.name ?? '';
          this.namaPerusahaan = data.company?.name ?? '';

          this.documentFormGroup.patchValue({
            date: data.date,
            name: data.name,
            invoice_name: data.invoice_name,
            faktur: data.faktur ?? '',
          });

          data.good_receipt.forEach((x: any) => {
            this.t.push(this.buatBaris(x));
          });

          this.discountControl.setValue(Number(data.discount ?? 0));
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

  ngOnDestroy(): void {
    this._hotkeysService.reset();
  }

  private buatBaris(x: any): FormGroup {
    return this.formBuilder.group({
      product_id: [x.product_id, Validators.required],
      product_unit_id: [x.product_unit_id],
      reference: [x.product.reference],
      description: [x.product.description],
      quantity: [
        Number(x.quantity),
        [Validators.required, Validators.min(0.01)],
      ],
      price: [Number(x.price), [Validators.required, Validators.min(0)]],
      discount: [Number(x.discount), [Validators.min(0)]],
      /*
        Acuan matinya toggle simpan-harga: harga master tidak dimuat di sini,
        jadi acuannya nilai dokumen saat dibuka — belum berubah, belum ada
        yang perlu disimpan.
      */
      initial_price: [Number(x.price)],
      initial_discount: [Number(x.discount)],
      save_price: [false],
      unit: [x.product_unit_id == null ? x.product.unit : x.product_unit.unit],
      conversion: [
        x.product_unit_id == null ? 1 : Number(x.product_unit.conversion),
      ],
      default_unit: [x.product.unit],
    });
  }

  /* ---------------------------------------------------------------- */
  /* Pilihan supplier & perusahaan                                     */
  /* ---------------------------------------------------------------- */

  onSelectSupplier(data: any): void {
    this.metaFormGroup.patchValue({ supplier_id: data.id });
  }

  onUnselectSupplier(): void {
    this.metaFormGroup.patchValue({ supplier_id: '' });
  }

  onSelectCompany(data: any): void {
    this.metaFormGroup.patchValue({ company_id: data.id });
  }

  onUnselectCompany(): void {
    this.metaFormGroup.patchValue({ company_id: '' });
  }

  /* ---------------------------------------------------------------- */
  /* Barang                                                            */
  /* ---------------------------------------------------------------- */

  openItemSelector(): void {
    this.dynamicComponentService
      .createDynamicComponent(ProductSelectorComponent, {
        type: ProductSelectorType.purchase,
      })
      .subscribe((result) => {
        if (!result) return;

        const productID = result.data.id;
        const productUnitID = result.sub == null ? null : result.sub.id;

        const sudahAda = this.t.controls.some(
          (x) =>
            x.get('product_id')?.value === productID &&
            x.get('product_unit_id')?.value === productUnitID,
        );
        if (sudahAda) {
          this.alertService.showSuccess(
            this.translateService.instant('general__item__exists'),
          );
          return;
        }

        const data = result.data;
        const sub = result.sub;
        this.t.push(
          this.formBuilder.group({
            product_id: [data.id, Validators.required],
            product_unit_id: [sub == null ? null : sub.id],
            reference: [data.reference],
            description: [data.description],
            quantity: [0, [Validators.required, Validators.min(0.01)]],
            price: [
              Number(sub == null ? data.purchase_price : sub.purchase_price),
              [Validators.required, Validators.min(0)],
            ],
            discount: [
              Number(
                sub == null ? data.purchase_discount : sub.purchase_discount,
              ),
              [Validators.min(0)],
            ],
            /* Baris baru: acuannya harga master yang barusan dimuat. */
            initial_price: [
              Number(sub == null ? data.purchase_price : sub.purchase_price),
            ],
            initial_discount: [
              Number(
                sub == null ? data.purchase_discount : sub.purchase_discount,
              ),
            ],
            save_price: [false],
            unit: [sub == null ? data.unit : sub.unit],
            conversion: [sub == null ? 1 : Number(sub.conversion)],
            default_unit: [data.unit],
          }),
        );
      });
  }

  deleteItem(i: number): void {
    this.t.removeAt(i);
  }

  baris(i: number): FormGroup {
    return this.t.at(i) as FormGroup;
  }

  simpanHarga(i: number): boolean {
    return !!this.baris(i).value.save_price;
  }

  toggleSimpanHarga(i: number): void {
    const kontrol = this.baris(i).controls['save_price'];
    kontrol.setValue(!kontrol.value);
    this.itemFormGroup.markAsDirty();
  }

  /*
    Harga dan diskon dibuka lewat bottom sheet, bukan diketik di tabel —
    pola yang sama dengan faktur penjualan dan buat penerimaan barang.
  */
  ubahHarga(i: number): void {
    if (!this.bolehUbahHarga) {
      return;
    }

    const nilai = this.baris(i).value;
    const sheet = this.sheet.open(UpdateProductPurchasePriceComponent, {
      data: {
        reference: nilai.reference,
        unit: nilai.unit,
        price: nilai.price,
        discount: nilai.discount,
        initial_price: nilai.initial_price,
        initial_discount: nilai.initial_discount,
        save_price: nilai.save_price,
      },
    });

    sheet.afterDismissed().subscribe((data) => {
      if (data) {
        this.baris(i).patchValue({
          price: Number(data.price ?? 0),
          discount: Number(data.discount ?? 0),
          save_price: data.save_price,
        });
        this.itemFormGroup.markAsDirty();
      }
    });
  }

  jumlahBaris(productID: number): number {
    return this.t.controls.filter(
      (x) => x.get('product_id')?.value === productID,
    ).length;
  }

  totalBaris(i: number): number {
    const baris = this.t.at(i);
    return (
      Number(baris.get('quantity')?.value ?? 0) *
      (Number(baris.get('price')?.value ?? 0) -
        Number(baris.get('discount')?.value ?? 0))
    );
  }

  /* ---------------------------------------------------------------- */
  /* Ringkasan                                                         */
  /* ---------------------------------------------------------------- */

  get subtotal(): number {
    return this.t.controls.reduce(
      (a, b) =>
        a +
        Number(b.get('quantity')?.value ?? 0) *
          Number(b.get('price')?.value ?? 0),
      0,
    );
  }

  get diskonItem(): number {
    return this.t.controls.reduce(
      (a, b) =>
        a +
        Number(b.get('quantity')?.value ?? 0) *
          Number(b.get('discount')?.value ?? 0),
      0,
    );
  }

  get diskonDokumen(): number {
    return Number(this.discountControl.value ?? 0);
  }

  get total(): number {
    return this.subtotal - this.diskonItem - this.diskonDokumen;
  }

  get bolehSimpan(): boolean {
    return (
      this.metaFormGroup.valid &&
      this.documentFormGroup.valid &&
      this.itemFormGroup.valid &&
      this.t.length > 0 &&
      this.diskonDokumen <= this.subtotal - this.diskonItem &&
      !this.isSubmitting
    );
  }

  /* ---------------------------------------------------------------- */
  /* Simpan                                                            */
  /* ---------------------------------------------------------------- */

  submitForm(): void {
    if (!this.bolehSimpan) return;

    this.isSubmitting = true;

    /*
      product_unit_id dikirim APA ADANYA — bentuk lamanya membaca
      `item_unit_id` yang tidak pernah ada di formulir, sehingga satuan
      tambahan lenyap pada setiap penyuntingan. Kuantitas memakai Number,
      bukan parseInt: 2.5 lembar bukan 2 lembar.
    */
    const items = this.t.controls.map((x) => ({
      product_id: Number(x.get('product_id')?.value),
      product_unit_id: x.get('product_unit_id')?.value ?? null,
      quantity: Number(x.get('quantity')?.value),
      price: Number(x.get('price')?.value),
      discount: Number(x.get('discount')?.value ?? 0),
    }));

    const faktur = this.documentFormGroup.controls['faktur'].value;

    this.apiService
      .put('good-receipt', {
        id: Number(this.route.snapshot.paramMap.get('id')),
        uuid: this.metaFormGroup.controls['uuid'].value,
        name: this.documentFormGroup.controls['name'].value,
        date: this.datePipe.transform(
          this.documentFormGroup.controls['date'].value,
          'yyyy-MM-dd',
        ),
        good_receipt: items,
        company_id: this.metaFormGroup.controls['company_id'].value,
        supplier_id: this.metaFormGroup.controls['supplier_id'].value,
        invoice_name: this.documentFormGroup.controls['invoice_name'].value,
        discount: this.diskonDokumen,
        is_confirm: true,
        confirmed_at: new Date(),
        faktur: faktur === '' ? null : faktur,
      })
      .subscribe({
        next: () => {
          this.simpanHargaMaster();
          this.alertService.showSuccess(
            this.translateService.instant(
              'purchase-invoice__update__success__message',
            ),
          );
          this.location.back();
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  /**
   * Menimpa harga beli di master untuk baris yang dicentang — pola yang sama
   * dengan buat penerimaan barang: dijalankan SETELAH dokumennya tersimpan,
   * dan kegagalannya dilaporkan sebagai kegagalan harga master saja.
   */
  private simpanHargaMaster(): void {
    if (!this.bolehUbahHarga) {
      return;
    }

    const items = this.t.controls
      .filter((x) => x.get('save_price')?.value)
      .map((x) => ({
        product_id: x.get('product_id')?.value,
        product_unit_id: x.get('product_unit_id')?.value,
        price: Number(x.get('price')?.value ?? 0),
        discount: Number(x.get('discount')?.value ?? 0),
      }));

    if (items.length === 0) {
      return;
    }

    this.apiService.put('product/price-purchase', { items }).subscribe({
      next: () => {
        this.alertService.showSuccess(
          this.translateService.instant('good-receipt__create__price-saved'),
        );
      },
      error: (error: any) => {
        this.alertService.showError(error);
      },
    });
  }

  batal(): void {
    this.location.back();
  }

  canExit(): boolean {
    if (
      this.metaFormGroup.dirty ||
      this.documentFormGroup.dirty ||
      this.itemFormGroup.dirty ||
      this.discountControl.dirty
    ) {
      return confirm(
        this.translateService.instant('general__unsaved-exit-confirm'),
      );
    }
    return true;
  }
}

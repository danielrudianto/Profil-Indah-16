import { Component, ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { NgxMaskDirective } from 'ngx-mask';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ProductBrandCreateComponent } from 'src/app/pages/product-brand/product-brand-create/product-brand-create.component';
import { ProductTypeCreateComponent } from 'src/app/pages/product-type/product-type-create/product-type-create.component';
import { ValueValidator } from 'src/app/validators/value.validator';
import { PRODUCT_UNITS } from 'src/app/constants/unit.constant';
import {
  ComboItem,
  ComboSearchComponent,
} from 'src/app/components/combo-search/combo-search.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';

/**
 * Tambah barang — sistem desain Nocturne.
 *
 * STEPPER-NYA DIBUANG. Bentuk sebelumnya membagi formulir menjadi dua langkah
 * Material: keterangan barang di langkah pertama, satuan di langkah kedua.
 * Pembagian itu menyembunyikan setengah formulir dari pandangan, padahal harga
 * pada satuan dasar dan harga pada satuan turunan justru perlu dilihat
 * bersamaan untuk dibandingkan. Desainnya menggantinya dengan satu halaman:
 * dua kartu di kiri, ringkasan dan tombol di kanan.
 *
 * SATUAN DASAR KINI MENJADI BARIS PERTAMA TABEL, bukan sekumpulan kolom isian
 * terpisah di kartu atas. Nilainya tetap disimpan di itemFormGroup seperti
 * sebelumnya — bentuk kirimannya ke server tidak berubah sedikit pun — hanya
 * letaknya di layar yang disatukan dengan satuan turunannya.
 *
 * Menambah satuan juga tidak lagi lewat dialog. Dialognya memaksa pengguna
 * mengisi enam kolom tanpa bisa melihat baris yang sudah ada, padahal angka
 * yang diisi hampir selalu diturunkan dari baris di atasnya.
 */
@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    NgIf,
    NgFor,
    ReactiveFormsModule,
    NgxMaskDirective,
    TranslatePipe,
    ComboSearchComponent,
  ],
})
export class ProductCreateComponent {
  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private location: Location,
    private dialog: MatDialog,
    private dynamicComponentService: DynamicComponentService,
  ) {}

  @ViewChild('comboBrand') comboBrand?: ComboSearchComponent;
  @ViewChild('comboType') comboType?: ComboSearchComponent;

  readonly satuanTersedia = PRODUCT_UNITS;

  isSubmitting = false;

  itemFormGroup: FormGroup = new FormGroup({
    reference: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(50),
      Validators.pattern(/^(?!bulk$).*$/),
    ]),
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(500),
    ]),
    product_brand_id: new FormControl('', Validators.required),
    product_type_id: new FormControl('', Validators.required),
    unit: new FormControl('', Validators.required),
    minimum_stock: new FormControl(0, [Validators.required, Validators.min(0)]),
    sales_price: new FormControl(0, [Validators.required, Validators.min(0)]),
    sales_discount: new FormControl(0, [Validators.required, Validators.min(0)]),
    purchase_price: new FormControl(0, [
      Validators.required,
      Validators.min(0),
    ]),
    purchase_discount: new FormControl(0, [
      Validators.required,
      Validators.min(0),
    ]),
  });

  unitFormGroup: FormGroup = new FormGroup({
    item_units: new FormArray([]),
  });

  get t(): FormArray {
    return this.unitFormGroup.controls['item_units'] as FormArray;
  }

  getFormAt(i: number): FormGroup {
    return this.t.at(i) as FormGroup;
  }

  /* ---------------------------------------------------------------- */
  /* Ringkasan sebelum simpan                                          */
  /* ---------------------------------------------------------------- */

  get referensiTerisi(): boolean {
    return this.itemFormGroup.controls['reference'].valid;
  }

  get merekTipeTerisi(): boolean {
    return (
      this.itemFormGroup.controls['product_brand_id'].valid &&
      this.itemFormGroup.controls['product_type_id'].valid
    );
  }

  get satuanDasar(): string {
    return this.itemFormGroup.get('unit')?.value ?? '';
  }

  get bisaSimpan(): boolean {
    return (
      !this.isSubmitting && this.itemFormGroup.valid && this.unitFormGroup.valid
    );
  }

  /* ---------------------------------------------------------------- */
  /* Merek dan tipe                                                    */
  /* ---------------------------------------------------------------- */

  pilihMerek(item: ComboItem): void {
    this.itemFormGroup.patchValue({ product_brand_id: item.id });
  }

  lepasMerek(): void {
    this.itemFormGroup.patchValue({ product_brand_id: '' });
  }

  pilihTipe(item: ComboItem): void {
    this.itemFormGroup.patchValue({ product_type_id: item.id });
  }

  lepasTipe(): void {
    this.itemFormGroup.patchValue({ product_type_id: '' });
  }

  /**
   * Membuka dialog tambah merek, lalu langsung memilih hasilnya.
   *
   * Memakai DIALOG YANG SAMA dengan halaman daftar merek, bukan kolom isian
   * tersendiri di formulir ini. Dua tempat membuat merek berarti dua aturan
   * yang harus dijaga tetap sama — panjang nama, pesan galat, perilaku ketika
   * namanya sudah dipakai — dan yang satu pasti tertinggal.
   *
   * Bentuk sebelumnya menyimpan hasilnya ke kolom `brand` dan
   * `brand_search_bar` — dua nama yang TIDAK ADA di itemFormGroup. patchValue
   * mengabaikan kunci yang tidak dikenalnya tanpa mengeluh, jadi menekan
   * tombol itu tampak berhasil sementara product_brand_id tetap kosong dan
   * formulirnya tetap tidak bisa disimpan.
   */
  buatMerek(): void {
    this.dialog
      .open(ProductBrandCreateComponent, {
        panelClass: 'nocturne-dialog',
        backdropClass: 'nocturne-dialog-backdrop',
      })
      .afterClosed()
      .subscribe((data: any) => {
        if (!data) {
          return;
        }

        this.itemFormGroup.patchValue({ product_brand_id: data.id });
        this.comboBrand?.setSelected({ id: data.id, name: data.name });
      });
  }

  /* Tipe barang dibuka lewat DynamicComponentService — lihat catatan di
     halaman daftar tipe soal dua mekanisme dialog yang masih berdampingan. */
  buatTipe(): void {
    this.dynamicComponentService
      .createDynamicComponent(ProductTypeCreateComponent, {})
      .subscribe((data: any) => {
        if (!data) {
          return;
        }

        this.itemFormGroup.patchValue({ product_type_id: data.id });
        this.comboType?.setSelected({ id: data.id, name: data.name });
      });
  }

  /* ---------------------------------------------------------------- */
  /* Satuan                                                            */
  /* ---------------------------------------------------------------- */

  tambahSatuan(): void {
    this.t.push(
      this.formBuilder.group({
        unit: ['', [Validators.required, ValueValidator(1)]],
        conversion: [1, [Validators.required, Validators.min(1)]],
        sales_price: [0, [Validators.required, Validators.min(0)]],
        sales_discount: [0, [Validators.required, Validators.min(0)]],
        purchase_price: [0, [Validators.required, Validators.min(0)]],
        purchase_discount: [0, [Validators.required, Validators.min(0)]],
      }),
    );
  }

  hapusSatuan(i: number): void {
    this.t.removeAt(i);
  }

  /** Satuan yang berada tepat di atas baris ke-i, acuan konversinya. */
  satuanDiAtas(i: number): string {
    return i === 0
      ? this.satuanDasar
      : (this.getFormAt(i - 1).get('unit')?.value ?? '');
  }

  /* ---------------------------------------------------------------- */
  /* Kirim                                                             */
  /* ---------------------------------------------------------------- */

  batal(): void {
    this.location.back();
  }

  submitForm(): void {
    if (!this.bisaSimpan) {
      return;
    }

    this.isSubmitting = true;

    this.apiService
      .post('product', {
        ...this.itemFormGroup.value,
        units: this.t.controls.map((x) => ({
          conversion: Number(x.get('conversion')?.value ?? '0'),
          unit: x.get('unit')?.value,
          sales_price: Number(x.get('sales_price')?.value ?? '0'),
          sales_discount: Number(x.get('sales_discount')?.value ?? '0'),
          purchase_price: Number(x.get('purchase_price')?.value ?? '0'),
          purchase_discount: Number(x.get('purchase_discount')?.value ?? '0'),
        })),
      })
      .subscribe({
        next: (data: any) => {
          this.translateService
            .get('general__created-successfully')
            .subscribe((teks) => {
              this.alertService.showSuccess(`${data.reference} ${teks}`);
              this.itemFormGroup.reset({
                minimum_stock: 0,
                sales_price: 0,
                sales_discount: 0,
                purchase_price: 0,
                purchase_discount: 0,
              });
              this.t.clear();
            });
        },
        error: (error: any) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }
}

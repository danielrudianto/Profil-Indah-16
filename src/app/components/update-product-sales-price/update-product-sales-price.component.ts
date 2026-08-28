import { Component, Inject, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { NgIf, DecimalPipe } from '@angular/common';

/**
 * Lembar bawah pengubah harga jual & diskon satu baris faktur — kembaran
 * update-product-purchase-price di sisi penjualan. Ubah keduanya bersamaan.
 */
@Component({
  selector: 'app-update-product-sales-price',
  templateUrl: './update-product-sales-price.component.html',
  styleUrls: ['./update-product-sales-price.component.scss'],
  imports: [
    NgIf,
    DecimalPipe,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    NgxMaskDirective,
    MatSlideToggle,
    TranslatePipe,
  ],
})
export class UpdateProductSalesPriceComponent implements OnInit {
  /**
   * Hanya peran 5 dan 7 yang boleh menimpa harga di master barang.
   *
   * Batas yang sama dijaga administratorMiddleware di server; yang di sini
   * hanya supaya pilihan yang pasti ditolak tidak ditawarkan lebih dulu.
   */
  bolehSimpanKeMaster = inject(AuthService).isAdministrator();

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private sheet: MatBottomSheetRef<UpdateProductSalesPriceComponent>,
  ) {}

  priceFormGroup: FormGroup = new FormGroup({
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
    discount: new FormControl(0, [Validators.required, Validators.min(0)]),
    /*
      Pendamping persen. TIDAK ikut dikirim — updatePrice mengembalikan
      getRawValue(), dan pemanggilnya hanya membaca price/discount/save_price.
      Yang tercatat tetap rupiah.
    */
    discountPercentage: new FormControl(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
    initial_price: new FormControl(0, [Validators.required, Validators.min(0)]),
    initial_discount: new FormControl(0, [
      Validators.required,
      Validators.min(0),
    ]),
    save_price: new FormControl(false),
  });

  ngOnInit(): void {
    this.priceFormGroup.patchValue(this.data);
    this.hitungPersen(Number(this.data.discount ?? 0));

    this.priceFormGroup.get('discount')?.valueChanges.subscribe((diskon) => {
      this.hitungPersen(Number(diskon ?? 0));
    });

    this.priceFormGroup
      .get('discountPercentage')
      ?.valueChanges.subscribe((persen) => {
        this.hitungRupiah(Number(persen ?? 0));
      });

    /* Harga berubah = persen yang tertulis tidak lagi benar; rupiah dipegang. */
    this.priceFormGroup.get('price')?.valueChanges.subscribe(() => {
      this.hitungPersen(Number(this.priceFormGroup.value.discount ?? 0));
    });

    this.priceFormGroup.valueChanges.subscribe(() => this.sesuaikanToggle());
    this.sesuaikanToggle();
  }

  /*
    Sengaja disalin sebentuk dari lembar harga BELI, bukan diringkas ke
    utilitas bersama: berkas ini menyatakan dirinya kembaran lembar itu dan
    meminta keduanya diubah bersamaan. Bentuk yang sama persis membuat
    perbandingannya sepele; satu memakai utilitas dan satunya tidak justru
    menyembunyikan selisih perilaku bila kelak salah satunya disunting.
  */
  private hitungPersen(diskon: number): void {
    const harga = Number(this.priceFormGroup.value.price ?? 0);
    this.priceFormGroup
      .get('discountPercentage')
      ?.setValue(harga === 0 ? 0 : (diskon * 100) / harga, {
        emitEvent: false,
      });
  }

  private hitungRupiah(persen: number): void {
    const harga = Number(this.priceFormGroup.value.price ?? 0);
    this.priceFormGroup
      .get('discount')
      ?.setValue((persen * harga) / 100, { emitEvent: false });

    /*
      emitEvent: false melewati valueChanges grup, dan di situlah
      sesuaikanToggle dipanggil. Tanpa baris ini, mengetik persen mengubah
      diskonnya tetapi toggle simpan-ke-master tetap mati.
    */
    this.sesuaikanToggle();
  }

  /**
   * Toggle simpan-master hanya hidup bila ada perubahan sah untuk disimpan.
   * Dikelola lewat kontrolnya, bukan [disabled] di template — pengikatan
   * [disabled] pada kontrol reaktif memang tidak didengarkan Angular.
   */
  private sesuaikanToggle(): void {
    const kontrol = this.priceFormGroup.controls['save_price'];
    const boleh = !this.tanpaPerubahan && this.priceFormGroup.valid;
    if (boleh && kontrol.disabled) {
      kontrol.enable({ emitEvent: false });
    } else if (!boleh && kontrol.enabled) {
      kontrol.setValue(false, { emitEvent: false });
      kontrol.disable({ emitEvent: false });
    }
  }

  get tanpaPerubahan(): boolean {
    const v = this.priceFormGroup.getRawValue();
    return (
      Number(v.initial_price) === Number(v.price) &&
      Number(v.initial_discount) === Number(v.discount)
    );
  }

  /** Harga setelah diskon — pratinjau hidup di bawah isian. */
  get hargaBersih(): number {
    const v = this.priceFormGroup.getRawValue();
    return Number(v.price ?? 0) - Number(v.discount ?? 0);
  }

  batal(): void {
    this.sheet.dismiss();
  }

  updatePrice(): void {
    /* getRawValue: save_price yang sedang mati tetap harus terkirim false. */
    this.sheet.dismiss(this.priceFormGroup.getRawValue());
  }
}

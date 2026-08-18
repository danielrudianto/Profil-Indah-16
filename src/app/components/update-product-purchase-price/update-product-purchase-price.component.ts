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
import { NgIf } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

/**
 * Lembar bawah pengubah harga beli & diskon satu baris — kembaran
 * update-product-sales-price di sisi pembelian.
 *
 * Dulu berbentuk MatDialog dan sudah yatim. Dihidupkan kembali sebagai bottom
 * sheet untuk buat penerimaan barang dan ubah faktur pembelian: dua kolom
 * isian harga di tabel membuat tabelnya harus digulir mendatar, jadi harga
 * dan diskon pindah ke sini.
 *
 * Diskon bisa diketik dalam rupiah ATAU persen — keduanya saling menghitung,
 * karena supplier menyebut diskonnya dalam dua bahasa itu bergantian.
 */
@Component({
  selector: 'app-update-product-purchase-price',
  templateUrl: './update-product-purchase-price.component.html',
  styleUrls: ['./update-product-purchase-price.component.scss'],
  imports: [
    NgIf,
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
export class UpdateProductPurchasePriceComponent implements OnInit {
  /**
   * Hanya peran 5 dan 7 yang boleh menimpa harga di master barang.
   * Batas yang sama dijaga administratorMiddleware di server; yang di sini
   * hanya supaya pilihan yang pasti ditolak tidak ditawarkan lebih dulu.
   */
  bolehSimpanKeMaster = inject(AuthService).isAdministrator();

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private sheet: MatBottomSheetRef<UpdateProductPurchasePriceComponent>,
  ) {}

  priceFormGroup: FormGroup = new FormGroup({
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
    discount: new FormControl(0, [Validators.required, Validators.min(0)]),
    discountPercentage: new FormControl(0, [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
    initial_price: new FormControl(0),
    initial_discount: new FormControl(0),
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
  }

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
  }

  get tanpaPerubahan(): boolean {
    const v = this.priceFormGroup.value;
    return (
      Number(v.initial_price) === Number(v.price) &&
      Number(v.initial_discount) === Number(v.discount)
    );
  }

  updatePrice(): void {
    this.sheet.dismiss(this.priceFormGroup.value);
  }
}

import { Component, Inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { NgFor, NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Lembar bawah pemilih metode pembayaran — sistem desain Nocturne, seturut
 * lembar harga. Daftarnya dioper pemanggil lewat MAT_BOTTOM_SHEET_DATA,
 * jadi tidak ada pemuatan di sini; ikon uang SVG yang dulu diulang di tiap
 * baris dibuang — nama dan keterangannya sudah cukup bercerita.
 */
@Component({
  selector: 'app-payment-selector',
  templateUrl: './payment-selector.component.html',
  styleUrls: ['./payment-selector.component.scss'],
  imports: [NgFor, NgIf, TranslatePipe],
})
export class PaymentSelectorComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private sheet: MatBottomSheetRef<PaymentSelectorComponent>,
  ) {}

  selectPayment(payment: any): void {
    this.sheet.dismiss(payment);
  }
}

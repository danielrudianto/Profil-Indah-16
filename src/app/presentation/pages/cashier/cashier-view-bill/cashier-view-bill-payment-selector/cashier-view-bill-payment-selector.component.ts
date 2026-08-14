import { Component, Inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';

@Component({
    selector: 'app-cashier-view-bill-payment-selector',
    templateUrl: './cashier-view-bill-payment-selector.component.html',
    styleUrls: ['./cashier-view-bill-payment-selector.component.css'],
    standalone: false
})
export class CashierViewBillPaymentSelectorComponent {
  constructor(
    private sheet: MatBottomSheetRef<CashierViewBillPaymentSelectorComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any
  ) {}

  selectPayment(payment: any) {
    this.sheet.dismiss(payment);
  }
}

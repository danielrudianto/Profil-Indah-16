import { Component, Inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-payment-selector',
  templateUrl: './payment-selector.component.html',
  styleUrls: ['./payment-selector.component.css'],
})
export class PaymentSelectorComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private sheet: MatBottomSheetRef<PaymentSelectorComponent>
  ) {}

  ngOnInit(): void {}

  selectPayment(payment: any) {
    this.sheet.dismiss(payment);
  }
}

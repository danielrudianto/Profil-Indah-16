import { Component, Inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { NgIf, NgFor } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-payment-selector',
    templateUrl: './payment-selector.component.html',
    styleUrls: ['./payment-selector.component.css'],
    imports: [NgIf, MatProgressSpinner, NgFor]
})
export class PaymentSelectorComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private sheet: MatBottomSheetRef<PaymentSelectorComponent>
  ) {}

  payments: any[] = [];
  isLoading: boolean = false;

  ngOnInit(): void {}

  selectPayment(payment: any) {
    this.sheet.dismiss(payment);
  }
}

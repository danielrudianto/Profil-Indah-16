import { Component, Inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-payment-selector',
  templateUrl: './payment-selector.component.html',
  styleUrls: ['./payment-selector.component.css'],
})
export class PaymentSelectorComponent {
  constructor(
    private sheet: MatBottomSheetRef<PaymentSelectorComponent>,
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  payments: any[] = [];
  isLoading: boolean = false;

  ngOnInit(): void {
    this.fetchPaymentMethods();
  }

  fetchPaymentMethods(): void {
    this.isLoading = true;
    this.apiService
      .get('payment-method/all', {})
      .subscribe({
        next: (data: any) => {
          this.payments = data.data;
          this.payments.unshift({
            id: 0,
            name: 'Cash',
            description: 'Cash payment',
          });
        },
        error: (error) => {
          this.alertService.showError(error);
          this.sheet.dismiss();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  selectPayment(payment: any) {
    this.sheet.dismiss(payment);
  }
}

import { Component, Inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DeleteConfirmationComponent } from '../delete-confirmation/delete-confirmation.component';
import { DatePipe, DecimalPipe, NgIf, NgFor } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-payment-list',
    templateUrl: './payment-list.component.html',
    styleUrls: ['./payment-list.component.css'],
    imports: [NgIf, MatProgressSpinner, NgFor, MatIconButton, MatIcon, DecimalPipe]
})
export class PaymentListComponent {
  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private apiService: ApiService,
    private alertService: AlertService,
    private sheet: MatBottomSheetRef<PaymentListComponent>,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe
  ) {}

  isLoading: boolean = true;
  isSubmitting: boolean = false;
  dataSource: any[] = [];

  ngOnInit(): void {
    this.fetchPayments();
  }

  fetchPayments(): void {
    this.isLoading = true;
    this.apiService
      .get(`sales-invoice/payment/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.dataSource = data;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  openDeleteConfirmation(paymentData: any) {
    const dialog = this.dialog.open(DeleteConfirmationComponent, {
      data: {
        title: 'Are you sure you want to delete this payment?',
        document: `${
          paymentData.payment_method == null
            ? 'Cash'
            : paymentData.payment_method.name
        } - ${this.datePipe.transform(
          paymentData.date,
          'dd MMMM YYYY'
        )} - Rp. ${this.decimalPipe.transform(paymentData.value, '0.2-2')}`,
      },
    });

    dialog.afterClosed().subscribe({
      next: (data) => {
        if (data == true) {
          this.isSubmitting = true;
          this.apiService
            .delete(`sales-invoice/payment/${paymentData.id}`)
            .subscribe({
              next: () => {},
              error: (error) => {},
            });
        }
      },
    });
  }
}

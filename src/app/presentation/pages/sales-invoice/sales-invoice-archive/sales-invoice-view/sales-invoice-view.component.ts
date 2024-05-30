import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { PaymentListComponent } from 'src/app/presentation/components/payment-list/payment-list.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-sales-invoice-view',
  templateUrl: './sales-invoice-view.component.html',
  styleUrls: ['./sales-invoice-view.component.css'],
})
export class SalesInvoiceViewComponent {
  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private sheet: MatBottomSheet,
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  @Input('data') data: any;
  @Output('close') close: EventEmitter<any> = new EventEmitter();
  isAdministrator: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDeleteConfirmation() {
    const dialog = this.dialog.open(DeleteConfirmationComponent, {
      data: {
        title: 'Are you sure to delete this sales invoice?',
        document: this.data.name,
      },
    });

    dialog.afterClosed().subscribe((data) => {
      if (data == true) {
        this.apiService.delete(`sales-invoice/${this.data.id}`).subscribe({
          next: () => {
            this.alertService.showSuccess(
              `Sales invoice ${this.data.name} deleted successfully`
            );
            this.close.emit();
          },
          error: (error) => {
            this.alertService.showError(error);
          },
        });
      }
    });
  }

  openPaymentModal() {
    this.sheet.open(PaymentListComponent, {
      data: {
        id: this.data.id,
      },
    });
  }
}

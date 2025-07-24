import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { PaymentListComponent } from 'src/app/presentation/components/payment-list/payment-list.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-sales-invoice-view',
  templateUrl: './sales-invoice-view.component.html',
  styleUrls: ['./sales-invoice-view.component.css'],
})
export class SalesInvoiceViewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private authService: AuthService,
    private dialog: MatDialog,
    private sheet: MatBottomSheet,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<SalesInvoiceViewComponent>,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe
  ) {}

  isAdministrator: boolean = false;
  isLoading: boolean = false;
  dataSource: any;

  step = signal(0);

  salesInvoiceFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    sales: new FormControl(''),
    date: new FormControl('', Validators.required),
    customer: new FormControl(''),
    status: new FormControl(''),
  });

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.fetchByID();
  }

  openDeleteConfirmation() {
    const dialog = this.dialog.open(DeleteConfirmationComponent, {
      data: {},
    });

    dialog.afterClosed().subscribe((data) => {
      if (data == true) {
        this.apiService.delete(`sales-invoice/${this.data.id}`).subscribe({
          next: () => {
            this.alertService.showSuccess(
              this.translateService.instant('sales-invoice__delete__success')
            );
            this.dialogRef.close();
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

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`sales-invoice/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.dataSource = data;
          this.salesInvoiceFormGroup.patchValue({
            date: this.datePipe.transform(data.date, 'dd MMMM YYYY'),
            name: data.name,
            sales: data.sales == null ? 'INTERNAL' : data.sales.toUpperCase(),
            customer: data.customer == null ? 'Retail' : data.customer.name,
            status: data.is_delete
              ? this.translateService.instant(
                  'sales-invoice__archive__view__status__deleted'
                )
              : data.is_confirm
              ? this.translateService.instant(
                  'sales-invoice__archive__view__status__confirmed'
                )
              : this.translateService.instant(
                  'sales-invoice__archive__view__status__pending'
                ),
          });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  getDiscountPercentage(discount: number, price: number) {
    if (price == 0) {
      return '0%';
    } else {
      return `${this.decimalPipe.transform(
        (discount * 100) / price,
        '1.2-2'
      )}%`;
    }
  }

  setStep(index: number) {
    this.step.set(index);
  }

  nextStep() {
    this.step.update((i) => i + 1);
  }

  prevStep() {
    this.step.update((i) => i - 1);
  }
}

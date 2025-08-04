import { DatePipe, DecimalPipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
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
    @Inject(MAT_DIALOG_DATA) public data: { id: number; noAction: boolean },
    private authService: AuthService,
    private dialog: MatDialog,
    private sheet: MatBottomSheet,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<SalesInvoiceViewComponent>,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private formBuilder: FormBuilder
  ) {}

  isAdministrator: boolean = false;
  isLoading: boolean = false;

  step = signal(0);

  salesInvoiceFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    sales: new FormControl(''),
    date: new FormControl('', Validators.required),
    customer: new FormControl(''),
    status: new FormControl(''),
    createdBy: new FormControl('', Validators.required),
    createdAt: new FormControl('', Validators.required),
    discount: new FormControl(0, Validators.required),
    service: new FormControl(0, Validators.required),
    delivery: new FormControl(0, Validators.required),
    sales_invoice: new FormArray([]),
    sales_invoice_payment: new FormArray([]),
  });

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.fetchByID();
  }

  openDeleteConfirmation() {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'sales-invoice__archive__view__delete__title'
          ),
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === true) {
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
          data.sales_invoice.forEach((x: any) => {
            this.t.push(
              this.formBuilder.group({
                id: [x.id],
                price: [x.price],
                quantity: [x.quantity],
                discount: [x.discount],
                product_id: [x.product_id],
                product_unit_id: [x.product_unit_id],
                reference: [x.product.reference],
                description: [x.product.description],
                unit: [
                  x.product_unit == null ? x.product.unit : x.product_unit.unit,
                ],
              })
            );
          });

          data.sales_invoice_payment.forEach((x: any) => {
            this.u.push(
              this.formBuilder.group({
                id: [x.id],
                date: [x.date],
                payment_method: [x.payment_method],
                amount: [x.amount],
              })
            );
          });

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
            delivery: data.delivery,
            discount: data.discount,
            service: data.service,
            createdBy: data.user_bill_code_created_byTouser.name,
            createdAt: this.datePipe.transform(data.createdAt, 'dd MMMM YYYY'),
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

  get f() {
    return this.salesInvoiceFormGroup.controls;
  }

  get t() {
    return this.f['sales_invoice'] as FormArray;
  }

  get u() {
    return this.f['sales_invoice_payment'] as FormArray;
  }

  get subtotal(): number {
    return this.t.value.reduce((a: any, b: any) => {
      return a + b.quantity * (b.price - b.discount);
    }, 0);
  }

  get grandTotal(): number {
    const discount = Number(
      this.salesInvoiceFormGroup.controls['discount'].value
    );
    const service = Number(
      this.salesInvoiceFormGroup.controls['service'].value
    );
    const delivery = Number(
      this.salesInvoiceFormGroup.controls['delivery'].value
    );

    return this.subtotal + delivery + service - discount;
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

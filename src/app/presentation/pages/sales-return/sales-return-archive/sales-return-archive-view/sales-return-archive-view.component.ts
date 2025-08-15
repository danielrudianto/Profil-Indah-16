import { Component, Inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { AlertService } from '../../../../../services/alert.service';
import { ApiService } from '../../../../../services/api.service';
import { AuthService } from '../../../../../services/auth.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';

@Component({
  selector: 'app-sales-return-archive-view',
  templateUrl: './sales-return-archive-view.component.html',
  styleUrls: ['./sales-return-archive-view.component.css'],
})
export class SalesReturnArchiveViewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<SalesReturnArchiveViewComponent>,
    private alertService: AlertService,
    private apiService: ApiService,
    private authService: AuthService,
    private datePipe: DatePipe,
    private translateService: TranslateService,
    private formBuilder: FormBuilder
  ) {}

  isAdministrator: boolean = false;
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  step = signal(0);

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.fetchByID();
  }

  salesReturnFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    status: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    invoice_name: new FormControl('', Validators.required),
    invoice_date: new FormControl('', Validators.required),
    customer: new FormControl('', Validators.required),
    sales: new FormControl('', Validators.required),
    createdBy: new FormControl('', Validators.required),
    createdAt: new FormControl('', Validators.required),
    sales_return: new FormArray([]),
    payment_method: new FormControl(''),
  });

  get f() {
    return this.salesReturnFormGroup.controls;
  }

  get t() {
    return this.f['sales_return'] as FormArray;
  }

  fetchByID() {
    this.isLoading = true;
    this.apiService
      .get('sales-return/' + this.data.id, {})
      .subscribe({
        next: (data: any) => {
          this.salesReturnFormGroup.patchValue({
            id: data.id,
            name: data.name,
            date: this.datePipe.transform(data.date, 'dd MMMM YYYY'),
            invoice_name: data.sales_invoice_code.name,
            invoice_date: this.datePipe.transform(
              data.sales_invoice_code.date,
              'dd MMMM YYYY'
            ),
            customer:
              data.sales_invoice_code.customer == null
                ? 'Retail'
                : data.sales_invoice_code.customer.name,
            sales:
              data.sales_invoice_code.sales == null
                ? 'INTERNAL'
                : data.sales_invoice_code.sales,
            isDelete: data.is_delete,
            status: data.is_delete
              ? this.translateService.instant('sales-return__status__deleted')
              : this.translateService.instant('sales-return__status__active'),
            createdBy: data.user_sales_return_code_created_byTouser.name,
            createdAt: this.datePipe.transform(data.created_at, 'dd MMMM YYYY'),
            payment_method:
              data.payment_method == null ? 'Cash' : data.payment_method.name,
          });

          data.sales_return.forEach((x: any) => {
            this.t.push(
              this.formBuilder.group({
                id: [x.id],
                product_id: [x.sales_invoice.product_id],
                product_unit_id: [x.sales_invoice.product_unit_id],
                reference: [x.sales_invoice.product.reference],
                description: [x.sales_invoice.product.description],
                quantity: [x.quantity],
                price: [x.sales_invoice.price],
                discount: [x.sales_invoice.discount],
                unit: [
                  x.sales_invoice.product_unit == null
                    ? x.sales_invoice.product.unit
                    : x.sales_invoice.product_unit.unit,
                ],
                conversion: [
                  x.sales_invoice.product_unit == null
                    ? 1
                    : x.sales_invoice.product_unit.conversion,
                ],
              })
            );
          });
        },
        error: (error) => {
          this.alertService.showError(error);
          this.dialogRef.close();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
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

  get subtotal() {
    return this.t.value.reduce((a: any, b: any) => {
      return a + b.quantity * (b.price - b.discount);
    }, 0);
  }

  delete() {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant('sales-return__delete__message'),
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data == true) {
          this.isSubmitting = true;
          this.apiService
            .delete(`sales-return/${this.data.id}`)
            .subscribe({
              next: (_) => {
                this.dialogRef.close('deleted');
              },
              error: (error) => {
                this.alertService.showError(error);
              },
            })
            .add(() => {
              this.isSubmitting = false;
            });
        }
      });
  }
}

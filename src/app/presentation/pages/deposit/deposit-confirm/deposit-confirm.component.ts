import { DatePipe, Location, NgIf, NgFor, DecimalPipe } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { Subject } from 'rxjs';
import { CustomerModel } from 'src/app/models/customer.model';
import { PaymentSelectorComponent } from 'src/app/presentation/components/payment-selector/payment-selector.component';
import { SalesmanSelectorComponent } from 'src/app/presentation/components/salesman-selector/salesman-selector.component';
import { UpdateProductSalesPriceComponent } from 'src/app/presentation/components/update-product-sales-price/update-product-sales-price.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { v4 } from 'uuid';
import { DepositConfirmUpdatePaymentComponent } from './deposit-confirm-update-payment/deposit-confirm-update-payment.component';
import { MatDialog } from '@angular/material/dialog';
import { VerticalDividerComponent } from '../../../components/vertical-divider/vertical-divider.component';
import { BoxStepperComponent } from '../../../components/box-stepper/box-stepper.component';
import { MatFormField, MatLabel, MatSuffix, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { NgxMaskDirective } from 'ngx-mask';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-deposit-confirm',
    templateUrl: './deposit-confirm.component.html',
    styleUrls: ['./deposit-confirm.component.css'],
    imports: [VerticalDividerComponent, BoxStepperComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, NgIf, NgFor, EmptyTableComponent, NgxMaskDirective, MatPrefix, MatButton, MatIconButton, MatIcon, DecimalPipe, DatePipe, TranslateModule]
})
export class DepositConfirmComponent {
  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private apiService: ApiService,
    private _hotkeysService: HotkeysService,
    private router: Router,
    private datePipe: DatePipe,
    private sheet: MatBottomSheet,
    private dynamicComponentService: DynamicComponentService,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private location: Location,
    private dialog: MatDialog
  ) {
    this._hotkeysService.add([
      new Hotkey('alt+s', (event: KeyboardEvent): boolean => {
        this.submitForm();
        return false;
      }),
    ]);

    const url = this.router.url;
    this.isAdministrator = url.split('/')[1] == 'Administrator';
  }

  salesmen: string[] = [];
  isSubmitting: boolean = false;
  isAdministrator: boolean = false;
  paymentOptions: any[] = [];

  checkDiscount: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    let total = parseFloat(group.get('total')?.value ?? 0);
    let discount = parseFloat(group.get('discount')?.value ?? 0);
    return discount <= total ? null : { error: true };
  };

  validateTotal: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const total = Number(group.get('total')?.value);
    const service = Number(group.get('service')?.value);
    const discount = Number(group.get('discount')?.value);
    const delivery = Number(group.get('delivery')?.value);

    const grand = total + delivery + service - discount;

    if (grand <= 0) {
      return {
        sales: true,
      };
    } else {
      return null;
    }
  };

  NotZero: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    return Number(control.value) != 0 ? null : { error: true };
  };

  metaFormGroup: FormGroup = new FormGroup({
    uuid: new FormControl(v4()),
    name: new FormControl('', Validators.required),
    customer: new FormControl('Retail customer', Validators.required),
    customer_id: new FormControl(0, Validators.required),
    date: new FormControl(new Date(), Validators.required),
    sales: new FormControl('', Validators.required),
  });

  billFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
  });

  paymentsFormGroup: FormGroup = new FormGroup({
    sales_invoice_payment: new FormArray([]),
    sales_deposit_payment: new FormArray([]),
  });

  valueFormGroup: FormGroup = new FormGroup(
    {
      discount: new FormControl(0, [Validators.required, Validators.min(0)]),
      delivery: new FormControl(0, [Validators.required, Validators.min(0)]),
      service: new FormControl(0, [Validators.required, Validators.min(0)]),
      before: new FormControl(0, [Validators.required, Validators.min(0)]),
      total: new FormControl(0, [Validators.required, Validators.min(0)]),
    },
    {
      validators: this.validateTotal,
    }
  );

  @ViewChild('trigger') trigger: MatAutocompleteTrigger | undefined;
  @ViewChild('input') input: any;

  ngOnInit(): void {
    const id = this.activatedRoute.snapshot.params['id'];

    this.apiService.get(`sales-deposit/${id}`).subscribe({
      next: (result: any) => {
        if (result.is_delete) {
          this.alertService.showSuccess(
            this.translateService.instant('deposit__confirm__already-confirmed')
          );
          this.location.back();
          return;
        }

        // Set up the meta data from deposit
        this.metaFormGroup.patchValue({
          customer: result.customer == null ? 'Retail' : result.customer.name,
          customer_id: result.customer_id == null ? 0 : result.customer_id,
          name: result.name,
          sales: result.sales == null ? 'INTERNAL' : result.sales,
        });

        this.valueFormGroup.patchValue({
          discount: result.discount,
          delivery: result.delivery,
          service: result.service,
          before: result.sales_deposit.reduce((a: any, b: any) => {
            return a + b.price * b.quantity;
          }, 0),
          total: result.sales_deposit.reduce((a: any, b: any) => {
            return a + (b.price - b.discount) * b.quantity;
          }, 0),
        });

        // Insert the items to the form Array
        (result.sales_deposit as any[]).forEach((x) => {
          this.t.push(
            this.formBuilder.group({
              id: [x.id],
              product_id: [x.product_id],
              reference: [x.product.reference],
              description: [x.product.description],
              quantity: [
                Number(x.quantity),
                [Validators.required, Validators.min(0.1)],
              ],
              price: [
                Number(x.price),
                [Validators.required, Validators.min(0)],
              ],
              discount: [
                Number(x.discount),
                [Validators.required, Validators.min(0)],
              ],
              unit: [
                x.product_unit_id == null
                  ? x.product.unit
                  : x.product_unit.unit,
              ],
              conversion: [
                x.product_unit_id == null ? 1 : x.product_unit.conversion,
              ],
              default_unit: [
                x.product_unit == null ? x.product.unit : x.product_unit.unit,
              ],
            })
          );
        });

        // Insert the payments to the form Array
        result.sales_deposit_payment.forEach((item: any) => {
          this.sales_deposit_payment.push(
            this.formBuilder.group({
              id: [item.id, Validators.required],
              payment_method_id: [item.payment_method_id],
              date: new FormControl(item.date, Validators.required),
              payment_method_name: [
                item.payment_method == null ? 'Cash' : item.payment_method.name,
                Validators.required,
              ],
              payment_method_description: [
                item.payment_method == null
                  ? ''
                  : item.payment_method.description,
              ],
              value: [item.value, [Validators.required, Validators.min(0.01)]],
            })
          );
        });
      },
    });

    this.apiService
      .get('payment-method/all', {
        keyword: '',
        page: 1,
      })
      .subscribe({
        next: (data: any) => {
          this.paymentOptions = data;
        },
      });
  }

  get f() {
    return this.billFormGroup.controls;
  }
  get t() {
    return this.f['items'] as FormArray;
  }

  get g() {
    return this.paymentsFormGroup.controls;
  }

  get sales_invoice_payment() {
    return this.g['sales_invoice_payment'] as FormArray;
  }

  get sales_deposit_payment() {
    return this.g['sales_deposit_payment'] as FormArray;
  }

  get totalPayment(): number {
    return (
      this.sales_invoice_payment.controls.reduce((a, b) => {
        return a + Number(b.get('amount')?.value);
      }, 0) +
      this.sales_deposit_payment.controls.reduce((a, b) => {
        return a + Number(b.get('amount')?.value);
      }, 0)
    );
  }

  get isAllChecked(): boolean {
    return this.t.controls.every((item) => item.get('checked')?.value);
  }

  /**
   * Calculates the total bill based on the inputted value.
   * @returns The total bill, including delivery and service fee, but
   *          excluding discount.
   */
  get totalBill() {
    // Calculate the total bill by adding the total value, delivery fee,
    // and service fee. Then, subtract the discount from the result.
    return (
      this.valueFormGroup.controls['total'].value +
      this.valueFormGroup.controls['delivery'].value +
      this.valueFormGroup.controls['service'].value -
      this.valueFormGroup.controls['discount'].value
    );
  }

  openPaymentSelector() {
    this.sheet
      .open(PaymentSelectorComponent, {
        data: this.paymentOptions,
      })
      .afterDismissed()
      .subscribe((data) => {
        if (data) {
          const exists = this.checkExistingPayment(data.id);
          if (exists) {
            this.alertService.showSuccess(
              this.translateService.instant('general__payment__exists')
            );
            return;
          }

          this.sales_invoice_payment.push(
            this.formBuilder.group({
              payment_method_id: [data.id, Validators.required],
              name: [data.name, Validators.required],
              description: [data.description, Validators.required],
              date: new FormControl(new Date(), Validators.required),
              value: [0, [Validators.required, Validators.min(0.01)]],
            })
          );
        }
      });
  }

  private checkExistingPayment(paymentMethodID: number | null) {
    const existing = this.sales_invoice_payment.controls.filter((x) => {
      return x.get('payment_method_id')?.value == paymentMethodID;
    });

    return existing.length > 0;
  }

  updatePaymentMethod(i: number) {
    this.dialog
      .open(DepositConfirmUpdatePaymentComponent, {
        data: this.sales_invoice_payment.at(i).value,
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.sales_invoice_payment.at(i).patchValue({
            value: Number(data.value),
            date: new Date(data.date),
          });
        }
      });
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  getFormGroupAtPayment(i: number) {
    return this.sales_deposit_payment.at(i) as FormGroup;
  }

  getFormGroupAtNewPayment(i: number) {
    return this.sales_invoice_payment.at(i) as FormGroup;
  }

  deletePayment(i: number) {
    this.sales_invoice_payment.removeAt(i);
  }

  get isFormValid(): boolean {
    let validation = true;
    if (!this.metaFormGroup.valid) {
      validation = false;
    }

    if (!this.valueFormGroup.valid) {
      validation = false;
    }

    if (!this.paymentsFormGroup.valid) {
      validation = false;
    }

    if (this.totalPayment > this.totalBill) {
      validation = false;
    }

    return validation;
  }

  get isPaymentFormGroupValid(): boolean {
    let validation = true;

    if (this.totalPayment > this.totalBill) {
      validation = false;
    }
    return validation;
  }

  submitForm() {
    this.isSubmitting = true;

    // If total payment is greater than total bill then show error
    if (this.totalPayment > this.totalBill) {
      this.alertService.showError('deposit__confirm__total-payment');
      this.isSubmitting = false;
      return;
    }

    this.apiService
      .post('sales-deposit/confirm', {
        id: Number(this.activatedRoute.snapshot.params['id']),
        date: this.datePipe.transform(
          this.metaFormGroup.controls['date'].value,
          'yyyy-MM-dd'
        ),
        sales_invoice_payment: [
          ...this.sales_deposit_payment.controls.map((x) => {
            return {
              payment_method_id: x.get('payment_method_id')?.value,
              value: Number(x.get('value')?.value),
              date: this.datePipe.transform(x.get('date')?.value, 'yyyy-MM-dd'),
            };
          }),
          ...this.sales_invoice_payment.controls.map((x) => {
            return {
              date: this.datePipe.transform(x.get('date')?.value, 'yyyy-MM-dd'),
              payment_method_id: x.get('payment_method_id')?.value,
              value: Number(x.get('value')?.value),
            };
          }),
        ],
        is_paid: this.totalPayment == this.totalBill,
      })
      .subscribe({
        next: (_) => {
          this.alertService.showSuccess(
            this.translateService.instant('deposit__confirm__success')
          );
          this.location.back();
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  canExit() {
    if (
      this.billFormGroup.dirty ||
      this.metaFormGroup.dirty ||
      this.valueFormGroup.dirty
    ) {
      if (
        confirm('All input will be deleted. Are you sure to exit this page?')
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
}

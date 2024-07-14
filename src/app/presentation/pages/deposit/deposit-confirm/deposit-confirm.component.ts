import { DatePipe, Location } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { Subject } from 'rxjs';
import { Customer } from 'src/app/models/customer.model';
import { PaymentSelectorComponent } from 'src/app/presentation/components/payment-selector/payment-selector.component';
import { SalesmanSelectorComponent } from 'src/app/presentation/components/salesman-selector/salesman-selector.component';
import { UpdateProductSalesPriceComponent } from 'src/app/presentation/components/update-product-sales-price/update-product-sales-price.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { v4 } from 'uuid';

@Component({
  selector: 'app-deposit-confirm',
  templateUrl: './deposit-confirm.component.html',
  styleUrls: ['./deposit-confirm.component.css'],
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
    private location: Location
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
  customerOptions: Customer[] = [];
  paymentOptions: any[] = [];
  unit_selection: any[] = [];
  productSelectorSubject: Subject<any> = new Subject();

  checkDiscount: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    let total = parseFloat(group.get('total')?.value ?? 0);
    let discount = parseFloat(group.get('discount')?.value ?? 0);
    return discount <= total ? null : { error: true };
  };

  NotZero: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    return Number(control.value) != 0 ? null : { error: true };
  };

  /**
   * This is the form group for the metadata of the deposit.
   * It contains the following controls:
   *
   * - `uuid`: A unique identifier for the deposit. It is auto-generated using the `uuid` library.
   * - `customer`: The name of the customer. It is a required field.
   * - `customer_id`: The ID of the customer. It is a required field.
   * - `date`: The date of the deposit. It is a required field.
   */
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
    number_of_items: new FormControl(0, [
      Validators.required,
      Validators.min(1),
    ]),
  });

  paymentsFormGroup: FormGroup = new FormGroup({
    immediate_payment: new FormControl(false),
    due_time: new FormControl(30, [Validators.required, Validators.min(0)]),
    payments: new FormArray([]),
    billPayments: new FormArray([]),
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
      validators: this.checkDiscount,
    }
  );

  @ViewChild('trigger') trigger: MatAutocompleteTrigger | undefined;
  @ViewChild('input') input: any;

  ngOnInit(): void {
    this.p.valueChanges.subscribe(() => {
      console.log(this.p.controls);
    });

    this.apiService
      .get(`deposit/${this.activatedRoute.snapshot.params['id']}`)
      .subscribe({
        next: (result: any) => {
          if (result.is_delete) {
            this.alertService.showSuccess(
              this.translateService.instant(
                'deposit__confirm__already-confirmed'
              )
            );
            this.location.back();
            return;
          }

          // Set up the meta data from deposit
          this.metaFormGroup.patchValue({
            customer:
              result.customer == null
                ? 'Retail customer'
                : result.customer.name,
            customer_id: result.customer_id == null ? 0 : result.customer_id,
            name: result.name,
            sales: result.sales == null ? 'INTERNAL' : result.sales,
          });

          this.valueFormGroup.patchValue({
            discount: result.discount,
            delivery: result.delivery,
            service: result.service,
          });

          // Insert the items to the form Array
          (result.deposit as any[]).forEach((x) => {
            this.t.push(
              this.formBuilder.group({
                id: [x.id],
                checked: [true],
                package_code_id: [x.package_code_id],
                item_id: [x.item_id],
                reference: [
                  x.item_id != null ? x.item.reference : x.package_code.name,
                ],
                description: [
                  x.item_id != null
                    ? x.item.description
                    : x.package_code.description,
                ],
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
                package_content: [
                  x.package_code_id == null
                    ? null
                    : x.package_code.package_content,
                ],
                unit: [
                  x.item_id == null
                    ? null
                    : x.item_unit == null
                    ? x.item.unit
                    : x.item_unit.unit,
                ],
                conversion: [
                  x.item_id == null
                    ? null
                    : x.item_unit == null
                    ? 1
                    : x.item_unit.conversion,
                ],
                default_unit: [x.item_id == null ? null : x.item.unit],
              })
            );
          });

          // Insert the payments to the form Array
          result.deposit_payment.forEach((item: any) => {
            this.pb.push(
              this.formBuilder.group({
                id: [item.id, Validators.required],
                payment_method_id: [item.payment_method_id],
                date: new FormControl(item.date, Validators.required),
                payment_method_name: [
                  item.payment_method == null
                    ? 'Cash'
                    : item.payment_method.name,
                  Validators.required,
                ],
                payment_method_description: [
                  item.payment_method == null
                    ? ''
                    : item.payment_method.description,
                ],
                amount: [
                  item.value,
                  [Validators.required, Validators.min(0.01)],
                ],
                usedAmount: [
                  item.value,
                  [
                    Validators.required,
                    Validators.min(0.01),
                    Validators.max(item.value),
                  ],
                ],
              })
            );
          });

          // Listen to change in checked items
          this.t.valueChanges.subscribe((_) => {
            if (this.isAllChecked) {
              // Set all deposit payment to value instead of used
              this.p.controls.forEach((x) => {
                x.patchValue({
                  usedAmount: x.get('amount')?.value,
                });
              });
            }
          });

          this.paymentsFormGroup.controls[
            'immediate_payment'
          ].valueChanges.subscribe({
            next: (value) => {
              if (value) {
                this.paymentsFormGroup.controls['due_time'].setValue(30);
              } else {
                this.paymentsFormGroup.controls['due_time'].setValue(30);
                this.p.clear();
              }
            },
          });
        },
      });

    this.t.valueChanges.subscribe((data) => {
      this.billFormGroup.patchValue({
        number_of_items: this.t.controls.filter((x) => x.get('checked')!.value)
          .length,
      });

      const totalBeforeDiscount = this.t.controls
        .filter((x) => x.get('checked')!.value)
        .reduce((a: any, b: any) => {
          return a + b.get('price')!.value * b.get('quantity')!.value;
        }, 0);

      const totalAfterDiscount = this.t.controls
        .filter((x) => x.get('checked')!.value)
        .reduce((a: any, b: any) => {
          return (
            a +
            (b.get('price')!.value - b.get('discount')!.value) *
              b.get('quantity')!.value
          );
        }, 0);

      this.valueFormGroup.patchValue({
        total: totalAfterDiscount,
        before: totalBeforeDiscount,
      });
    });

    this.paymentsFormGroup.controls['immediate_payment'].valueChanges.subscribe(
      (data) => {
        if (data) {
          this.paymentsFormGroup.patchValue({
            due_time: 30,
          });
          this.p.clear();
        } else {
          this.paymentsFormGroup.patchValue({
            due_time: 30,
          });
        }
      }
    );
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

  get p() {
    return this.g['payments'] as FormArray;
  }

  get pb() {
    return this.g['billPayments'] as FormArray;
  }

  get totalPayment(): number {
    let payment = 0;
    this.pb.controls.forEach((x) => {
      payment += Number(x.get('usedAmount')?.value);
    });

    this.p.controls.forEach((x) => {
      payment += Number(x.get('payment_value')?.value);
    });

    return payment;
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

  get subTotalBill(): number {
    // Calculate the total bill by adding the total value, delivery fee,
    return this.t.controls.reduce((acc, curr) => {
      if (curr.get('checked')?.value) {
        return (
          acc +
          Number(curr.get('quantity')?.value) *
            (curr.get('price')?.value - curr.get('discount')?.value)
        );
      } else {
        return acc;
      }
    }, 0);
  }

  viewSalesman() {
    this.dynamicComponentService.createDynamicComponent(
      SalesmanSelectorComponent,
      {}
    );
  }

  openPaymentSelector() {
    const sheet = this.sheet.open(PaymentSelectorComponent, {});

    sheet.afterDismissed().subscribe({
      next: (data) => {
        if (data != undefined && data != null) {
          if (
            this.pb.controls.filter(
              (x) => x.get('payment_method_id')?.value == data.id
            ).length > 0
          ) {
            this.alertService.showSuccess(
              this.translateService.instant('general__payment__exists')
            );
            return;
          } else {
            this.p.push(
              this.formBuilder.group({
                payment_method_id: [data.id, Validators.required],
                name: [data.name, Validators.required],
                description: [data.description, Validators.required],
                date: new FormControl(new Date(), Validators.required),
                payment_value: [0, [Validators.required]],
              })
            );
          }
        }
      },
    });
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  getFormGroupAtPayment(i: number) {
    return this.p.at(i) as FormGroup;
  }

  getFormGroupAtNewPayment(i: number) {
    return this.pb.at(i) as FormGroup;
  }

  deleteItem(i: number) {
    this.t.removeAt(i);
    this.billFormGroup.patchValue({
      number_of_items: this.t.length,
    });
  }

  deletePayment(i: number) {
    this.pb.removeAt(i);
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

    // First check if the checked items is more than 1
    if (this.t.controls.filter((x) => x.get('checked')?.value).length < 1) {
      validation = false;
    }

    if (
      this.paymentsFormGroup.value['immediate_payment'] == true &&
      this.p.length == 0
    ) {
      validation = false;
    }

    if (this.totalPayment > this.totalBill) {
      validation = false;
    }

    return validation;
  }

  get isPaymentFormGroupValid(): boolean {
    let validation = true;
    if (
      this.paymentsFormGroup.value['immediate_payment'] == true &&
      this.pb.length == 0
    ) {
      validation = false;
    }

    if (this.totalPayment > this.totalBill) {
      validation = false;
    }
    return validation;
  }

  submitForm() {
    this.isSubmitting = true;

    // If there is no item checked then show error
    if (this.t.controls.filter((x) => x.get('checked')?.value).length < 1) {
      this.alertService.showError('deposit__confirm__no-item');
      this.isSubmitting = false;
      return;
    }

    // If total payment is greater than total bill then show error
    if (this.totalPayment > this.totalBill) {
      this.alertService.showError('deposit__confirm__total-payment');
      this.isSubmitting = false;
      return;
    }

    this.apiService
      .post('deposit/confirm', {
        id: Number(this.activatedRoute.snapshot.params['id']),
        date: this.datePipe.transform(
          this.metaFormGroup.controls['date'].value,
          'yyyy-MM-dd'
        ),
        deposit: this.t.controls.map((x) => {
          return {
            id: Number(x.value.id),
            checked: x.value.checked,
          };
        }),
        deposit_payment: this.pb.controls.map((item) => {
          return {
            id: item.value.id,
            payment_method_id: item.value.payment_method_id,
            value: Number(item.value.usedAmount),
            unused_value: Number(item.value.amount - item.value.usedAmount),
            date: this.datePipe.transform(item.value.date, 'yyyy-MM-dd'),
          };
        }),
        deposit_bill_payment: this.p.controls.map((item) => {
          return {
            payment_method_id: item.value.payment_method_id,
            value: item.value.payment_value,
            date: this.datePipe.transform(
              this.metaFormGroup.controls['date'].value,
              'yyyy-MM-dd'
            ),
          };
        }),
        is_paid: this.totalPayment == this.totalBill,
        payment_term:
          this.totalPayment == this.totalBill
            ? null
            : this.paymentsFormGroup.controls['due_time'].value,
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

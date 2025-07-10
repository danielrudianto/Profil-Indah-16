import { DatePipe } from '@angular/common';
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
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { Subject, debounceTime } from 'rxjs';
import { PackageSelectorComponent } from 'src/app/presentation/components/package-selector/package-selector.component';
import { PaymentSelectorComponent } from 'src/app/presentation/components/payment-selector/payment-selector.component';
import {
  ProductSelectorComponent,
  ProductSelectorType,
} from 'src/app/presentation/components/product-selector/product-selector.component';
import { SalesmanSelectorComponent } from 'src/app/presentation/components/salesman-selector/salesman-selector.component';
import { UpdatePackageSalesPriceComponent } from 'src/app/presentation/components/update-package-sales-price/update-package-sales-price.component';
import { UpdateProductSalesPriceComponent } from 'src/app/presentation/components/update-product-sales-price/update-product-sales-price.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { v4 } from 'uuid';

@Component({
  selector: 'app-sales-invoice-create',
  templateUrl: './sales-invoice-create.component.html',
  styleUrls: ['./sales-invoice-create.component.css'],
})
export class SalesInvoiceCreateComponent {
  constructor(
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private apiService: ApiService,
    private _hotkeysService: HotkeysService,
    private router: Router,
    private datePipe: DatePipe,
    private sheet: MatBottomSheet,
    private dynamicComponentService: DynamicComponentService,
    private translateService: TranslateService
  ) {
    this._hotkeysService.add([
      new Hotkey('alt+a', (event: KeyboardEvent): boolean => {
        this.openItemSelector();
        return false; // Prevent bubbling
      }),
      new Hotkey('alt+s', (event: KeyboardEvent): boolean => {
        if (
          this.billFormGroup.valid &&
          this.valueFormGroup.valid &&
          this.paymentsFormGroup.valid &&
          this.metaFormGroup.valid
        ) {
          this.submitForm();
        } else {
          console.error(`[error]: ${this.metaFormGroup.errors}`);
          this.alertService.showSuccess('Please check your input.');
        }
        return false;
      }),
    ]);

    const url = this.router.url;
    this.isAdministrator = url.split('/')[1] == 'Administrator';
  }

  salesmen: string[] = [];
  isSubmitting: boolean = false;
  isAdministrator: boolean = false;
  customerOptions: any[] = [];
  paymentOptions: any[] = [];
  unit_selection: any[] = [];
  productSelectorSubject: Subject<any> = new Subject();

  @ViewChild('trigger') trigger: MatAutocompleteTrigger | undefined;
  @ViewChild('input') input: any;

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

  onSelectCustomer(data: any) {
    this.metaFormGroup.patchValue({
      customer_id: data.id,
    });
  }

  /**
   * Clears the selected customer
   * When the customer is unselected, we want to clear the selected customer
   * from the form control.
   */
  onUnselectCustomer() {
    // Clear the selected customer from the form control
    this.metaFormGroup.patchValue({
      customer_id: null,
    });
  }

  metaFormGroup: FormGroup = new FormGroup({
    uuid: new FormControl(v4()),
    customer_id: new FormControl(0, Validators.required),
    date: new FormControl(new Date(), Validators.required),
    type: new FormControl('sales', [
      Validators.required,
      Validators.pattern('sales|deposit|deposit-internal'),
    ]),
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
    immediate_payment: new FormControl(true),
    due_time: new FormControl(30, [Validators.required, Validators.min(0)]),
    payments: new FormArray([]),
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

  get totalPayment() {
    if (!this.paymentsFormGroup.controls['immediate_payment'].value)
      return (
        this.valueFormGroup.controls['total'].value -
        this.valueFormGroup.controls['discount'].value +
        this.valueFormGroup.controls['delivery'].value +
        this.valueFormGroup.controls['service'].value
      );
    else {
      let total = 0;
      this.p.controls.forEach((x) => {
        total += Number(x.get('payment_value')?.value ?? 0);
      });

      return total;
    }
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

  viewSalesman() {
    this.dynamicComponentService.createDynamicComponent(
      SalesmanSelectorComponent,
      {}
    );
  }

  ngOnInit(): void {
    this.t.valueChanges.subscribe(() => {
      let totalPrice = 0;
      let netPrice = 0;
      if (this.t.controls.length > 0) {
        this.t.controls.forEach((x) => {
          if (x.get('package_code_id')) {
            const price = Number(x.get('price')?.value ?? '0');
            const quantity = Number(x.get('quantity')?.value ?? '0');

            totalPrice += quantity * price;
            netPrice += quantity * price;
          } else {
            const discount = Number(x.get('discount')?.value ?? '0');
            const price = Number(x.get('price')?.value ?? '0');
            const quantity = Number(x.get('quantity')?.value ?? '0');

            totalPrice += quantity * (price - discount);
            netPrice += quantity * price;
          }
        });

        this.valueFormGroup.patchValue({
          total: totalPrice,
          before: netPrice,
        });
      }
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

    this.metaFormGroup.controls['type'].valueChanges.subscribe((data) => {
      if (data == 'deposit') {
        // Set immediate payment to true
        // And then disable it
        this.paymentsFormGroup.patchValue({
          immediate_payment: true,
        });
        this.paymentsFormGroup.controls['immediate_payment'].enable();
      } else if (data == 'deposit-internal') {
        this.paymentsFormGroup.patchValue({
          immediate_payment: true,
        });
        this.p.clear();
      } else {
        this.paymentsFormGroup.controls['immediate_payment'].enable();
      }
    });

    this.metaFormGroup.controls['sales'].valueChanges
      .pipe(debounceTime(500))
      .subscribe((_) => {
        this.fetchSalesmen();
      });
  }

  fetchSalesmen() {
    this.apiService
      .get('sales-invoice/salesman', {
        keyword: this.metaFormGroup.controls['sales'].value,
        page: 1,
      })
      .subscribe({
        next: (data: any) => {
          this.salesmen = data;
        },
      });
  }

  openItemSelector() {
    this.productSelectorSubject =
      this.dynamicComponentService.createDynamicComponent(
        ProductSelectorComponent,
        {
          type: ProductSelectorType.sales,
        }
      );

    this.productSelectorSubject.subscribe((result: any) => {
      if (result) {
        let validation = true;
        const data = result.data;
        const sub = result.sub;
        const check = this.checkExistingProduct(
          data.id,
          sub == null ? null : sub.id
        );

        if (check) {
          return;
        }

        if (sub == null) {
          this.t.push(
            this.formBuilder.group({
              product_id: [data.id, Validators.required],
              product_unit_id: [null],
              reference: [data.reference],
              description: [data.description],
              quantity: [0, [Validators.required, Validators.min(0.01)]],
              initial_price: [
                data.sales_price,
                [Validators.required, Validators.min(0)],
              ],
              price: [
                data.sales_price,
                [Validators.required, Validators.min(0)],
              ],
              initial_discount: [
                data.sales_discount,
                [Validators.required, Validators.min(0)],
              ],
              discount: [
                data.sales_discount,
                [Validators.required, Validators.min(0)],
              ],
              unit: [data.unit],
              conversion: [1],
              default_unit: [data.unit],
              save_price: [false],
            })
          );
        } else {
          this.t.push(
            this.formBuilder.group({
              product_id: [data.id, Validators.required],
              product_unit_id: [sub.id],
              reference: [data.reference],
              description: [data.description],
              quantity: [0, [Validators.required, Validators.min(0.01)]],
              initial_price: [
                sub.sales_price,
                [Validators.required, Validators.min(0)],
              ],
              price: [
                sub.sales_price,
                [Validators.required, Validators.min(0)],
              ],
              initial_discount: [
                sub.sales_discount,
                [Validators.required, Validators.min(0)],
              ],
              discount: [
                sub.sales_discount,
                [Validators.required, Validators.min(0)],
              ],
              unit: [sub.unit],
              conversion: [sub.conversion],
              default_unit: [data.unit],
              save_price: [false],
            })
          );
        }

        this.billFormGroup.patchValue({
          number_of_items: this.t.length,
        });

        setTimeout(() => {
          const autofocusLength =
            document.querySelectorAll('[focusedInput]').length;
          const input =
            document.querySelectorAll('[focusedInput]')[autofocusLength - 1];
          (input as HTMLElement).focus();
        }, 100);
      } else {
        this.alertService.showSuccess(
          this.translateService.instant('general__item__exists')
        );
      }
    });
  }

  private checkExistingProduct(
    productID: number,
    productUnitID: number | null
  ) {
    const result = this.t.controls.findIndex((x) => {
      x.get('product_id')?.value == productID &&
        x.get('product_unit_id')?.value == productUnitID;
    });

    if (result == -1) {
      return false;
    }

    return true;
  }

  openPaymentSelector() {
    const sheet = this.sheet.open(PaymentSelectorComponent, {
      data: this.paymentOptions,
    });

    sheet.afterDismissed().subscribe({
      next: (data) => {
        if (
          this.p.controls.filter(
            (x) => x.get('payment_type_id')?.value == data.id
          ).length > 0
        ) {
          this.alertService.showSuccess('Payment already exists!');
          return;
        } else {
          if (this.p.length == 0) {
            const requiredPayment =
              this.valueFormGroup.controls['total'].value -
              this.valueFormGroup.controls['discount'].value +
              this.valueFormGroup.controls['delivery'].value +
              this.valueFormGroup.controls['service'].value;
            this.p.push(
              new FormGroup({
                payment_type_id: new FormControl(data.id, Validators.required),
                payment_name: new FormControl(data.name),
                payment_description: new FormControl(data.description),
                payment_value: new FormControl(requiredPayment, [
                  Validators.required,
                  Validators.minLength(1),
                  Validators.nullValidator,
                  this.NotZero,
                ]),
              })
            );
          } else {
            this.p.push(
              new FormGroup({
                payment_type_id: new FormControl(data.id, Validators.required),
                payment_name: new FormControl(data.name),
                payment_description: new FormControl(data.description),
                payment_value: new FormControl(0, [
                  Validators.required,
                  Validators.minLength(1),
                  Validators.nullValidator,
                  this.NotZero,
                ]),
              })
            );
          }
        }
      },
    });
  }

  openPackageSelector() {
    this.dynamicComponentService
      .createDynamicComponent(PackageSelectorComponent, {})
      .subscribe((data) => {
        let validation = true;
        if (data != null && data != undefined) {
          this.t.controls.forEach((x) => {
            if (
              x.get('package_code_id') != undefined &&
              parseInt(x.get('package_code_id')?.value) == data.id
            ) {
              validation = false;
            }
          });

          if (validation) {
            console.log(data);
            this.t.push(
              this.formBuilder.group({
                package_code_id: [data.item.id, Validators.required],
                name: [data.item.name, Validators.required],
                description: [data.item.description, Validators.required],
                quantity: [0, [Validators.required, Validators.min(1)]],
                initial_price: [data.item.price],
                package_content: [data.package_content],
                price: [
                  data.item.price,
                  [Validators.min(0), Validators.required],
                ],
                save_price: [false],
              })
            );

            this.billFormGroup.patchValue({
              number_of_items: this.t.length,
            });

            setTimeout(() => {
              const autofocusLength =
                document.querySelectorAll('[focusedInput]').length;
              const input =
                document.querySelectorAll('[focusedInput]')[
                  autofocusLength - 1
                ];
              (input as HTMLElement).focus();
            }, 100);
          } else {
            this.alertService.showSuccess(
              this.translateService.instant('general__item__exists')
            );
          }
        }
      });
  }

  updatePrice(i: number) {
    const sheet = this.sheet.open(UpdateProductSalesPriceComponent, {
      data: {
        initial_price: this.getFormGroupAt(i).get('initial_price')?.value,
        initial_discount: this.getFormGroupAt(i).get('initial_discount')?.value,
        price: this.getFormGroupAt(i).get('price')?.value,
        discount: this.getFormGroupAt(i).get('discount')?.value,
        save_price: this.getFormGroupAt(i).get('save_price')?.value,
      },
    });

    sheet.afterDismissed().subscribe((data) => {
      if (data) {
        this.getFormGroupAt(i).patchValue({
          initial_price: data.initial_price,
          initial_discount: data.initial_discount,
          price: data.price,
          discount: data.discount,
          save_price: data.save_price,
        });
      }
    });
  }

  updatePackagePrice(i: number) {
    const sheet = this.sheet.open(UpdatePackageSalesPriceComponent, {
      data: {
        initial_price: this.getFormGroupAt(i).get('initial_price')?.value,
        price: this.getFormGroupAt(i).get('price')?.value,
        save_price: this.getFormGroupAt(i).get('save_price')?.value,
      },
    });

    sheet.afterDismissed().subscribe((data) => {
      if (data) {
        this.getFormGroupAt(i).patchValue({
          initial_price: data.initial_price,
          price: data.price,
          save_price: data.save_price,
        });
      }
    });
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  getFormGroupAtPayment(i: number) {
    return this.p.at(i) as FormGroup;
  }

  deleteItem(i: number) {
    this.t.removeAt(i);
    this.billFormGroup.patchValue({
      number_of_items: this.t.length,
    });
  }

  deletePayment(i: number) {
    this.p.removeAt(i);
  }

  submitForm() {
    if (
      this.metaFormGroup.invalid ||
      this.billFormGroup.invalid ||
      this.valueFormGroup.invalid ||
      this.paymentsFormGroup.invalid ||
      (this.metaFormGroup.get('type')?.value == 'sales' &&
        this.totalPayment == 0 &&
        this.paymentsFormGroup.controls['immediate_payment'].value) ||
      this.totalPayment >
        this.valueFormGroup.controls['total'].value +
          this.valueFormGroup.controls['delivery'].value +
          this.valueFormGroup.controls['service'].value -
          this.valueFormGroup.controls['discount'].value
    ) {
      console.error(`[errror]: ${this.metaFormGroup.errors}`);
      this.alertService.showSuccess('Please check your input.');
      return;
    }

    this.isSubmitting = true;

    const sales_invoice: any[] = [];
    const date = this.metaFormGroup.controls['date'].value;

    this.t.controls.forEach((x) => {
      if (!x.get('package_code_id')) {
        const product_id = Number(x.get('product_id')?.value ?? '0');
        const product_unit_id =
          x.get('product_unit_id')?.value == null
            ? null
            : Number(x.get('item_unit_id')?.value ?? '0');
        const price = Number(x.get('price')?.value ?? '0');
        const discount = Number(x.get('discount')?.value ?? '0');
        const quantity = Number(x.get('quantity')?.value ?? '0');

        sales_invoice.push({
          price: price,
          discount: discount,
          quantity: quantity,
          package_code_id: null,
          item_unit_id: product_unit_id,
          item_id: product_id,
          save:
            x.get('initial_price')?.value == x.get('price')?.value &&
            x.get('initial_discount')?.value == x.get('discount')?.value
              ? false
              : x.get('save_price')?.value,
        });
      } else {
        const package_code_id = parseInt(x.get('package_code_id')?.value);
        const quantity = parseFloat(x.get('quantity')?.value);
        const price = parseFloat(x.get('price')?.value);

        sales_invoice.push({
          price: price,
          discount: 0,
          quantity: quantity,
          package_code_id: package_code_id,
          item_unit_id: null,
          item_id: null,
          save:
            x.get('initial_price')?.value == x.get('price')?.value
              ? false
              : x.get('save_price')?.value,
        });
      }
    });

    const totalPayment = this.p.controls.reduce((a, b) => {
      return a + parseFloat(b.get('payment_value')?.value);
    }, 0);

    const bill_code = {
      sales:
        this.metaFormGroup.controls['sales'].value == 'INTERNAL'
          ? null
          : this.metaFormGroup.controls['sales'].value,
      uuid: this.metaFormGroup.controls['uuid'].value,
      date: this.datePipe.transform(date, 'yyyy-MM-dd'),
      customer_id:
        this.metaFormGroup.controls['customer_id'].value == 0
          ? null
          : this.metaFormGroup.controls['customer_id'].value,
      type: this.metaFormGroup.controls['type'].value,
      discount: this.valueFormGroup.controls['discount'].value,
      delivery: this.valueFormGroup.controls['delivery'].value,
      service: this.valueFormGroup.controls['service'].value,
      sales_invoice: sales_invoice,
      payment_term:
        this.totalBill > this.totalPayment
          ? null
          : this.paymentsFormGroup.controls['due_time'].value,
      sales_invoice_payment: !this.paymentsFormGroup.controls['immediate_payment'].value
        ? []
        : this.p.controls.map((x) => {
            return {
              payment_method_id: Number(x.get('payment_type_id')?.value ?? '0'),
              value: Number(x.get('payment_value')?.value ?? '0'),
            };
          }),
      is_paid:
        this.paymentsFormGroup.controls['immediate_payment'].value &&
        totalPayment ==
          this.valueFormGroup.controls['total'].value +
            this.valueFormGroup.controls['delivery'].value +
            this.valueFormGroup.controls['service'].value -
            this.valueFormGroup.controls['discount'].value
          ? true
          : this.paymentsFormGroup.controls['immediate_payment'].value &&
            totalPayment <
              this.valueFormGroup.controls['total'].value +
                this.valueFormGroup.controls['delivery'].value +
                this.valueFormGroup.controls['service'].value -
                this.valueFormGroup.controls['discount'].value
          ? false
          : false,
    };

    this.apiService
      .post('sales-invoice', bill_code)
      .subscribe({
        next: (result: any) => {
          const type = this.metaFormGroup.controls['type'].value;
          if (type == 'sales') {
            this.alertService.showSuccess(
              `${this.translateService.instant(
                'sales-invoice__success__prefix'
              )} ${result.name} ${this.translateService.instant(
                'sales-invoice__success__suffix'
              )}`
            );
          } else {
            this.alertService.showSuccess(
              `${this.translateService.instant(
                'sales-invoice__success__prefix__deposit'
              )} ${result.name} ${this.translateService.instant(
                'sales-invoice__success__suffix'
              )}`
            );
          }

          this.t.clear();
          this.valueFormGroup.reset();
          this.billFormGroup.reset();
          this.valueFormGroup.patchValue({
            discount: 0,
            service: 0,
            delivery: 0,
            total: 0,
            before: 0,
          });
          this.metaFormGroup.patchValue({
            uuid: v4(),
            sales: '',
            date: new Date(),
            type: 'sales',
          });

          this.paymentsFormGroup.patchValue({
            immediate_payment: true,
            due_time: 30,
          });

          this.p.clear();
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

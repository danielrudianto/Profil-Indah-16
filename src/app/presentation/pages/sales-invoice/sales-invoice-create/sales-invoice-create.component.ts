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
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { Subject, debounceTime, of, switchMap, tap } from 'rxjs';
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

  NotZero: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    return Number(control.value) != 0 ? null : { error: true };
  };

  paymentValidator: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const payments = (group.get('payments') as FormArray)?.value || [];
    const sales = this.metaFormGroup?.get('sales')?.value;
    const hasInvalidPayment = payments.some(
      (p: any) => p.payment_method_id === 0
    );
    const total = this.totalBill ?? 0;
    const paymentValue = payments.reduce(
      (a: any, b: any) => a + Number(b.value),
      0
    );

    const status = this.paymentsFormGroup?.get('method')?.value;

    let invalidInternalPayment =
      (sales === 'INTERNAL' || sales === '' || sales === null) &&
      hasInvalidPayment
        ? this.translateService.instant('sales-invoice__create__payment__dor')
        : null;

    let invalidPaymentStatus =
      status === 'paid' && total > paymentValue
        ? this.translateService.instant(
            'sales-invoice__create__payment__paid-unpaid'
          )
        : null;

    if (invalidInternalPayment == null && invalidPaymentStatus == null) {
      return null;
    }

    return {
      invalidInternalPayment: invalidInternalPayment,
      invalidPaymentStatus: invalidPaymentStatus,
    };
  };

  onSelectCustomer(data: any) {
    this.metaFormGroup.patchValue({
      customer_id: data.id,
    });
  }

  onUnselectCustomer() {
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

  paymentsFormGroup: FormGroup = new FormGroup(
    {
      method: new FormControl('', Validators.required),
      due_time: new FormControl(30, [Validators.required, Validators.min(0)]),
      payments: new FormArray([]),
    },
    [this.paymentValidator]
  );

  valueFormGroup: FormGroup = new FormGroup({
    discount: new FormControl(0, [Validators.required, Validators.min(0)]),
    delivery: new FormControl(0, [Validators.required, Validators.min(0)]),
    service: new FormControl(0, [Validators.required, Validators.min(0)]),
    before: new FormControl(0, [Validators.required, Validators.min(0)]),
    total: new FormControl(0, [Validators.required, Validators.min(0)]),
    grand_total: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

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
    const result = this.p.value.reduce((a: any, b: any) => {
      return a + b['value'];
    }, 0);

    return result;
  }

  get totalBill() {
    if (
      !this.valueFormGroup ||
      !this.valueFormGroup.controls['total'] ||
      !this.valueFormGroup.controls['delivery'] ||
      !this.valueFormGroup.controls['service'] ||
      !this.valueFormGroup.controls['discount']
    ) {
      return 0;
    }
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
      this.valueFormGroup.patchValue({
        total: this.t.value.reduce((a: any, b: any) => {
          return a + b.quantity * (b.price - b.discount);
        }, 0),
        before: this.t.value.reduce((a: any, b: any) => {
          return a + b.quantity * b.price;
        }, 0),
      });
    });

    this.valueFormGroup.valueChanges.subscribe((values) => {
      const subtotal = Number(this.valueFormGroup.value.total);
      const discount = Number(this.valueFormGroup.value.discount);
      const delivery = Number(this.valueFormGroup.value.delivery);
      const service = Number(this.valueFormGroup.value.service);

      this.valueFormGroup.patchValue(
        {
          grand_total: subtotal + delivery + service - discount,
        },
        { emitEvent: false }
      );
    });

    this.paymentsFormGroup.controls['method'].valueChanges.subscribe((data) => {
      if (data === 'unpaid') {
        this.p.clear();
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

    this.metaFormGroup.controls['sales'].valueChanges
      .pipe(debounceTime(500))
      .subscribe((_) => {
        this.fetchSalesmen();
      });
  }

  fetchSalesmen() {
    this.apiService
      .get('salesman', {
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
      if (result == undefined) {
        return;
      }

      if (result) {
        const data = result.data;
        const sub = result.sub;
        const check = this.checkExistingProduct(
          data.id,
          sub == null ? null : sub.id
        );

        if (check) {
          this.alertService.showSuccess(
            this.translateService.instant('general__item__exists')
          );
          return;
        }

        this.apiService.get(`product-stock/product/${data.id}`).subscribe({
          next: (stock: any) => {
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
                  stock: [stock.stock],
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
                  stock: [stock.stock],
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
                document.querySelectorAll('[focusedInput]')[
                  autofocusLength - 1
                ];
              (input as HTMLElement).focus();
            }, 100);
          },
          error: (error) => {
            this.alertService.showError(error);
            return;
          },
        });
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
    const result = this.t.value.findIndex((x: any) => {
      return x.product_id == productID && x.product_unit_id == productUnitID;
    });

    return result == -1 ? false : true;
  }

  openPackageSelector() {
    this.dynamicComponentService
      .createDynamicComponent(PackageSelectorComponent, {})
      .subscribe((data) => {
        if (data) {
          const result = this.checkExistingPackage(data.item.id);
          if (result) {
            this.alertService.showSuccess(
              this.translateService.instant('general__item__exists')
            );
            return;
          }

          this.apiService
            .get(`product-stock/package/${data.item.id}`)
            .subscribe({
              next: (stock: any) => {
                this.t.push(
                  this.formBuilder.group({
                    package_code_id: [data.item.id, Validators.required],
                    name: [data.item.name, Validators.required],
                    description: [data.item.description, Validators.required],
                    quantity: [0, [Validators.required, Validators.min(1)]],
                    initial_price: [data.item.price],
                    package_content: [[]],
                    price: [
                      data.item.price,
                      [Validators.min(0), Validators.required],
                    ],
                    discount: [0],
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
              },
              error: (error) => {
                this.alertService.showError(error);
              },
            });
        }
      });
  }

  private checkExistingPackage(productPackageID: number) {
    const result = this.t.value.findIndex((x: any) => {
      return x.package_code_id == productPackageID;
    });

    return result == -1 ? false : true;
  }

  openPaymentSelector() {
    const sheet = this.sheet
      .open(PaymentSelectorComponent, {
        data: this.paymentOptions,
      })
      .afterDismissed()
      .subscribe((data: any) => {
        if (data) {
          const result = this.checkExistingPaymentMethod(data.id);
          if (result) {
            this.alertService.showSuccess(
              this.translateService.instant(
                'sales-invoice__create__payment-method__exists'
              )
            );
            return;
          }

          const requiredPayments = this.totalBill - this.totalPayment;

          this.p.push(
            this.formBuilder.group({
              payment_method_id: new FormControl(data.id),
              payment_name: new FormControl(data.name, Validators.required),
              payment_description: new FormControl(data.description),
              value: new FormControl(requiredPayments, [
                Validators.required,
                Validators.minLength(1),
                Validators.nullValidator,
                this.NotZero,
              ]),
            })
          );
        }
      });
  }

  private checkExistingPaymentMethod(paymentMethodID: number | null) {
    const payments = this.p.value;
    const result = payments.findIndex((x: any) => {
      return x.id == paymentMethodID;
    });

    return result == -1 ? false : true;
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
    if (!this.isValid) {
      console.error(`[errror]: ${this.metaFormGroup.errors}`);
      this.alertService.showSuccess('Please check your input.');
      return;
    }

    if (this.totalPayment > this.totalBill) {
      console.error(`[error]: Payment is greater than the sales invoice`);
      this.alertService.showSuccess(
        this.translateService.instant(
          'sales-invoice__create__payment__greater-error'
        )
      );
    }

    const paymentMethod = this.paymentsFormGroup.get('method')?.value;
    if (paymentMethod === 'paid' && this.totalPayment < this.totalBill) {
      console.error(`[error]: Payment is not sufficient`);
      this.alertService.showSuccess(
        this.translateService.instant(
          'sales-invoice__create__payment__insufficient-error'
        )
      );
      return;
    }

    if (paymentMethod === 'underpaid' && this.totalPayment >= this.totalBill) {
      console.error(`[error]: Payment is not sufficient`);
      this.alertService.showSuccess(
        this.translateService.instant(
          'sales-invoice__create__payment__greater-error'
        )
      );
      return;
    }

    if (paymentMethod === 'unpaid' && this.totalPayment > 0) {
      console.error(`[error]: Payment is not sufficient`);
      this.alertService.showSuccess(
        this.translateService.instant(
          'sales-invoice__create__payment__parameter'
        )
      );
      return;
    }

    this.isSubmitting = true;

    const sales_invoice: any[] = [];
    const date = this.metaFormGroup.controls['date'].value;
    for (let i = 0; i < this.t.controls.length; i++) {
      const item = this.t.controls[i];
      const packageCodeID = item.get('package_code_id')?.value;
      if (packageCodeID) {
        const packageQuantity = Number(item.get('quantity')?.value);
        const packagePrice = Number(item.get('price')?.value);
        const package_content = item.get('package_content')?.value;
        const realValue = package_content.reduce((a: any, b: any) => {
          return a + b.price * b.quantity;
        }, 0);

        for (let j = 0; j < package_content.length; j++) {
          const price = package_content[j].price;
          const correctedPrice = ((price * packagePrice) / realValue).toFixed(
            2
          );
          sales_invoice.push({
            price: correctedPrice,
            product_id: package_content[j].product_id,
            product_unit_id: package_content[j].product_unit_id,
            quantity: package_content[j].quantity * packageQuantity,
            discount: 0,
          });
        }
      } else {
        const product_id = item.get('product_id')?.value;
        const product_unit_id = item.get('product_unit_id')?.value;
        const price = Number(item.get('price')?.value);
        const discount = Number(item.get('discount')?.value);
        const quantity = Number(item.get('quantity')?.value);

        sales_invoice.push({
          price: price,
          discount: discount,
          quantity: quantity,
          product_unit_id: product_unit_id,
          product_id: product_id,
        });
      }
    }

    const sales_invoice_code = {
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
      sales_invoice_payment: this.p.controls.map((x) => {
        return {
          date: this.datePipe.transform(date, 'yyyy-MM-dd'),
          payment_method_id: x.get('payment_method_id')?.value,
          value: x.get('value')?.value,
        };
      }),
      is_paid:
        this.paymentsFormGroup.controls['method'].value === 'paid'
          ? true
          : false,
    };

    let submitFunction = null;
    const type = this.metaFormGroup.controls['type'].value;

    if (type == 'sales') {
      submitFunction = this.apiService.post(
        'sales-invoice',
        sales_invoice_code
      );
    } else if (type == 'deposit') {
      submitFunction = this.apiService.post('sales-deposit', {
        ...sales_invoice_code,
        type: 'INTERNAL',
      });
    } else {
      submitFunction = this.apiService.post('sales-deposit', {
        ...sales_invoice_code,
        type: 'INTERNAL',
      });
    }

    submitFunction
      .pipe(
        switchMap((result) => {
          const itemsToSave = this.t.controls
            .filter(
              (x) =>
                x.get('package_code_id')?.value == null &&
                x.get('save_price')?.value
            )
            .map((x) => ({
              product_id: x.get('product_id')?.value,
              product_unit_id: x.get('product_unit_id')?.value,
              price: x.get('price')?.value,
              discount: x.get('discount')?.value,
            }));

          if (itemsToSave.length > 0) {
            // Post to purchase-price
            return this.apiService.put('product/price-sales', {
              items: itemsToSave,
            });
          }

          return of(null);
        }),
        switchMap((productPriceResult) => {
          const itemsToSave = this.t.controls
            .filter(
              (x) =>
                x.get('package_code_id')?.value != null &&
                x.get('save_price')?.value
            )
            .map((x) => ({
              package_code_id: x.get('package_code_id')?.value,
              price: x.get('price')?.value,
            }));

          if (itemsToSave.length > 0) {
            // Post to purchase-price
            return this.apiService.put('product-package/price-sales', {
              items: itemsToSave,
            });
          }

          return of(null);
        })
      )
      .subscribe({
        next: (result: any) => {
          const type = this.metaFormGroup.controls['type'].value;
          if (type == 'sales') {
            this.alertService.showSuccess(
              this.translateService.instant('sales-invoice__create__success')
            );
          } else {
            this.alertService.showSuccess(
              this.translateService.instant('sales-deposit__create__success')
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
            method: 'paid',
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

  get overPaymentAvailable(): boolean {
    if (this.metaFormGroup.controls['type']?.value != 'sales') {
      return false;
    }

    if (this.paymentsFormGroup.controls['method']?.value != 'paid') {
      return false;
    }

    if (this.metaFormGroup.controls['customer_id']?.value == 0) {
      return false;
    }

    return true;
  }

  get isValid(): boolean {
    if (
      !this.metaFormGroup.valid ||
      !this.billFormGroup.valid ||
      !this.valueFormGroup.valid ||
      !this.paymentsFormGroup.valid
    ) {
      return false;
    }

    const paymentMethod = this.paymentsFormGroup.get('method')?.value;

    if (this.totalPayment > this.totalBill) {
      return false;
    }

    if (paymentMethod === 'paid' && this.totalPayment < this.totalBill) {
      return false;
    }

    if (paymentMethod === 'underpaid' && this.totalPayment >= this.totalBill) {
      return false;
    }

    if (paymentMethod === 'underpaid' && this.totalPayment == 0) {
      return false;
    }

    if (paymentMethod === 'unpaid' && this.totalPayment > 0) {
      return false;
    }

    const type = this.metaFormGroup.get('type')?.value;

    if (type == 'deposit-internal' && paymentMethod != 'unpaid') {
      return false;
    }

    return true;
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

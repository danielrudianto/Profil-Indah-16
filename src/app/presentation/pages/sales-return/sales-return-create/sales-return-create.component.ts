import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { Subject } from 'rxjs';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { PackageSelectorComponent } from 'src/app/presentation/components/package-selector/package-selector.component';
import {
  ProductSelectorComponent,
  ProductSelectorType,
} from 'src/app/presentation/components/product-selector/product-selector.component';
import { SalesReturnCreateViewSalesInvoiceComponent } from 'src/app/presentation/pages/sales-return/sales-return-create/sales-return-create-view-sales-invoice/sales-return-create-view-sales-invoice.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-sales-return-create',
  templateUrl: './sales-return-create.component.html',
  styleUrls: ['./sales-return-create.component.css'],
  animations: [slideInOutAnimation],
})
export class SalesReturnCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private _hotkeysService: HotkeysService,
    private formBuilder: FormBuilder,
    private dynamicComponentService: DynamicComponentService,
    private translateService: TranslateService,
    private datePipe: DatePipe
  ) {
    this._hotkeysService.add([
      new Hotkey('alt+a', (): boolean => {
        this.openItemSelector();
        return false;
      }),
    ]);
  }

  productSelectorSubject: Subject<any> = new Subject();
  step: number = 0;
  selectedBill: any = null;
  billOptions: any[] = [];
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  returnValue: number = 0;

  metaFormGroup: FormGroup = new FormGroup({
    date: new FormControl(new Date(), Validators.required),
    payment_method: new FormControl(0, Validators.required),
    bill_date: new FormControl('', Validators.required),
  });

  productFormGroup: FormGroup = new FormGroup({
    number_of_items: new FormControl(0, [
      Validators.required,
      Validators.min(1),
    ]),
    items: new FormArray([]),
  });

  ngOnInit(): void {
    this.metaFormGroup.controls['bill_date'].valueChanges.subscribe(() => {
      this.refreshSubscription();
    });
  }

  ngOnDestroy(): void {
    this._hotkeysService.reset();
  }

  get f() {
    return this.productFormGroup.controls;
  }

  get t() {
    return this.productFormGroup.controls['items'] as FormArray;
  }

  getFormGroupAt(i: number) {
    return this.t.controls[i] as FormGroup;
  }

  onSelectPaymentMethod(event: any) {
    this.metaFormGroup.controls['payment_method'].setValue(event?.id);
  }

  onUnselectPaymentMethod() {
    this.metaFormGroup.controls['payment_method'].setValue('');
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

        if (sub == null) {
          this.t.push(
            this.formBuilder.group({
              product_id: [data.id, Validators.required],
              product_unit_id: [null],
              reference: [data.reference],
              description: [data.description],
              quantity: [0, [Validators.required, Validators.min(0.01)]],
              price: [0, [Validators.required, Validators.min(0)]],
              discount: [0, [Validators.required, Validators.min(0)]],
              unit: [data.unit],
              conversion: [1],
              default_unit: [data.unit],
              priceOptions: [[]],
              sales_invoice_id: [null],
            })
          );

          this.refreshSubscription();
        } else {
          this.t.push(
            this.formBuilder.group({
              product_id: [data.id, Validators.required],
              product_unit_id: [sub.id],
              reference: [data.reference],
              description: [data.description],
              quantity: [0, [Validators.required, Validators.min(0.01)]],
              price: [0, [Validators.required, Validators.min(0)]],
              discount: [0, [Validators.required, Validators.min(0)]],
              unit: [sub.unit],
              conversion: [sub.conversion],
              default_unit: [data.unit],
              priceOptions: [[]],
              sales_invoice_id: [null],
            })
          );

          this.refreshSubscription();
        }

        this.productFormGroup.patchValue({
          number_of_items: this.t.length,
        });
      }
    });
  }

  private refreshSubscription() {
    this.resetSalesInvoice(null);
    this.t.controls.forEach((ctrl, idx) => {
      ctrl.get('quantity')?.valueChanges.subscribe(() => {
        this.resetSalesInvoice(null);
        this.resetSalesInvoice(idx);
      });
    });
  }

  private resetSalesInvoice(index: number | null) {
    if (index == null) {
      this.selectedBill = null;
      this.billOptions = [];
    } else {
      this.t.controls.at(index)?.patchValue({
        price: 0,
        discount: 0,
        sales_invoice_id: null,
        priceOptions: [],
      });
    }
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

  deleteItem(i: number) {
    this.t.removeAt(i);
    this.productFormGroup.patchValue({
      number_of_items: this.t.length,
    });

    this.refreshSubscription();
  }

  fetchSalesInvoice() {
    this.isLoading = true;
    if (this.metaFormGroup.valid && this.productFormGroup.valid) {
      this.apiService
        .post('sales-invoice/sales-return', {
          date: this.datePipe.transform(
            this.metaFormGroup.value.bill_date,
            'yyyy-MM-dd'
          ),
          sales_invoice: this.t.controls.map((x) => {
            return {
              product_id: x.get('product_id')?.value,
              product_unit_id: x.get('product_unit_id')?.value,
              quantity: x.get('quantity')?.value,
            };
          }),
        })
        .subscribe({
          next: (data: any) => {
            const invoices: any[] = [];
            data.forEach((x: any) => {
              let validation = true;
              for (let i = 0; i < this.t.value.length; i++) {
                const product_id = this.t.value[i].product_id;
                const product_unit_id = this.t.value[i].product_unit_id;
                const quantity = this.t.value[i].quantity;

                const si = x.sales_invoice.filter(
                  (z: any) =>
                    (z.product_id =
                      product_id &&
                      z.product_unit_id == product_unit_id &&
                      z.quantity >= quantity)
                ).length;

                if (si == 0) {
                  validation = false;
                }
              }

              if (validation) {
                invoices.push(x);
              }
            });
            this.billOptions = invoices;
            this.selectedBill = null;
          },
          error: (error) => {
            this.alertService.showError(error);
          },
        })
        .add(() => {
          this.isLoading = false;
        });
    }
  }

  selectSalesInvoice(i: number) {
    this.dynamicComponentService
      .createDynamicComponent(SalesReturnCreateViewSalesInvoiceComponent, {
        id: this.billOptions[i].id,
      })
      .subscribe((data) => {
        if (data) {
          this.selectedBill = data;
          this.t.controls.forEach((x) => {
            const product_id = x.get('product_id')?.value;
            const product_unit_id = x.get('product_unit_id')?.value;
            const quantity = x.get('quantity')?.value;

            const priceOptions = data.sales_invoice.filter(
              (y: any) =>
                y.product_id == product_id &&
                y.product_unit_id == product_unit_id &&
                y.quantity >= quantity
            );

            x.patchValue({
              priceOptions: priceOptions.map((z: any) => {
                return {
                  sales_invoice_id: z.id,
                  price: z.price,
                  discount: z.discount,
                };
              }),
            });
          });
        }
      });
  }

  selectSalesInvoiceItem(event: any, index: number) {
    const value = event.value;
    this.t.controls.at(index)?.patchValue({
      sales_invoice_id: value.sales_invoice_id,
      price: value.price,
      discount: value.discount,
    });
  }

  get errorMessage(): string | null {
    if (!this.metaFormGroup.valid) {
      return 'meta lu salah';
    }

    if (!this.productFormGroup.valid) {
      return 'product lu salah';
    }

    if (this.selectedBill == null) {
      return 'kosong atuh bos';
    }

    if (
      this.t.controls.some((x: any) => x.get('sales_invoice_id')?.value == null)
    ) {
      return 'ada yang kosong';
    }

    return null;
  }

  get isValid(): boolean {
    if (!this.metaFormGroup.valid) {
      return false;
    }

    if (!this.productFormGroup.valid) {
      return false;
    }

    if (this.selectedBill == null) {
      return false;
    }

    if (
      this.t.controls.some((x: any) => x.get('sales_invoice_id')?.value == null)
    ) {
      return false;
    }

    return true;
  }

  backToPrevious() {
    this.step = 0;
    this.billOptions = [];
    this.selectedBill = null;
    this.t.controls.forEach((x) => {
      x.setValue({
        bill_id: '',
      });
    });
  }

  submit() {
    if (
      this.isSubmitting ||
      this.isLoading ||
      !this.metaFormGroup.valid ||
      !this.productFormGroup.valid ||
      this.selectedBill == null
    ) {
      this.alertService.showError(
        this.translateService.instant('sales-return__create__form-error')
      );
      return;
    } else {
      this.isSubmitting = true;
      this.apiService
        .post('sales-return', {
          sales_invoice_code_id: this.selectedBill.id,
          date: this.datePipe.transform(
            this.metaFormGroup.value.date,
            'yyyy-MM-dd'
          ),
          payment_method_id: this.metaFormGroup.value.payment_method,
          sales_return: this.t.controls.map((x) => {
            return {
              sales_invoice_id: x.get('sales_invoice_id')?.value,
              quantity: x.get('quantity')?.value,
            };
          }),
        })
        .subscribe({
          next: (data) => {
            this.alertService.showSuccess(
              this.translateService.instant('sales-return__create__success')
            );

            this.metaFormGroup.reset();
            this.productFormGroup.reset();
            this.t.clear();
            this.selectedBill = null;
            this.billOptions = [];

            this.step = 0;
          },
          error: (error) => {
            this.alertService.showError(error);
          },
        })
        .add(() => {
          this.isSubmitting = false;
        });
    }
  }

  get totalPrice(): number {
    let total = 0;
    this.t.controls.forEach((x) => {
      total +=
        (x.get('price')?.value - x.get('discount')?.value) *
        x.get('quantity')?.value;
    });

    return total;
  }
}

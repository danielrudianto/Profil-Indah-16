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
    private _hotKeysService: HotkeysService,
    private formBuilder: FormBuilder,
    private dynamicComponentService: DynamicComponentService,
    private translateService: TranslateService,
    private datePipe: DatePipe
  ) {
    this._hotKeysService.add([
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

  billFormGroup: FormGroup = new FormGroup({
    bill_code_id: new FormControl('', Validators.required),
  });

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

    this.productSelectorSubject.subscribe((data: any) => {
      if (data != null && data != undefined) {
        let validation = true;

        this.t.controls.forEach((x) => {
          if (data.price != null) {
            if (x.get('item_unit_id')?.value == data.price.item_unit_id) {
              validation = false;
            }
          } else {
            if (x.get('item_id')?.value == data.item.id) {
              validation = false;
            }
          }
        });

        if (validation) {
          this.t.push(
            this.formBuilder.group({
              item_id: [data.item.id, Validators.required],
              item_unit_id: [
                data.price == null ? null : data.price.item_unit_id,
              ],
              reference: [data.item.reference, Validators.required],
              description: [data.item.description, Validators.required],
              quantity: ['', [Validators.required, Validators.min(0.01)]],
              unit: [
                data.price == null ? data.item.unit : data.price.unit,
                Validators.required,
              ],
              conversion: [
                data.price == null ? 1 : data.price.conversion,
                Validators.required,
              ],
              default_unit: [data.item.unit],
              price: [0, Validators.required],
              discount: [0, Validators.required],
              bill_id: [''],
            })
          );

          this.productFormGroup.patchValue({
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
      }
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
                package_content: [data.package_content],
                price: [0, [Validators.min(0), Validators.required]],
                discount: [0, [Validators.min(0), Validators.required]],
                bill_id: [''],
              })
            );

            this.productFormGroup.patchValue({
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

  deleteItem(i: number) {
    this.t.removeAt(i);
    this.productFormGroup.patchValue({
      number_of_items: this.t.length,
    });
  }

  /**
   * Fetches sales invoices based on metaFormGroup and productFormGroup validity.
   */
  fetchSalesInvoice() {
    this.isLoading = true;
    if (this.metaFormGroup.valid && this.productFormGroup.valid) {
      this.apiService
        .post('sales-return/search', {
          date: this.datePipe.transform(
            this.metaFormGroup.value.bill_date,
            'yyyy-MM-dd'
          ),
          items: this.t.controls
            .filter((x) => x.get('item_id')?.value != null)
            .map((x) => {
              return {
                item_id: x.get('item_id')?.value,
                quantity: x.get('quantity')?.value,
                item_unit_id: x.get('item_unit_id')?.value,
              };
            }),
          packages: this.t.controls
            .filter((x) => x.get('package_code_id')?.value != null)
            .map((x) => {
              return {
                package_code_id: x.get('package_code_id')?.value,
                quantity: x.get('quantity')?.value,
              };
            }),
        })
        .subscribe({
          next: (data: any) => {
            this.billOptions = data;
            this.selectedBill = null;
            this.step = 1;
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
        if (data != undefined && data != null) {
          this.selectedBill = data;
          this.returnValue = 0;
          const billItems = data.bill as any[];
          for (let i = 0; i < this.t.controls.length; i++) {
            if (this.t.controls[i].get('item_id')?.value != null) {
              const index = billItems.findIndex(
                (x) =>
                  x.item_id == this.t.controls[i].get('item_id')?.value &&
                  x.item_unit_id ==
                    this.t.controls[i].get('item_unit_id')?.value
              );

              if (index > -1) {
                this.t.controls[i].patchValue({
                  bill_id: billItems[index].id,
                  price: billItems[index].price,
                  discount: billItems[index].discount,
                });
              }
            } else if (
              this.t.controls[i].get('package_code_id')?.value != null
            ) {
              const index = billItems.findIndex(
                (x) =>
                  x.package_code_id ==
                  this.t.controls[i].get('package_code_id')?.value
              );
              if (index > -1) {
                this.t.controls[i].patchValue({
                  bill_id: billItems[index].id,
                  price: billItems[index].price,
                  discount: billItems[index].discount,
                });
              }
            }
          }
        }
      });
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
          date: this.datePipe.transform(
            this.metaFormGroup.value.bill_date,
            'yyyy-MM-dd'
          ),
          payment_method_id: this.metaFormGroup.value.payment_method,
          sales_return: this.t.controls.map((x) => {
            return {
              bill_id: x.get('bill_id')?.value,
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
            this.billFormGroup.reset();
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

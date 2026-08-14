import { DatePipe, NgIf, NgFor, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import {
  ProductSelectorComponent,
  ProductSelectorType,
} from 'src/app/presentation/components/product-selector/product-selector.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { v4 } from 'uuid';
import { DeleteConfirmationComponent } from '../../../components/delete-confirmation/delete-confirmation.component';
import { SubmitConfirmationComponent } from '../../../components/submit-confirmation/submit-confirmation.component';
import { VerticalDividerComponent } from '../../../components/vertical-divider/vertical-divider.component';
import { BoxStepperComponent } from '../../../components/box-stepper/box-stepper.component';
import { AutocompleteSearchComponent } from '../../../components/autocomplete-search/autocomplete-search.component';
import { MatFormField, MatLabel, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatButton, MatIconButton } from '@angular/material/button';
import { NgxMaskDirective } from 'ngx-mask';
import { MatIcon } from '@angular/material/icon';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';

@Component({
    selector: 'app-good-receipt-create',
    templateUrl: './good-receipt-create.component.html',
    styleUrls: ['./good-receipt-create.component.css'],
    imports: [VerticalDividerComponent, BoxStepperComponent, FormsModule, ReactiveFormsModule, AutocompleteSearchComponent, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatButton, NgIf, NgFor, NgxMaskDirective, MatHint, MatIconButton, MatIcon, EmptyTableComponent, DecimalPipe, TranslateModule]
})
export class GoodReceiptCreateComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private datePipe: DatePipe,
    private translateService: TranslateService,
    private _hotKeysService: HotkeysService,
    private dialog: MatDialog
  ) {
    this._hotKeysService.add([
      new Hotkey('alt + a', (): boolean => {
        this.openItemSelector();
        return false;
      }),
    ]);
  }

  metaFormGroup: FormGroup = new FormGroup({
    uuid: new FormControl(v4(), Validators.required),
    supplier_id: new FormControl('', Validators.required),
    company_id: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    delivery_order: new FormControl('', Validators.required),
    items: new FormArray([]),
  });

  itemFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
    number_of_items: new FormControl(0, [
      Validators.required,
      Validators.min(1),
    ]),
  });

  isSubmitting: boolean = false;

  ngOnInit(): void {
    this.itemFormGroup.valueChanges.subscribe(() => {
      console.log(this.itemFormGroup.controls);
    });
  }

  get f() {
    return this.itemFormGroup.controls;
  }

  get t() {
    return this.f['items'] as FormArray;
  }

  onSelectSupplier(event: any) {
    this.metaFormGroup.patchValue({
      supplier_id: event.id,
    });
  }

  onUnselectSupplier() {
    this.metaFormGroup.patchValue({
      supplier_id: null,
    });
  }

  onSelectCompany(event: any) {
    this.metaFormGroup.patchValue({
      company_id: event.id,
    });
  }

  onUnselectCompany() {
    this.metaFormGroup.patchValue({
      company_id: null,
    });
  }

  openItemSelector() {
    const dialog = this.dynamicComponentService.createDynamicComponent(
      ProductSelectorComponent,
      {
        type: ProductSelectorType.purchase,
      }
    );

    dialog.subscribe((result) => {
      if (result) {
        const data = result.data;
        const sub = result.sub;

        const exists = this.checkExisting(data.id, sub == null ? null : sub.id);

        if (exists) {
          this.alertService.showError(
            this.translateService.instant('general__item__exists')
          );
          return;
        }

        this.t.push(
          this.formBuilder.group({
            product_id: [data.id, Validators.required],
            product_unit_id: [sub == null ? null : sub.id],
            reference: [data.reference],
            description: [data.description],
            quantity: ['', [Validators.required, Validators.min(0.01)]],
            unit: [sub == null ? data.unit : sub.unit],
            conversion: [sub == null ? 1 : sub.conversion],
            price: [sub == null ? data.purchase_price : sub.purchase_price],
            discount: [
              sub == null ? data.purchase_discount : sub.purchase_discount,
            ],
            default_unit: [data.unit],
          })
        );

        this.itemFormGroup.patchValue({
          number_of_items: this.t.length,
        });
      }
    });
  }

  private checkExisting(
    productID: number,
    productUnitID: number | null
  ): boolean {
    return this.t.controls.some((x) => {
      const existingProductID = x.get('product_id')?.value;
      const existingProductUnitID = x.get('product_unit_id')?.value;
      return (
        existingProductID === productID &&
        (productUnitID === null || existingProductUnitID === productUnitID)
      );
    });
  }

  deleteItem(i: number) {
    this.t.removeAt(i);

    this.itemFormGroup.patchValue({
      number_of_items: this.t.length,
    });
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .post(`good-receipt/check`, {
        name: this.metaFormGroup.get('delivery_order')?.value,
      })
      .subscribe({
        next: (data: any) => {
          if (data === null) {
            this.apiService
              .post('good-receipt', {
                uuid: this.metaFormGroup.get('uuid')?.value,
                name: this.metaFormGroup.get('delivery_order')?.value,
                invoice_name: '',
                faktur: null,
                date: this.datePipe.transform(
                  this.metaFormGroup.get('date')?.value,
                  'yyyy-MM-dd'
                ),
                company_id: this.metaFormGroup.get('company_id')?.value,
                supplier_id: this.metaFormGroup.get('supplier_id')?.value,
                good_receipt: this.t.controls.map((x) => {
                  return {
                    product_id: x.get('product_id')?.value,
                    product_unit_id: x.get('product_unit_id')?.value,
                    quantity: x.get('quantity')?.value,
                    price: x.get('price')?.value,
                    discount: x.get('discount')?.value,
                  };
                }),
              })
              .subscribe({
                next: (_) => {
                  this.t.clear();
                  this.metaFormGroup.reset();
                  this.onUnselectCompany();
                  this.onUnselectSupplier();

                  this.itemFormGroup.patchValue({
                    number_of_items: 0,
                  });

                  this.metaFormGroup.patchValue({
                    uuid: v4(),
                  });

                  this.alertService.showSuccess(
                    this.translateService.instant(
                      'good-receipt__create__success'
                    )
                  );
                },
                error: (error) => {
                  this.alertService.showError(error);
                },
              })
              .add(() => {
                this.isSubmitting = false;
              });

            return;
          }

          this.dialog
            .open(SubmitConfirmationComponent, {
              data: {
                title: this.translateService.instant(
                  'general__confirm-confirmation__body'
                ),
                document: `${data.name}, Supplier ${
                  data.supplier.name
                }, Date ${this.datePipe.transform(data.date, 'dd/MM/yyyy')}`,
              },
            })
            .afterClosed()
            .subscribe((validation) => {
              if (validation == true) {
                this.apiService
                  .post('good-receipt', {
                    uuid: this.metaFormGroup.get('uuid')?.value,
                    name: this.metaFormGroup.get('delivery_order')?.value,
                    date: this.datePipe.transform(
                      this.metaFormGroup.get('date')?.value,
                      'yyyy-MM-dd'
                    ),
                    company_id: this.metaFormGroup.get('company_id')?.value,
                    supplier_id: this.metaFormGroup.get('supplier_id')?.value,
                    good_receipt: this.t.controls.map((x) => {
                      return {
                        product_id: x.get('product_id')?.value,
                        product_unit_id: x.get('product_unit_id')?.value,
                        quantity: Number(x.get('quantity')?.value),
                        price: Number(x.get('price')?.value),
                        discount: Number(x.get('discount')?.value),
                      };
                    }),
                    invoice_name: '',
                    faktur: null,
                    discount: 0,
                  })
                  .subscribe({
                    next: (_) => {
                      this.t.clear();
                      this.metaFormGroup.reset();
                      this.onUnselectCompany();
                      this.onUnselectSupplier();

                      this.itemFormGroup.patchValue({
                        number_of_items: 0,
                      });

                      this.metaFormGroup.patchValue({
                        uuid: v4(),
                      });

                      this.alertService.showSuccess(
                        this.translateService.instant(
                          'good-receipt__create__success'
                        )
                      );
                    },
                    error: (error) => {
                      this.alertService.showError(error);
                    },
                  })
                  .add(() => {
                    this.isSubmitting = false;
                  });
              } else {
                this.isSubmitting = false;
              }
            });
        },
        error: (_) => {
          this.isSubmitting = false;
          this.alertService.showError('Error on fetching data');
        },
      });
  }
}

import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
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

@Component({
  selector: 'app-good-receipt-create',
  templateUrl: './good-receipt-create.component.html',
  styleUrls: ['./good-receipt-create.component.css'],
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

    dialog.subscribe((data) => {
      if (data != null && data != undefined) {
        if (
          this.t.controls.filter(
            (x) =>
              x.get('item_id')?.value == data.item.id &&
              x.get('item_unit_id')?.value ==
                (data.price == null ? null : data.price.item_unit_id)
          ).length > 0
        ) {
          this.alertService.showSuccess(
            'Item already exists! Please select different item.'
          );
        } else {
          const productFormGroup = this.formBuilder.group({
            item_id: [data.item.id, Validators.required],
            item_unit_id: [data.price == null ? null : data.price.item_unit_id],
            reference: [data.item.reference, Validators.required],
            description: [data.item.description, Validators.required],
            quantity: [0, [Validators.required, Validators.min(0.01)]],
            unit: [data.price == null ? data.item.unit : data.price.unit],
            conversion: [data.price == null ? 1 : data.price.conversion],
            default_unit: [data.item.unit],
            stock: [data.item.stock],
          });

          this.t.push(productFormGroup);

          this.itemFormGroup.patchValue({
            number_of_items: this.t.length,
          });
        }
      }
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
                date: this.datePipe.transform(
                  this.metaFormGroup.get('date')?.value,
                  'yyyy-MM-dd'
                ),
                company_id: this.metaFormGroup.get('company_id')?.value,
                supplier_id: this.metaFormGroup.get('supplier_id')?.value,
                good_receipt: this.t.controls.map((x) => {
                  return {
                    item_id: x.get('item_id')?.value,
                    item_unit_id: x.get('item_unit_id')?.value,
                    quantity: x.get('quantity')?.value,
                    price: x.get('price')?.value,
                  };
                }),
                purchase_invoice: {
                  name: '',
                  faktur: null,
                  date: this.datePipe.transform(
                    this.metaFormGroup.get('date')?.value,
                    'yyyy-MM-dd'
                  ),
                  discount: 0,
                },
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
                        item_id: x.get('item_id')?.value,
                        item_unit_id: x.get('item_unit_id')?.value,
                        quantity: x.get('quantity')?.value,
                        price: x.get('price')?.value,
                      };
                    }),
                    purchase_invoice: {
                      name: '',
                      faktur: null,
                      date: this.datePipe.transform(
                        this.metaFormGroup.get('date')?.value,
                        'yyyy-MM-dd'
                      ),
                      discount: 0,
                    },
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

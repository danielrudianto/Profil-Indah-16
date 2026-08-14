import { DatePipe, NgIf, NgFor, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import {
  ProductSelectorComponent,
  ProductSelectorType,
} from 'src/app/components/product-selector/product-selector.component';
import { UpdateProductPurchasePriceComponent } from 'src/app/components/update-product-purchase-price/update-product-purchase-price.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { v4 } from 'uuid';
import { SubmitConfirmationComponent } from '../../../components/submit-confirmation/submit-confirmation.component';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { of, switchMap } from 'rxjs';
import { VerticalDividerComponent } from '../../../components/vertical-divider/vertical-divider.component';
import { BoxStepperComponent } from '../../../components/box-stepper/box-stepper.component';
import { AutocompleteSearchComponent } from '../../../components/autocomplete-search/autocomplete-search.component';
import { MatFormField, MatLabel, MatSuffix, MatHint, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatDivider } from '@angular/material/divider';
import { MatButton, MatIconButton } from '@angular/material/button';
import { NgxMaskDirective } from 'ngx-mask';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';

@Component({
    selector: 'app-purchase-invoice-create',
    templateUrl: './purchase-invoice-create.component.html',
    styleUrls: ['./purchase-invoice-create.component.css'],
    imports: [VerticalDividerComponent, BoxStepperComponent, AutocompleteSearchComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatDivider, MatButton, NgIf, NgFor, NgxMaskDirective, MatHint, MatIconButton, MatIcon, MatTooltip, EmptyTableComponent, MatPrefix, DecimalPipe, TranslatePipe]
})
export class PurchaseInvoiceCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private dynamicComponentService: DynamicComponentService,
    private _hotkeysService: HotkeysService,
    private sheet: MatBottomSheet,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this._hotkeysService.add([
      new Hotkey('alt+a', (event: KeyboardEvent): boolean => {
        this.openProductSelector();
        return false; // Prevent bubbling
      }),
    ]);
  }

  metaFormGroup: FormGroup = new FormGroup({
    uuid: new FormControl(v4(), Validators.required),
    company_id: new FormControl('', Validators.required),
    supplier_id: new FormControl('', Validators.required),
  });

  documentFormGroup: FormGroup = new FormGroup({
    date: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    invoice_name: new FormControl('', Validators.required),
    faktur: new FormControl('', Validators.pattern(/^(?:\d{10,17})?$/gm)),
  });

  itemFormGroup: FormGroup = new FormGroup({
    number_of_items: new FormControl(0, [
      Validators.required,
      Validators.min(1),
    ]),
    items: new FormArray([]),
  });

  valueFormGroup: FormGroup = new FormGroup({
    total: new FormControl(0, [Validators.required, Validators.min(1)]),
    discount: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  onSelectSupplier(data: any) {
    this.metaFormGroup.patchValue({
      supplier_id: data.id,
    });
  }

  onUnselectSupplier() {
    this.metaFormGroup.patchValue({
      supplier_id: '',
    });
  }

  onSelectCompany(data: any) {
    this.metaFormGroup.patchValue({
      company_id: data.id,
    });
  }

  onUnselectCompany() {
    this.metaFormGroup.patchValue({
      company_id: '',
    });
  }

  isSubmitting: boolean = false;
  get f() {
    return this.itemFormGroup.controls;
  }
  get t() {
    return this.f['items'] as FormArray;
  }

  unit_selection: any[] = [];

  ngOnInit(): void {
    this.itemFormGroup.controls['items'].valueChanges.subscribe(() => {
      this.valueFormGroup.patchValue({
        total: this.t.controls.reduce((acc, curr) => {
          const quantity = Number(curr.get('quantity')?.value || 0);
          const price = Number(curr.get('price')?.value || 0);
          const discount = Number(curr.get('discount')?.value || 0);
          return acc + quantity * (price - discount);
        }, 0),
      });
    });
  }

  ngOnDestroy(): void {
    this._hotkeysService.reset();
  }

  openProductSelector() {
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

        const existing = this.checkExistingProduct(
          data.id,
          sub == null ? null : sub.id
        );

        if (existing) {
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
            init_price: [
              sub == null ? data.purchase_price : sub.purchase_price,
            ],
            price: [sub == null ? data.purchase_price : sub.purchase_price],
            init_discount: [
              sub == null ? data.purchase_discount : sub.purchase_discount,
            ],
            discount: [
              sub == null ? data.purchase_discount : sub.purchase_discount,
            ],
            default_unit: [data.unit],
            save_price: [false],
          })
        );

        this.itemFormGroup.patchValue({
          number_of_items: this.t.length,
        });
      }
    });
  }

  private checkExistingProduct(
    productID: number,
    productUnitID: number | null
  ) {
    const data = this.t.controls.filter((x) => {
      return (
        x.get('product_id')?.value == productID &&
        x.get('product_unit_id')?.value == productUnitID
      );
    });

    return data.length > 0;
  }

  deleteItem(i: number) {
    this.t.removeAt(i);
    this.unit_selection.splice(i, 1);

    this.itemFormGroup.patchValue({
      number_of_items: this.t.length,
    });
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  submitForm() {
    this.isSubmitting = true;
    if (
      !this.metaFormGroup.valid ||
      !this.documentFormGroup.valid ||
      !this.itemFormGroup.valid ||
      !this.valueFormGroup.valid
    ) {
      this.alertService.showSuccess(
        this.translateService.instant('purchase-invoice__create__error')
      );
      this.isSubmitting = false;
      return;
    }

    if (
      this.valueFormGroup.get('discount')?.value >
      this.valueFormGroup.get('total')?.value
    ) {
      this.alertService.showSuccess('Discount cannot be greater than total.');
      this.isSubmitting = false;
      return;
    }

    const supplierId = this.metaFormGroup.controls['supplier_id'].value;
    const companyId = this.metaFormGroup.controls['company_id'].value;
    const date = this.documentFormGroup.controls['date'].value as Date;
    const name = this.documentFormGroup.controls['name'].value;
    const invoice_name = this.documentFormGroup.controls['invoice_name'].value;
    const discount = parseFloat(this.valueFormGroup.controls['discount'].value);
    const faktur =
      this.documentFormGroup.controls['faktur'].value == ''
        ? null
        : this.documentFormGroup.controls['faktur'].value;

    const items: any[] = [];
    this.t.controls.forEach((x) => {
      const product_id = x.get('product_id')?.value;
      const quantity = x.get('quantity')?.value;
      const price = x.get('price')?.value;
      let discount = 0;
      const initial_price = parseFloat(x.get('initial_price')?.value);
      const save_price =
        price == initial_price ? false : x.get('save_price')?.value;
      const product_unit_id = x.get('product_unit_id')?.value;
      const discountType = x.get('discountType')?.value;
      if (discountType == 'percentage') {
        discount = parseFloat(
          parseFloat(((price * discount) / 100).toString()).toFixed(2)
        );
      } else {
        discount = parseFloat(parseFloat(x.get('discount')?.value).toFixed(2));
      }

      items.push({
        product_id: product_id,
        quantity: quantity,
        price: price,
        discount: discount,
        save: save_price,
        product_unit_id: product_unit_id,
      });
    });

    const goodReceipt = {
      uuid: this.metaFormGroup.controls['uuid'].value,
      name: name,
      date: this.datePipe.transform(date, 'yyyy-MM-dd'),
      good_receipt: items,
      company_id: companyId,
      supplier_id: supplierId,
      invoice_name: invoice_name,
      faktur: faktur,
      is_confirm: true,
      discount: discount,
    };

    this.apiService
      .post('good-receipt/check', {
        name: name,
      })
      .pipe(
        switchMap((data: any) => {
          if (data) {
            return this.dialog
              .open(SubmitConfirmationComponent, {
                data: {
                  title: this.translateService.instant(
                    'general__confirm-confirmation__body'
                  ),
                },
              })
              .afterClosed();
          } else {
            return of(true);
          }
        }),
        switchMap((confirmed: boolean) => {
          if (confirmed !== true) {
            this.isSubmitting = false;
            return of(null);
          }

          if (confirmed === true) {
            return this.apiService.post('good-receipt', goodReceipt);
          }

          return of(null);
        }),
        switchMap((result) => {
          if (result == null) return of(null);

          const itemsToSave = this.t.controls
            .filter((x) => x.get('save_price')?.value)
            .map((x) => ({
              product_id: x.get('product_id')?.value,
              product_unit_id: x.get('product_unit_id')?.value,
              price: x.get('price')?.value,
              discount: x.get('discount')?.value,
            }));

          if (itemsToSave.length > 0) {
            // Post to purchase-price
            return this.apiService.put('product/price-purchase', {
              items: itemsToSave,
            });
          }

          return of(null);
        })
      )
      .subscribe({
        next: (data) => {
          if (data != null) {
            this.metaFormGroup.patchValue({
              uuid: v4(),
            });
            this.alertService.showSuccess(
              this.translateService.instant('good-receipt__create__success')
            );
            this.t.clear();
            this.documentFormGroup.reset();
            this.itemFormGroup.reset();
          }
        },
        error: (error) => {
          this.alertService.showError(new Error(error));
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  openEditData(i: number) {
    this.dialog
      .open(UpdateProductPurchasePriceComponent, {
        data: {
          price: this.t.at(i).get('price')?.value,
          discount: this.t.at(i).get('discount')?.value,
          initial_price: this.t.at(i).get('initial_price')?.value,
          initial_discount: this.t.at(i).get('initial_discount')?.value,
          save_price: this.t.at(i).get('save_price')?.value,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data != undefined) {
          this.t.at(i).patchValue({
            price: data.price,
            discount: data.discount,
            save_price: data.save_price,
          });
        }
      });
  }

  canExit() {
    if (
      this.metaFormGroup.dirty ||
      this.documentFormGroup.dirty ||
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

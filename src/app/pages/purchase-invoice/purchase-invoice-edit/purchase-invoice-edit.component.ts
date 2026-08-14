import { DatePipe, NgIf, NgFor, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
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
import { Location } from '@angular/common';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { VerticalDividerComponent } from '../../../components/vertical-divider/vertical-divider.component';
import { BoxStepperComponent } from '../../../components/box-stepper/box-stepper.component';
import { AutocompleteSearchComponent } from '../../../components/autocomplete-search/autocomplete-search.component';
import { MatFormField, MatLabel, MatSuffix, MatHint, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatDivider } from '@angular/material/divider';
import { NgxMaskDirective } from 'ngx-mask';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';

@Component({
    selector: 'app-purchase-invoice-edit',
    templateUrl: './purchase-invoice-edit.component.html',
    styleUrls: ['./purchase-invoice-edit.component.scss'],
    imports: [VerticalDividerComponent, BoxStepperComponent, AutocompleteSearchComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatDivider, NgxMaskDirective, MatButton, NgIf, NgFor, MatHint, MatIconButton, MatIcon, MatTooltip, EmptyTableComponent, MatPrefix, DecimalPipe, TranslatePipe]
})
export class PurchaseInvoiceEditComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private dynamicComponentService: DynamicComponentService,
    private _hotkeysService: HotkeysService,
    private sheet: MatBottomSheet,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {
    this._hotkeysService.add([
      new Hotkey('alt+a', (event: KeyboardEvent): boolean => {
        this.openItemSelector();
        return false; // Prevent bubbling
      }),
      new Hotkey('alt+s', (event: KeyboardEvent): boolean => {
        if (
          this.metaFormGroup.valid &&
          this.documentFormGroup.valid &&
          this.itemFormGroup.valid &&
          this.valueFormGroup.valid
        ) {
          this.submitForm();
        } else {
          this.alertService.showError(Error('Please check your input.'));
        }
        return false;
      }),
    ]);
  }

  isLoading: boolean = false;

  /**
   * Meta form group
   * Used for filling in company and supplier data
   */
  metaFormGroup: FormGroup = new FormGroup({
    uuid: new FormControl(v4(), Validators.required),
    company_id: new FormControl('', Validators.required),
    supplier_id: new FormControl('', Validators.required),
    company_name: new FormControl('', Validators.required),
    supplier_name: new FormControl('', Validators.required),
  });

  /**
   * Document form group
   * Used for filling in document data
   * Such as date, name, invoice name, and faktur
   */
  documentFormGroup: FormGroup = new FormGroup({
    date: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    invoice_name: new FormControl('', Validators.required),
    faktur: new FormControl('', Validators.pattern(/(^$|(^([0-9]{16})$))/g)),
  });

  /**
   * Item form group
   * Used for filling in item data
   * Such as item name, quantity, and price
   */
  itemFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
  });

  /**
   * Value form group
   * Used for filling in total and discount data
   * Such as total and discount
   */
  valueFormGroup: FormGroup = new FormGroup({
    total: new FormControl(0, [Validators.required, Validators.min(1)]),
    discount: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  /**
   * Updates the supplier_id field in the metaFormGroup with the id of the selected supplier.
   * @param {any} data - The data object containing the id of the selected supplier.
   */
  onSelectSupplier(data: any) {
    this.metaFormGroup.patchValue({
      supplier_id: data.id,
      supplier_name: data.name,
    });
  }

  /**
   * Updates the supplier_id field in the metaFormGroup with the id of the selected supplier.
   * @param {any} data - The data object containing the id of the selected supplier.
   */
  onUnselectSupplier() {
    this.metaFormGroup.patchValue({
      supplier_id: '',
      supplier_name: '',
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
    this.apiService
      .get(`good-receipt/${this.route.snapshot.paramMap.get('id')}`)
      .subscribe({
        next: (data: any) => {
          if (data.is_delete || !data.is_confirm) {
            this.alertService.showSuccess(
              this.translateService.instant('general__not-found')
            );
            this.router.navigate(['/Administrator/Purchase-invoice']);
          }
          this.metaFormGroup.patchValue({
            company_id: data.company_id,
            supplier_id: data.supplier_id,
            company_name: data.company.name,
            supplier_name: data.supplier.name,
          });

          this.documentFormGroup.patchValue({
            date: data.date,
            name: data.name,
            invoice_name: data.invoice_name,
            faktur: data.faktur,
          });

          data.good_receipt.forEach((x: any) => {
            this.t.push(
              this.formBuilder.group({
                product_id: [x.product_id, Validators.required],
                product_unit_id: [x.product_unit_id],
                reference: [x.product.reference, Validators.required],
                description: [x.product.description, Validators.required],
                quantity: [
                  x.quantity,
                  [Validators.required, Validators.min(0.01)],
                ],
                price: [x.price, [Validators.min(0), Validators.required]],
                discount: [x.discount, [Validators.min(0)]],
                unit: [
                  x.product_unit_id == null
                    ? x.product.unit
                    : x.product_unit.unit,
                ],
                conversion: [
                  x.product_unit_id == null ? 1 : x.product_unit.conversion,
                ],
                default_unit: [x.product.unit],
                save_price: [false],
              })
            );
          });

          this.valueFormGroup.patchValue({
            discount: data.discount,
          });
        },
      })
      .add(() => {
        this.isLoading = false;
      });
    this.itemFormGroup.controls['items'].valueChanges.subscribe(() => {
      this.valueFormGroup.patchValue({
        total: this.t.controls.reduce((acc, curr) => {
          const price = curr.get('price')?.value || 0;
          const quantity = curr.get('quantity')?.value || 0;
          return acc + price * quantity;
        }, 0),
      });
    });
  }

  ngOnDestroy(): void {
    this._hotkeysService.reset();
  }

  openItemSelector() {
    this.dynamicComponentService
      .createDynamicComponent(ProductSelectorComponent, {
        type: ProductSelectorType.purchase,
      })
      .subscribe((result) => {
        console.log(result);
        if (result) {
          const productID = result.data.id;
          const productUnitID = result.sub == null ? null : result.sub.id;

          const exists = this.checkExistingItem(productID, productUnitID);

          if (exists) {
            this.alertService.showSuccess(
              this.translateService.instant('general__item__exists')
            );
            return;
          }

          const data = result.data;
          const sub = result.sub;

          this.t.push(
            this.formBuilder.group({
              product_id: [data.id, Validators.required],
              product_unit_id: [sub == null ? null : sub.id],
              reference: [data.reference, Validators.required],
              description: [data.description, Validators.required],
              quantity: [0, [Validators.required, Validators.min(0.01)]],
              price: [
                data.purchase_price,
                [Validators.min(0), Validators.required],
              ],
              discount: [data.purchase_discount, [Validators.min(0)]],
              unit: [sub == null ? data.unit : sub.unit],
              conversion: [sub == null ? 1 : sub.conversion],
              default_unit: [data.unit],
              save_price: [false],
            })
          );
        }
      });
  }

  private checkExistingItem(
    productID: number,
    productUnitID: number | null
  ): boolean {
    return this.t.controls.some(
      (x) =>
        x.get('product_id')?.value === productID &&
        x.get('product_unit_id')?.value === productUnitID
    );
  }

  deleteItem(i: number) {
    this.t.removeAt(i);
    this.unit_selection.splice(i, 1);
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  submitForm() {
    if (
      !this.metaFormGroup.valid ||
      !this.documentFormGroup.valid ||
      !this.itemFormGroup.valid ||
      !this.valueFormGroup.valid
    ) {
      return;
    }

    if (
      this.valueFormGroup.get('discount')?.value >
      this.valueFormGroup.get('total')?.value
    ) {
      return;
    }

    this.isSubmitting = true;

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
      const product_id = parseInt(x.get('product_id')?.value);
      const quantity = parseInt(x.get('quantity')?.value);
      const price = parseFloat(x.get('price')?.value);
      let discount = 0;
      const initial_price = parseFloat(x.get('initial_price')?.value);
      const save_price =
        price == initial_price ? false : x.get('save_price')?.value;
      const item_unit_id = parseInt(x.get('item_unit_id')?.value);
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
        item_unit_id: item_unit_id == 0 ? null : item_unit_id,
      });
    });

    const goodReceipt = {
      id: Number(this.route.snapshot.paramMap.get('id')),
      uuid: this.metaFormGroup.controls['uuid'].value,
      name: name,
      date: this.datePipe.transform(date, 'yyyy-MM-dd'),
      good_receipt: items,
      company_id: companyId,
      supplier_id: supplierId,
      invoice_name: invoice_name,
      discount: discount,
      is_confirm: true,
      confirmed_at: new Date(),
      faktur: faktur,
    };

    this.apiService
      .put('good-receipt', goodReceipt)
      .subscribe({
        next: () => {
          this.alertService.showSuccess(
            this.translateService.instant(
              'purchase-invoice__update__success__message'
            )
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
        autoFocus: '#price',
      })
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.t.at(i).patchValue({
            price: data.price,
            dicount: data.discount,
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

import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ActivatedRoute, Router } from '@angular/router';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import {
  ProductSelectorComponent,
  ProductSelectorType,
} from 'src/app/presentation/components/product-selector/product-selector.component';
import { UpdateProductPurchasePriceComponent } from 'src/app/presentation/components/update-product-purchase-price/update-product-purchase-price.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { v4 } from 'uuid';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-purchase-invoice-edit',
  templateUrl: './purchase-invoice-edit.component.html',
  styleUrls: ['./purchase-invoice-edit.component.css'],
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
    private translateService: TranslateService
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
            product_id: [data.product_id, Validators.required],
            product_unit_id: [
              data.price == null ? null : data.price.item_unit_id,
            ],
            reference: [data.item.reference, Validators.required],
            description: [data.item.description, Validators.required],
            quantity: [0, [Validators.required, Validators.min(0.01)]],
            price: [
              data.price == null ? data.item.price : data.price.price,
              [Validators.min(0), Validators.required],
            ],
            discount: [
              data.price == null ? data.item.discount : data.price.discount,
              [Validators.min(0), Validators.required],
            ],
            discountPercentage: [
              data.price == null
                ? data.item.price == 0
                  ? 0
                  : (data.item.discount * 100) / data.item.price
                : data.price.price == 0
                ? 0
                : (data.price.discount * 100) / data.price.price,
              [Validators.min(0), Validators.required, Validators.max(100)],
            ],
            discountType: [
              'absolute',
              [Validators.required, Validators.pattern('absolute|percentage')],
            ],
            initial_price: [
              data.price == null ? data.item.price : data.price.price,
              Validators.required,
            ],
            initial_discount: [
              data.discount == null ? data.item.discount : data.price.discount,
              Validators.required,
            ],
            unit: [data.price == null ? data.item.unit : data.price.unit],
            conversion: [data.price == null ? 1 : data.price.conversion],
            default_unit: [data.item.unit],
            save_price: [false],
            stock: [data.item.stock],
          });

          this.t.push(productFormGroup);
        }
      }
    });
  }

  deleteItem(i: number) {
    this.t.removeAt(i);
    this.unit_selection.splice(i, 1);
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
        'Please check your input. Some of the input is invalid.'
      );
      this.isSubmitting = false;
      return;
    } else if (
      this.valueFormGroup.get('discount')?.value >
      this.valueFormGroup.get('total')?.value
    ) {
      this.alertService.showSuccess('Discount cannot be greater than total.');
      this.isSubmitting = false;
      return;
    } else {
      const supplierId = this.metaFormGroup.controls['supplier_id'].value;
      const companyId = this.metaFormGroup.controls['company_id'].value;
      const date = this.documentFormGroup.controls['date'].value as Date;
      const name = this.documentFormGroup.controls['name'].value;
      const invoice_name =
        this.documentFormGroup.controls['invoice_name'].value;
      const discount = parseFloat(
        this.valueFormGroup.controls['discount'].value
      );
      const faktur =
        this.documentFormGroup.controls['faktur'].value == ''
          ? null
          : this.documentFormGroup.controls['faktur'].value;

      const items: any[] = [];
      this.t.controls.forEach((x) => {
        const item_id = parseInt(x.get('item_id')?.value);
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
          discount = parseFloat(
            parseFloat(x.get('discount')?.value).toFixed(2)
          );
        }

        items.push({
          item_id: item_id,
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
        purchase_invoice: {
          name: invoice_name,
          date: this.datePipe.transform(date, 'yyyy-MM-dd'),
          discount: discount,
          is_confirm: true,
          confirmed_at: new Date(),
          faktur: faktur,
        },
      };

      this.apiService
        .put('purchase-invoice', goodReceipt)
        .subscribe({
          next: () => {
            this.alertService.showSuccess(
              'Purchase invoice successfully updated.'
            );
            this.t.clear();
            this.documentFormGroup.reset();
            this.itemFormGroup.reset();

            this.location.back();
          },
          error: (error) => {
            this.alertService.showError(new Error(error));
          },
        })
        .add(() => {
          this.isSubmitting = false;
        });
    }
  }

  openEditData(i: number) {
    const sheet = this.sheet.open(UpdateProductPurchasePriceComponent, {
      data: {
        price: this.t.at(i).get('price')?.value,
        discount: this.t.at(i).get('discount')?.value,
        initial_price: this.t.at(i).get('initial_price')?.value,
        initial_discount: this.t.at(i).get('initial_discount')?.value,
        save_price: this.t.at(i).get('save_price')?.value,
      },
    });

    sheet.afterDismissed().subscribe((data) => {
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

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

@Component({
  selector: 'app-package-create',
  templateUrl: './package-create.component.html',
  styleUrls: ['./package-create.component.css'],
})
export class PackageCreateComponent {
  constructor(
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private alertService: AlertService,
    private _hotkeysService: HotkeysService,
    private apiService: ApiService,
    private dynamicComponentService: DynamicComponentService,
    private translateService: TranslateService
  ) {
    this._hotkeysService.add([
      new Hotkey('alt+a', (event: KeyboardEvent): boolean => {
        this.openItemSelector();
        return false; // Prevent bubbling
      }),
    ]);
  }

  metaFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required, Validators.min(1)]),
  });

  itemsFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
    number_of_items: new FormControl(0, Validators.min(1)),
    value: new FormControl(0),
    valueWODiscount: new FormControl(0),
  });

  ngOnInit(): void {
    this.t.valueChanges.subscribe(() => {
      let totalPrice = 0;
      let valueWODiscount = 0;
      if (this.t.controls.length > 0) {
        this.t.controls.forEach((x) => {
          const discount = Number(x.get('discount')?.value);
          const price = Number(x.get('price')?.value);
          const quantity = Number(x.get('quantity')?.value);

          totalPrice += quantity * (price - discount);
          valueWODiscount += quantity * price;
        });

        this.itemsFormGroup.patchValue({
          value: totalPrice,
          valueWODiscount: valueWODiscount,
        });
      }
    });
  }

  get f() {
    return this.itemsFormGroup.controls;
  }
  get t() {
    return this.f['items'] as FormArray;
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  removeItem(i: number) {
    this.t.removeAt(i);
  }

  openItemSelector() {
    const dialog = this.dynamicComponentService.createDynamicComponent(
      ProductSelectorComponent,
      {
        type: ProductSelectorType.sales,
      }
    );
    let validation = true;

    dialog.subscribe((data) => {
      if (data != null && data != undefined) {
        this.t.controls.forEach((x) => {
          if (
            parseInt(x.get('item_id')?.value) == data.item.id &&
            x.get('item_unit_id')?.value ==
              (data.price == null ? null : data.price.item_unit_id)
          ) {
            validation = false;
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
              quantity: [0, [Validators.required, Validators.min(0.01)]],
              price: [
                data.price == null ? data.item.price : data.price.price,
                [Validators.min(0), Validators.required],
              ],
              discount: [
                data.price == null ? data.item.discount : data.price.discount,
                [Validators.required, Validators.min(0)],
              ],
              unit: [
                data.price == null ? data.item.unit : data.price.unit,
                Validators.required,
              ],
              conversion: [
                data.price == null ? 1 : data.price.conversion,
                Validators.required,
              ],
              default_unit: [
                data.price == null ? data.item.unit : data.price.unit,
              ],
            })
          );

          this.itemsFormGroup.patchValue({
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

  submitForm() {
    this.apiService
      .post('product-package', {
        name: this.metaFormGroup.get('name')?.value,
        description: this.metaFormGroup.get('description')?.value,
        price: this.metaFormGroup.get('price')?.value,
        package_content: this.t.value.map((x: any) => {
          return {
            item_id: x.item_id,
            item_unit_id: x.item_unit_id,
            quantity: x.quantity,
            price: x.price,
            discount: x.discount,
          };
        }),
      })
      .subscribe({
        next: (result: any) => {
          this.alertService.showInfo(
            `${this.translateService.instant(
              'package__create__success-suffix'
            )} ${result.name} ${this.translateService.instant(
              'package__create__success-prefix'
            )}`
          );
          this.metaFormGroup.reset();
          this.itemsFormGroup.reset();
          this.t.clear();

          this.itemsFormGroup.patchValue({
            number_of_items: this.t.length,
            value: 0,
            valueWODiscount: 0,
          });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      });
  }
}

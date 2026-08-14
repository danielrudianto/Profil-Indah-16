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
import { VerticalDividerComponent } from '../../../components/vertical-divider/vertical-divider.component';
import { BoxStepperComponent } from '../../../components/box-stepper/box-stepper.component';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatButton, MatIconButton } from '@angular/material/button';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';

@Component({
    selector: 'app-package-create',
    templateUrl: './package-create.component.html',
    styleUrls: ['./package-create.component.css'],
    imports: [VerticalDividerComponent, BoxStepperComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, NgxMaskDirective, MatButton, NgIf, NgFor, MatHint, MatIconButton, MatIcon, EmptyTableComponent, DecimalPipe, TranslateModule]
})
export class PackageCreateComponent {
  constructor(
    private formBuilder: FormBuilder,
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

  isSubmitting: boolean = false;

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

      this.itemsFormGroup.patchValue({
        number_of_items: this.t.length,
      });
    });
  }

  ngOnDestroy(): void {
    this._hotkeysService.reset();
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
    const dialog = this.dynamicComponentService
      .createDynamicComponent(ProductSelectorComponent, {})
      .subscribe((result: any) => {
        if (result) {
          const data = result.data;
          const sub = result.sub;
          const check = this.checkProductExists(
            data.id,
            sub == null ? null : sub.id
          );

          if (!check) {
            this.alertService.showSuccess(
              this.translateService.instant('general__item__exists')
            );
            return;
          }

          this.t.push(
            this.formBuilder.group({
              product_id: [data.id, Validators.required],
              product_unit_id: [sub == null ? null : sub.id],
              reference: [data.reference, Validators.required],
              description: [data.description, Validators.required],
              price: [
                sub == null ? data.sales_price : sub.sales_price,
                [Validators.required, Validators.min(0.01)],
              ],
              discount: [
                sub == null ? data.sales_discount : sub.sales_discount,
                [Validators.required, Validators.min(0)],
              ],
              quantity: [0, [Validators.required, Validators.min(0.01)]],
            })
          );
        }
      });
  }

  private checkProductExists(productID: number, productUnitID: number | null) {
    const index = this.t.value.findIndex((x: any) => {
      return x.product_id == productID && x.product_unit_id == productUnitID;
    });

    return index == -1 ? true : false;
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService
      .post('product-package', {
        name: this.metaFormGroup.get('name')?.value,
        description: this.metaFormGroup.get('description')?.value,
        price: this.metaFormGroup.get('price')?.value,
        package_content: this.t.value.map((x: any) => {
          return {
            product_id: x.product_id,
            product_unit_id: x.product_unit_id,
            quantity: x.quantity,
            price: x.price - x.discount,
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
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }
}

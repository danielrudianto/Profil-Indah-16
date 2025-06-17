import { Component, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { TranslateService } from '@ngx-translate/core';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ValueValidator } from 'src/app/validators/value.validator';
import { ProductCreateUnitComponent } from './product-create-unit/product-create-unit.component';

@Component({
  selector: 'app-product-create',
  templateUrl: './product-create.component.html',
  styleUrls: ['./product-create.component.css'],
  animations: [slideInOutAnimation],
})
export class ProductCreateComponent {
  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {}

  @ViewChild('stepper') stepper!: MatStepper;
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  isLoadingType: boolean = false;
  item_brands: any[] = [];
  item_types: any[] = [];
  isOpened: boolean = true;

  itemFormGroup: FormGroup = new FormGroup({
    reference: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(50),
      Validators.pattern(/^(?!bulk$).*$/),
    ]),
    description: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(500),
    ]),
    product_brand_id: new FormControl('', Validators.required),
    product_type_id: new FormControl('', Validators.required),
    unit: new FormControl('', Validators.required),
    minimum_stock: new FormControl(0, [Validators.required, Validators.min(0)]),
    sales_price: new FormControl(0, [Validators.required, Validators.min(0)]),
    sales_discount: new FormControl(0, [
      Validators.required,
      Validators.min(0),
    ]),
    purchase_price: new FormControl(0, [
      Validators.required,
      Validators.min(0),
    ]),
    purchase_discount: new FormControl(0, [
      Validators.required,
      Validators.min(0),
    ]),
  });

  unitFormGroup: FormGroup = new FormGroup({
    item_units: new FormArray([]),
  });

  ngOnInit(): void {}

  get f() {
    return this.unitFormGroup.controls;
  }
  get t() {
    return this.f['item_units'] as FormArray;
  }

  getFormAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  onSelectBrand(data: any) {
    this.itemFormGroup.patchValue({
      product_brand_id: data.id,
    });
  }

  onUnselectBrand() {
    this.itemFormGroup.patchValue({
      product_brand_id: '',
    });
  }

  onSelectType(data: any) {
    this.itemFormGroup.patchValue({
      product_type_id: data.id,
    });
  }

  onUnselectType() {
    this.itemFormGroup.patchValue({
      product_type_id: '',
    });
  }

  submitForm() {
    this.isSubmitting = true;

    this.apiService
      .post('product', {
        ...this.itemFormGroup.value,
        units: this.t.controls.map((x) => {
          return {
            conversion: Number(x.get('conversion')?.value ?? '0'),
            unit: x.get('unit')?.value,
            sales_price: Number(x.get('sales_price')?.value ?? '0'),
            sales_discount: Number(x.get('sales_discount')?.value ?? '0'),
            purchase_price: Number(x.get('purchase_price')?.value ?? '0'),
            purchase_discount: Number(x.get('purchase_discount')?.value ?? '0'),
          };
        }),
      })
      .subscribe({
        next: (data: any) => {
          this.translateService
            .get('general__created-successfully')
            .subscribe((translation) => {
              this.alertService.showSuccess(`${data.reference} ${translation}`);
              this.itemFormGroup.reset();
              this.unitFormGroup.reset();
              this.t.clear();

              this.stepper.selectedIndex = 0;
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

  selectBrand(event: any) {
    this.itemFormGroup.patchValue({
      brand: event.option.value.id,
      brand_search_bar: event.option.value.name,
    });
  }

  selectType(event: any) {
    this.itemFormGroup.patchValue({
      type: event.option.value.id,
      type_search_bar: event.option.value.name,
    });
  }

  addBrand(brandName: string) {
    this.isLoading = true;
    this.apiService
      .post('product-brand', {
        name: brandName,
      })
      .subscribe({
        next: (data: any) => {
          var itemBrand = data as any;
          this.itemFormGroup.patchValue({
            brand: itemBrand,
            brand_search_bar: itemBrand.name,
          });
        },
        error: (error: any) => {},
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  addType(typeName: string) {
    this.isLoadingType = true;
    this.apiService
      .post('product-type', {
        name: typeName,
      })
      .subscribe({
        next: (data: any) => {
          var itemType = data as any;
          this.itemFormGroup.patchValue({
            type: itemType,
            type_search_bar: itemType.name,
          });
        },
        error: (error: any) => {},
      })
      .add(() => {
        this.isLoadingType = false;
      });
  }

  addUnit() {
    this.dialog
      .open(ProductCreateUnitComponent, {})
      .afterClosed()
      .subscribe((data) => {
        if (data) {
          this.t.push(
            this.formBuilder.group({
              unit: [data.unit, [Validators.required, ValueValidator(1)]],
              conversion: [
                data.conversion,
                [Validators.required, Validators.min(1)],
              ],
              sales_price: [
                data.sales_price,
                [Validators.required, Validators.min(0)],
              ],
              sales_discount: [
                data.sales_discount,
                [Validators.required, Validators.min(0)],
              ],
              purchase_price: [
                data.purchase_price,
                [Validators.required, Validators.min(0)],
              ],
              purchase_discount: [
                data.purchase_discount,
                [Validators.required, Validators.min(0)],
              ],
            })
          );
        }
      });
  }

  removeUnit(i: number) {
    this.t.removeAt(i);
  }
}

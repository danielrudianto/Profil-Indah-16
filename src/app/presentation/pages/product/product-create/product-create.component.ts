import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ValueValidator } from 'src/app/validators/value.validator';

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
    private dynamicComponentService: DynamicComponentService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

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
    brand: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
    minimum_stock: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  unitFormGroup: FormGroup = new FormGroup({
    other: new FormArray([]),
    item_purchase_price: new FormControl(0, [
      Validators.required,
      Validators.min(0),
    ]),
    item_purchase_discount: new FormControl(0, [
      Validators.required,
      Validators.min(0),
    ]),
    unit: new FormControl('', Validators.required),
    price: new FormControl(0, [Validators.required, Validators.min(0)]),
    discount: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  stepIndex: number = 0;

  steps: any[] = [
    {
      label: 'General',
      disabled: false,
      selected: this.stepIndex == 0,
    },
    {
      label: 'Unit',
      disabled: !this.itemFormGroup.valid,
      selected: this.stepIndex == 1,
    },
    {
      label: 'Price',
      disabled: !this.unitFormGroup.valid,
      selected: this.stepIndex == 2,
    },
  ];

  ngOnInit(): void {
    this.itemFormGroup.statusChanges.subscribe((status) => {
      if (status == 'VALID') {
        this.steps[1].disabled = false;
      } else {
        this.steps[1].disabled = true;
      }
    });

    this.unitFormGroup.statusChanges.subscribe((status) => {
      if (status == 'VALID') {
        this.steps[2].disabled = false;
      } else {
        this.steps[2].disabled = true;
      }
    });
  }

  closeDialog() {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }

  selectStep(event: number) {
    this.stepIndex = event;
  }

  get f() {
    return this.unitFormGroup.controls;
  }
  get t() {
    return this.f['other'] as FormArray;
  }

  getFormAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  onSelectBrand(data: any) {
    this.itemFormGroup.patchValue({
      brand: data.id,
    });
  }

  onUnselectBrand() {
    this.itemFormGroup.patchValue({
      brand: '',
    });
  }

  onSelectType(data: any) {
    this.itemFormGroup.patchValue({
      type: data.id,
    });
  }

  onUnselectType() {
    this.itemFormGroup.patchValue({
      type: '',
    });
  }

  submitForm() {
    this.isSubmitting = true;
    const item: any = {
      reference: this.itemFormGroup.controls['reference'].value,
      description: this.itemFormGroup.controls['description'].value,
      brand: this.itemFormGroup.controls['brand'].value,
      type: this.itemFormGroup.controls['type'].value,
      price: Number(this.unitFormGroup.controls['price'].value),
      discount: Number(this.unitFormGroup.controls['discount'].value),
      minimum_stock: Number(this.itemFormGroup.controls['minimum_stock'].value),
      purchase_price: Number(
        this.unitFormGroup.controls['item_purchase_price'].value
      ),
      purchase_discount: Number(
        this.unitFormGroup.controls['item_purchase_discount'].value
      ),
      unit: this.unitFormGroup.controls['unit'].value,
      units: [],
    };

    this.t.controls.forEach((x) => {
      const conversion = Number(x.get('conversion')?.value ?? '0');
      const unit = x.get('unit')?.value;
      const price = Number(x.get('price')?.value ?? '0');
      const discount = Number(x.get('discount')?.value ?? '0');
      const price_purchase = Number(x.get('purchase_price')?.value ?? '0');
      const discount_purchase = Number(
        x.get('purchase_discount')?.value ?? '0'
      );

      item.units.push({
        conversion: conversion,
        unit: unit,
        price: price,
        discount: discount,
        price_purchase: price_purchase,
        discount_purchase: discount_purchase,
      });
    });

    this.apiService
      .post('product', item)
      .subscribe({
        next: (data: any) => {
          this.translateService
            .get('general__created-successfully')
            .subscribe((translation) => {
              this.alertService.showSuccess(`${data.reference} ${translation}`);
              this.closeDialog();
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
    this.t.push(
      this.formBuilder.group({
        conversion: [0, [Validators.required, Validators.min(1)]],
        unit: ['', [Validators.required, ValueValidator(1)]],
        price: [0, [Validators.required, Validators.min(0)]],
        discount: [0, [Validators.required, Validators.min(0)]],
        purchase_price: [0, [Validators.required, Validators.min(0)]],
        purchase_discount: [0, [Validators.required, Validators.min(0)]],
      })
    );
  }

  removeUnit(i: number) {
    this.t.removeAt(i);
  }
}

import { Component, Inject, Input } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-price-sales-update',
  templateUrl: './price-sales-update.component.html',
  styleUrls: ['./price-sales-update.component.css'],
})
export class PriceSalesUpdateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private dialog: MatDialogRef<PriceSalesUpdateComponent>
  ) {}

  isSubmitting: boolean = false;
  isLoading: boolean = true;

  discountLessThanPriceValidator(control: AbstractControl) {
    const formGroup = control as FormGroup;
    const price = formGroup.get('sales_price')?.value;
    const discount = formGroup.get('sales_discount')?.value;
    return discount > price ? { discountTooHigh: true } : null;
  }

  priceFormGroup: FormGroup = new FormGroup(
    {
      reference: new FormControl(''),
      description: new FormControl(''),
      sales_price: new FormControl(0, [Validators.required, Validators.min(0)]),
      sales_discount: new FormControl(0, [
        Validators.required,
        Validators.min(0),
      ]),
      product_id: new FormControl('', Validators.required),
      unit: new FormControl('', Validators.required),
      product_unit: new FormArray([]),
    },
    [this.discountLessThanPriceValidator]
  );

  ngOnInit(): void {
    this.fetchByID();

    this.priceFormGroup.valueChanges.subscribe(() => {
      console.log(this.priceFormGroup.controls);
    });
  }

  get f() {
    return this.priceFormGroup.controls;
  }

  get t() {
    return this.priceFormGroup.get('product_unit') as FormArray;
  }

  fetchByID(): void {
    this.apiService
      .get(`product-price-sales/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.priceFormGroup.patchValue({
            reference: data.reference,
            description: data.description,
            sales_price: data.sales_price,
            sales_discount: data.sales_discount,
            unit: data.unit,
            product_id: data.id,
          });

          for (let i = 0; i < data.product_unit.length; i++) {
            this.t.push(
              this.formBuilder.group({
                product_id: [data.id],
                product_unit_id: [data.product_unit[i].id],
                unit: [data.product_unit[i].unit],
                sales_price: [
                  data.product_unit[i].sales_price,
                  [Validators.required, Validators.min(0)],
                ],
                sales_discount: [
                  data.product_unit[i].sales_discount,
                  [Validators.required, Validators.min(0)],
                ],
                conversion: [data.product_unit[i].conversion],
              })
            );
          }
        },
        error: (error) => {
          this.alertService.showError(error);
          this.closeDialog();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  closeDialog(data: any = undefined) {
    this.dialog.close(data);
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .put('product-price-sales', this.priceFormGroup.value)
      .subscribe({
        next: (_) => {
          this.alertService.showSuccess(
            this.translateService.instant('sales-price__update__success')
          );
          this.closeDialog(this.priceFormGroup.value);
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

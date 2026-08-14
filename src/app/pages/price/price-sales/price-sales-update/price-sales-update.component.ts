import { Component, Inject, Input } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgFor, NgIf } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-price-sales-update',
    templateUrl: './price-sales-update.component.html',
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, NgFor, NgIf, MatFormField, MatLabel, MatInput, NgxMaskDirective, MatDialogActions, MatButton, TranslatePipe]
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

  discountLessThanPriceValidator(control: AbstractControl) {
    const formGroup = control as FormGroup;
    const price = formGroup.get('price')?.value;
    const discount = formGroup.get('discount')?.value;
    return discount > price ? { discountTooHigh: true } : null;
  }

  isSubmitting: boolean = false;
  isLoading: boolean = true;

  priceFormGroup: FormGroup = new FormGroup({
    reference: new FormControl(''),
    description: new FormControl(''),
    unit: new FormControl(''),
    id: new FormControl('', Validators.required),
    sales_price: new FormArray([]),
  });

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
    return this.priceFormGroup.get('sales_price') as FormArray;
  }

  fetchByID(): void {
    this.apiService
      .get(`product/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.priceFormGroup.patchValue({
            reference: data.reference,
            description: data.description,
            unit: data.unit,
            id: data.id,
          });

          this.t.push(
            this.formBuilder.group(
              {
                unit: [data.unit],
                product_unit_id: [null],
                price: [
                  data.sales_price,
                  [Validators.min(0), Validators.required],
                ],
                discount: [
                  data.sales_discount,
                  [Validators.min(0), Validators.required],
                ],
                conversion: [1],
              },
              {
                validators: this.discountLessThanPriceValidator,
              }
            )
          );

          data.product_unit.forEach((x: any) => {
            this.t.push(
              this.formBuilder.group(
                {
                  unit: [x.unit],
                  product_unit_id: [x.id],
                  price: [
                    x.sales_price,
                    [Validators.min(0), Validators.required],
                  ],
                  discount: [
                    x.sales_discount,
                    [Validators.min(0), Validators.required],
                  ],
                  conversion: [x.conversion],
                },
                {
                  validators: this.discountLessThanPriceValidator,
                }
              )
            );
          });
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
      .put('product-price-sales', {
        product_id: this.priceFormGroup.get('id')?.value,
        data: this.t.value,
      })
      .subscribe({
        next: (_) => {
          this.alertService.showSuccess(
            this.translateService.instant('sales-price__update__success')
          );
          this.closeDialog(this.t.value);
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

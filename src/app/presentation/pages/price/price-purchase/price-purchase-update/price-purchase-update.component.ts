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
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-price-purchase-update',
  templateUrl: './price-purchase-update.component.html',
  styleUrls: ['./price-purchase-update.component.css'],
})
export class PricePurchaseUpdateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private dialog: MatDialogRef<PricePurchaseUpdateComponent>
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
    purchase_price: new FormArray([]),
  });

  ngOnInit(): void {
    this.fetchByID();
  }

  get f() {
    return this.priceFormGroup.controls;
  }

  get t() {
    return this.priceFormGroup.get('purchase_price') as FormArray;
  }

  fetchByID(): void {
    this.apiService
      .get(`product/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.priceFormGroup.patchValue({
            reference: data.reference,
            description: data.description,
            id: data.id,
            unit: data.unit,
          });

          this.t.push(
            this.formBuilder.group(
              {
                unit: [data.unit],
                product_unit_id: [null],
                price: [
                  data.purchase_price,
                  [Validators.min(0), Validators.required],
                ],
                discount: [
                  data.purchase_discount,
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
                    x.purchase_price,
                    [Validators.min(0), Validators.required],
                  ],
                  discount: [
                    x.purchase_discount,
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

  onSubmit(): void {
    this.isSubmitting = true;
    this.apiService
      .put('product-price-purchase', {
        product_id: this.priceFormGroup.get('id')?.value,
        data: this.t.value,
      })
      .subscribe({
        next: (_) => {
          this.alertService.showSuccess(
            this.translateService.instant('purchase-price__update__success')
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

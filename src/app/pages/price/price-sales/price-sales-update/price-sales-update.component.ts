import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NgFor, NgIf } from '@angular/common';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Dialog ubah harga jual — satu baris per satuan barang, satuan dasar selalu
 * paling atas. Diskon dicatat dalam Rupiah, bukan persen, dan tidak boleh
 * melebihi harganya sendiri.
 */
@Component({
  selector: 'app-price-sales-update',
  templateUrl: './price-sales-update.component.html',
  styleUrls: ['./price-sales-update.component.scss'],
  imports: [
    DialogShellComponent,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    NgIf,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatInput,
    NgxMaskDirective,
    TranslatePipe,
  ],
})
export class PriceSalesUpdateComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<PriceSalesUpdateComponent>,
  ) {}

  /*
    Diskon Rupiah yang melebihi harganya membuat total barisnya negatif —
    ditolak di sini, bukan diserahkan ke backend.
  */
  discountLessThanPriceValidator(control: AbstractControl) {
    const grup = control as FormGroup;
    const harga = Number(grup.get('price')?.value) || 0;
    const diskon = Number(grup.get('discount')?.value) || 0;
    return diskon > harga ? { discountTooHigh: true } : null;
  }

  isSubmitting = false;
  isLoading = true;

  priceFormGroup: FormGroup = new FormGroup({
    reference: new FormControl(''),
    description: new FormControl(''),
    unit: new FormControl(''),
    id: new FormControl('', Validators.required),
    sales_price: new FormArray([]),
  });

  ngOnInit(): void {
    this.fetchByID();
  }

  get t(): FormArray {
    return this.priceFormGroup.get('sales_price') as FormArray;
  }

  barisAt(i: number): FormGroup {
    return this.t.at(i) as FormGroup;
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

          /* Baris pertama satuan dasar; product_unit_id null menandainya. */
          this.t.push(
            this.formBuilder.group(
              {
                unit: [data.unit],
                product_unit_id: [null],
                price: [data.sales_price, [Validators.min(0), Validators.required]],
                discount: [data.sales_discount, [Validators.min(0), Validators.required]],
                conversion: [1],
              },
              { validators: this.discountLessThanPriceValidator },
            ),
          );

          data.product_unit.forEach((x: any) => {
            this.t.push(
              this.formBuilder.group(
                {
                  unit: [x.unit],
                  product_unit_id: [x.id],
                  price: [x.sales_price, [Validators.min(0), Validators.required]],
                  discount: [x.sales_discount, [Validators.min(0), Validators.required]],
                  conversion: [x.conversion],
                },
                { validators: this.discountLessThanPriceValidator },
              ),
            );
          });
        },
        error: (error) => {
          this.alertService.showError(error);
          this.dialogRef.close();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  closeDialog(): void {
    this.dialogRef.close();
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
            this.translateService.instant('sales-price__update__success'),
          );
          this.dialogRef.close(this.t.value);
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

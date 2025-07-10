import { Component, Inject, Input } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-update-product',
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css'],
})
export class UpdateProductComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialog: MatDialogRef<UpdateProductComponent>
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
    product_brand_id: new FormControl('', Validators.required),
    product_type_id: new FormControl('', Validators.required),
    product_brand_name: new FormControl('', Validators.required),
    product_type_name: new FormControl('', Validators.required),
    unit: new FormControl('', Validators.required),
    minimum_stock: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  ngOnInit(): void {
    this.fetchByID();
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
    const item: any = {
      id: this.data.id,
      reference: this.itemFormGroup.controls['reference'].value,
      description: this.itemFormGroup.controls['description'].value,
      product_brand_id: this.itemFormGroup.controls['product_brand_id'].value,
      product_type_id: this.itemFormGroup.controls['product_type_id'].value,
      unit: this.itemFormGroup.controls['unit'].value,
      minimum_stock: Number(this.itemFormGroup.controls['minimum_stock'].value),
    };

    this.apiService
      .put('product', item)
      .subscribe({
        next: (data: any) => {
          this.translateService
            .get('general__updated-successfully')
            .subscribe((translation) => {
              this.alertService.showSuccess(`${data.reference} ${translation}`);
              this.closeDialog(data);
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

  fetchByID(): void {
    this.isLoading = true;
    this.apiService.get('product/' + this.data.id).subscribe({
      next: (data: any) => {
        this.itemFormGroup.patchValue({
          reference: data.reference,
          description: data.description,
          product_brand_id: data.product_brand_id,
          product_type_id: data.product_type_id,
          product_brand_name: data.product_brand.name,
          product_type_name: data.product_type.name,
          minimum_stock: data.minimum_stock,
          unit: data.unit,
        });
      },
      error: (error) => {
        this.alertService.showError(error);
        this.closeDialog();
      },
    });
  }

  selectBrand(event: any) {
    this.itemFormGroup.patchValue({
      product_brand_id: event.option.value.id,
      product_brand_name: event.option.value.name,
    });
  }

  selectType(event: any) {
    this.itemFormGroup.patchValue({
      product_type_id: event.option.value.id,
      product_type_name: event.option.value.name,
    });
  }

  closeDialog(data: any = undefined) {
    this.dialog.close(data);
  }
}

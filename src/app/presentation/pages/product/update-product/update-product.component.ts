import { Component, Input } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
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
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private dynamicComponentService: DynamicComponentService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  @Input('data') data: any;
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
    brand_name: new FormControl('', Validators.required),
    type_name: new FormControl('', Validators.required),
    unit: new FormControl('', Validators.required),
    minimum_stock: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  ngOnInit(): void {
    this.fetchByID();
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
      id: this.data.id,
      reference: this.itemFormGroup.controls['reference'].value,
      description: this.itemFormGroup.controls['description'].value,
      brand: this.itemFormGroup.controls['brand'].value,
      type: this.itemFormGroup.controls['type'].value,
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
          brand: data.item_brand_id,
          type: data.item_type_id,
          brand_name: data.item_brand.name,
          type_name: data.item_type.name,
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

  closeDialog(data: any = undefined) {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(data);
    }, 300);
  }
}

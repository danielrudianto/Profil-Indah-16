import { Component, Inject, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { AutocompleteSearchComponent } from '../../../components/autocomplete-search/autocomplete-search.component';
import { NgxMaskDirective } from 'ngx-mask';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-update-product',
    templateUrl: './update-product.component.html',
    styleUrls: ['./update-product.component.css'],
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, AutocompleteSearchComponent, NgxMaskDirective, MatButton, MatIcon, MatDialogActions, TranslatePipe]
})
export class UpdateProductComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<UpdateProductComponent>,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  isAdministrator: boolean = false;
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
    can_delete: new FormControl(false),
    is_delete: new FormControl(false),
    is_active: new FormControl(true),
  });

  ngOnInit(): void {
    this.fetchByID();
    this.isAdministrator = this.authService.isAdministrator();
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
          can_delete: data.can_delete,
          is_delete: data.is_delete,
          is_active: data.is_active,
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
    this.dialogRef.close(data);
  }

  openDeleteConfirmation() {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'product__update__delete-confirmation-message'
          ),
        },
      })
      .afterClosed()
      .subscribe((result) => {
        console.log(result);
        if (result === true) {
          this.deleteProduct();
        }
      });
  }

  deleteProduct() {
    this.isSubmitting = true;
    this.apiService
      .delete('product/' + this.data.id)
      .subscribe({
        next: (data: any) => {
          this.alertService.showSuccess(
            this.translateService.instant('product__deleted-successfully')
          );
          this.closeDialog(data);
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

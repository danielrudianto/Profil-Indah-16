import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
    selector: 'app-product-brand-update',
    templateUrl: './product-brand-update.component.html',
    styleUrls: ['./product-brand-update.component.css'],
    standalone: false
})
export class ProductBrandUpdateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialogRef<ProductBrandUpdateComponent>,
    private translateService: TranslateService
  ) {}

  isLoading: boolean = true;
  isSubmitting: boolean = false;
  brandFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.fetchByID();
  }

  fetchByID(): void {
    this.apiService
      .get(`product-brand/${this.data.id}`)
      .subscribe({
        next: (data) => {
          this.brandFormGroup.patchValue(data);
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

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService.put('product-brand', this.brandFormGroup.value).subscribe({
      next: (data: any) => {
        this.translateService
          .get('product__brand__update__success')
          .subscribe((translation) => {
            this.alertService.showSuccess(`${data.name} ${translation}`);
            this.closeDialog(data);
          });
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  closeDialog(data: any = undefined): void {
    this.dialog.close(data);
  }
}

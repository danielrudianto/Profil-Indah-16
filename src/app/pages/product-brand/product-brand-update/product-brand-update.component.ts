import { Component, Inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Dialog ubah merek barang — sistem desain Nocturne.
 *
 * Kembar dengan dialog tambahnya, dan memakai kerangka yang sama. Bedanya
 * hanya satu: isinya diambil lebih dulu dari server, sehingga selama
 * pengambilan itu berlangsung kolomnya belum boleh diisi.
 */
@Component({
  selector: 'app-product-brand-update',
  templateUrl: './product-brand-update.component.html',
  imports: [ReactiveFormsModule, TranslatePipe, DialogShellComponent],
})
export class ProductBrandUpdateComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<ProductBrandUpdateComponent>,
  ) {}

  isLoading = true;
  isSubmitting = false;

  brandFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    /* 45 huruf mengikuti lebar kolom name di tabel product_brand. */
    name: new FormControl('', [Validators.required, Validators.maxLength(45)]),
  });

  ngOnInit(): void {
    this.fetchByID();
  }

  fetchByID(): void {
    this.apiService
      .get(`product-brand/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.brandFormGroup.patchValue(data);
        },
        error: (error: any) => {
          this.alertService.showError(error);
          this.closeDialog();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  submitForm(): void {
    if (this.isSubmitting || this.isLoading || !this.brandFormGroup.valid) {
      return;
    }

    this.isSubmitting = true;

    this.apiService
      .put('product-brand', this.brandFormGroup.value)
      .subscribe({
        next: (data: any) => {
          this.alertService.showSuccess(
            `${data.name} ${this.translateService.instant(
              'product__brand__update__success',
            )}`,
          );
          this.closeDialog(data);
        },
        error: (error: any) => {
          this.alertService.showError(error);
        },
      })
      /*
        Dulu isSubmitting tidak pernah dikembalikan ketika kirimannya gagal,
        sehingga satu kegagalan mematikan tombol simpannya selamanya.
      */
      .add(() => {
        this.isSubmitting = false;
      });
  }

  closeDialog(data: any = undefined): void {
    this.dialogRef.close(data);
  }
}

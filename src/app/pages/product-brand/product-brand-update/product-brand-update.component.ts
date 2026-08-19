import { NgIf } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
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
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

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
  imports: [
    NgIf,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    TranslatePipe,
    DialogShellComponent,
  ],
})
export class ProductBrandUpdateComponent implements OnInit, OnDestroy {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<ProductBrandUpdateComponent>,
  ) {}

  isLoading = true;
  isSubmitting = false;

  /*
    Cek nama kembar sambil mengetik, seanatomi dialog tambahnya — dengan
    satu pengecualian: nama dirinya sendiri bukan tabrakan.
  */
  namaKembar = false;
  private namaAwal = '';
  private langgananNama?: Subscription;

  brandFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    /* 45 huruf mengikuti lebar kolom name di tabel product_brand. */
    name: new FormControl('', [Validators.required, Validators.maxLength(45)]),
  });

  ngOnInit(): void {
    this.fetchByID();

    this.langgananNama = this.brandFormGroup
      .get('name')!
      .valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((nilai: string) =>
          this.apiService.get('product-brand/autocomplete', {
            keyword: (nilai ?? '').trim(),
          }),
        ),
      )
      .subscribe({
        next: (data: any) => {
          const nama = (this.brandFormGroup.value.name ?? '')
            .trim()
            .toLowerCase();
          this.namaKembar =
            nama !== '' &&
            nama !== this.namaAwal &&
            (data as any[]).some((x) => x.name.trim().toLowerCase() === nama);
        },
      });
  }

  ngOnDestroy(): void {
    this.langgananNama?.unsubscribe();
  }

  fetchByID(): void {
    this.apiService
      .get(`product-brand/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.brandFormGroup.patchValue(data);
          this.namaAwal = (data.name ?? '').trim().toLowerCase();
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
    if (
      this.isSubmitting ||
      this.isLoading ||
      !this.brandFormGroup.valid ||
      this.namaKembar
    ) {
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

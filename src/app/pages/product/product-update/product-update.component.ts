import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { NgFor } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NgxMaskDirective } from 'ngx-mask';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';
import {
  ComboItem,
  ComboSearchComponent,
} from 'src/app/components/combo-search/combo-search.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { PRODUCT_UNITS, ProductUnit } from 'src/app/constants/unit.constant';

/**
 * Ubah barang — kembaran dialog-shell dari pola supplier-update.
 *
 * Yang bisa diubah di sini HANYA identitas barang: referensi, deskripsi,
 * merek, tipe, satuan dasar, dan stok minimum — persis muatan PUT /product.
 * Harga jual dan beli sengaja tidak ada; keduanya diubah lewat halaman
 * Harga Jual / Harga Beli yang penjaganya administrator.
 *
 * Satuan dasar memakai mat-select dari PRODUCT_UNITS, sama dengan halaman
 * tambah barang. Barang lama bisa saja menyimpan satuan di luar daftar itu
 * (dulu kolomnya teks bebas); satuan seperti itu disisipkan sebagai pilihan
 * tambahan supaya nilainya tetap terlihat — kalau tidak, select tampil
 * kosong dan pengguna dipaksa memilih ulang tanpa tahu nilai lamanya.
 */
@Component({
  selector: 'app-product-update',
  templateUrl: './product-update.component.html',
  imports: [
    DialogShellComponent,
    ComboSearchComponent,
    ReactiveFormsModule,
    NgFor,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    NgxMaskDirective,
    TranslatePipe,
  ],
})
export class ProductUpdateComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<ProductUpdateComponent>,
    private dialog: MatDialog,
  ) {}

  @ViewChild('comboBrand') comboBrand?: ComboSearchComponent;
  @ViewChild('comboType') comboType?: ComboSearchComponent;

  isAdministrator = false;
  isLoading = true;
  isSubmitting = false;

  satuanTersedia: ProductUnit[] = [...PRODUCT_UNITS];

  namaMerek = '';
  namaTipe = '';

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
    unit: new FormControl('', Validators.required),
    minimum_stock: new FormControl(0, [Validators.required, Validators.min(0)]),
    can_delete: new FormControl(false),
  });

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.fetchByID();
  }

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`product/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          /* Satuan lama di luar daftar baku tetap harus tampil — lihat
             catatan kelas. */
          if (
            data.unit &&
            !this.satuanTersedia.some((s) => s.value === data.unit)
          ) {
            this.satuanTersedia = [
              { value: data.unit, label: data.unit },
              ...this.satuanTersedia,
            ];
          }

          this.itemFormGroup.patchValue({
            reference: data.reference,
            description: data.description,
            product_brand_id: data.product_brand_id,
            product_type_id: data.product_type_id,
            unit: data.unit,
            minimum_stock: data.minimum_stock,
            can_delete: data.can_delete,
          });

          this.namaMerek = data.product_brand?.name ?? '';
          this.namaTipe = data.product_type?.name ?? '';
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

  pilihMerek(item: ComboItem): void {
    this.itemFormGroup.patchValue({ product_brand_id: item.id });
  }

  lepasMerek(): void {
    this.itemFormGroup.patchValue({ product_brand_id: '' });
  }

  pilihTipe(item: ComboItem): void {
    this.itemFormGroup.patchValue({ product_type_id: item.id });
  }

  lepasTipe(): void {
    this.itemFormGroup.patchValue({ product_type_id: '' });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.isSubmitting = true;
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'product__update__delete-confirmation-message',
          ),
        },
      })
      .afterClosed()
      .subscribe((hasil) => {
        /*
          Konfirmasi menutup dengan `true` HANYA lewat tombol hapus; menekan
          batal (atau backdrop) mengirim undefined. Tanpa pemeriksaan ini,
          membatalkan konfirmasi tetap menghapus datanya.
        */
        if (hasil !== true) {
          this.isSubmitting = false;
          return;
        }

        this.apiService.delete(`product/${this.data.id}`).subscribe({
          next: (_) => {
            this.alertService.showSuccess(
              this.translateService.instant('product__deleted-successfully'),
            );

            this.dialogRef.close('deleted');
          },
          error: (error) => {
            this.alertService.showError(error);
            this.isSubmitting = false;
          },
        });
      });
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .put('product', {
        id: this.data.id,
        reference: this.itemFormGroup.controls['reference'].value,
        description: this.itemFormGroup.controls['description'].value,
        product_brand_id: this.itemFormGroup.controls['product_brand_id'].value,
        product_type_id: this.itemFormGroup.controls['product_type_id'].value,
        unit: this.itemFormGroup.controls['unit'].value,
        minimum_stock: Number(
          this.itemFormGroup.controls['minimum_stock'].value,
        ),
      })
      .subscribe({
        next: (data: any) => {
          this.translateService
            .get('general__updated-successfully')
            .subscribe((teks) => {
              this.alertService.showSuccess(`${data.reference} ${teks}`);
              this.dialogRef.close(data);
            });
        },
        error: (error) => {
          this.alertService.showError(error);
          this.isSubmitting = false;
        },
      });
  }
}

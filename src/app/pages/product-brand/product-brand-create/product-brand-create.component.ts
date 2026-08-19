import { NgIf } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

/**
 * Dialog tambah merek barang — sistem desain Nocturne.
 *
 * Tiga cacat yang ikut diperbaiki di sini, ketiganya sudah ada sejak sebelum
 * halaman ini didesain ulang:
 *
 * 1. isSubmitting tidak pernah dikembalikan ke false ketika kirimannya gagal.
 *    Satu kegagalan — nama yang sudah dipakai, jaringan putus — membuat tombol
 *    simpannya mati selamanya, dan satu-satunya jalan keluar adalah menutup
 *    dialognya lalu mengetik ulang semuanya.
 *
 * 2. Dialognya ditutup tanpa mengembalikan apa pun, sehingga daftar di
 *    belakangnya tidak tahu ada data baru dan tetap menampilkan isi yang lama.
 *    Kini ia menutup dengan membawa catatan yang baru dibuat.
 *
 * 3. Pesan berhasilnya ditulis langsung dalam bahasa Inggris — "created
 *    successfully" — di tengah aplikasi yang seluruh tulisannya diterjemahkan.
 *
 * CATATAN: berkas desain memuat kolom "Deskripsi" pada dialog ini. Tabel
 * product_brand tidak punya kolom itu, jadi apa pun yang diketik di sana akan
 * hilang tanpa jejak begitu disimpan. Kolomnya sengaja tidak dipasang sampai
 * ada migrasi yang menambahkannya di server.
 */
@Component({
  selector: 'app-product-brand-create',
  templateUrl: './product-brand-create.component.html',
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
export class ProductBrandCreateComponent implements OnInit, OnDestroy {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<ProductBrandCreateComponent>,
  ) {}

  isSubmitting = false;

  /*
    Hasil cek nama kembar sambil mengetik — backend memang menolak nama
    ganda, tapi memberitahunya SEBELUM tombol ditekan jauh lebih ramah.
  */
  namaKembar = false;
  private langgananNama?: Subscription;

  brandFormGroup: FormGroup = new FormGroup({
    /* 45 huruf mengikuti lebar kolom name di tabel product_brand. */
    name: new FormControl('', [Validators.required, Validators.maxLength(45)]),
  });

  ngOnInit(): void {
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
            (data as any[]).some((x) => x.name.trim().toLowerCase() === nama);
        },
      });
  }

  ngOnDestroy(): void {
    this.langgananNama?.unsubscribe();
  }

  submitForm(): void {
    if (this.isSubmitting || !this.brandFormGroup.valid || this.namaKembar) {
      return;
    }

    this.isSubmitting = true;

    this.apiService
      .post('product-brand', this.brandFormGroup.value)
      .subscribe({
        next: (data: any) => {
          this.alertService.showSuccess(
            `${data.name} ${this.translateService.instant(
              'general__created-successfully',
            )}`,
          );
          this.dialogRef.close(data);
        },
        error: (error: any) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }
}

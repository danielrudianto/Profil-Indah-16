import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';

import { availableRoles } from 'src/app/models/user.model';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ComboSearchComponent } from 'src/app/components/combo-search/combo-search.component';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';
import { UserCreateStatusComponent } from './user-create-status/user-create-status.component';

/**
 * Dialog tambah pengguna.
 *
 * TANPA kolom sandi: kata sandinya dibuat server dan ditunjukkan SEKALI
 * lewat dialog kredensial setelah tersimpan. Jabatan Gudang (peran 6) wajib
 * memilih tipe produk yang boleh dijualnya — daftar stok gudang menyaring
 * berdasarkan pilihan itu.
 */
@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  imports: [
    DialogShellComponent,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    ComboSearchComponent,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    NgxMaskDirective,
    TranslatePipe,
  ],
})
export class UserCreateComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<UserCreateComponent>,
  ) {}

  userFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    nik: new FormControl('', [
      Validators.required,
      Validators.pattern(/^([0-9]{16})$/),
    ]),
    username: new FormControl('', Validators.required),
    role: new FormControl('', Validators.required),
  });

  roles: any[] = availableRoles.filter((r) => r.available);
  tipeTerpilih: any[] = [];
  isSubmitting = false;

  ngOnInit(): void {
    /* Berpindah dari Gudang membuang pilihan tipenya — tidak lagi relevan. */
    this.userFormGroup.controls['role'].valueChanges.subscribe((peran) => {
      if (peran !== 6) {
        this.tipeTerpilih = [];
      }
    });
  }

  get peranGudang(): boolean {
    return this.userFormGroup.get('role')?.value === 6;
  }

  /** Gudang tanpa satu pun tipe produk tidak bisa menjual apa-apa. */
  get bolehSimpan(): boolean {
    return (
      this.userFormGroup.valid &&
      (!this.peranGudang || this.tipeTerpilih.length > 0)
    );
  }

  onSelectType(item: any): void {
    if (!this.tipeTerpilih.some((x) => x.id === item.id)) {
      this.tipeTerpilih.push(item);
    }
  }

  /* splice(i, 1), BUKAN splice(i) — tanpa panjang, semua chip di kanannya
     ikut terseret. Pelajaran dari halaman promosi. */
  onRemoveType(i: number): void {
    this.tipeTerpilih.splice(i, 1);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .post('user', {
        name: this.userFormGroup.controls['name'].value,
        username: this.userFormGroup.controls['username'].value,
        nik: this.userFormGroup.controls['nik'].value,
        is_active: true,
        role: this.userFormGroup.controls['role'].value,
        user_sales: this.tipeTerpilih.map((x) => {
          return { product_type_id: x.id };
        }),
      })
      .subscribe({
        next: (data: any) => {
          /*
            Kredensialnya ditunjukkan SEKALI — dialog status dibuka dulu,
            baru dialog ini menutup sambil membawa datanya untuk daftar.
          */
          this.dialog.open(UserCreateStatusComponent, {
            data: data,
            width: '480px',
            disableClose: true,
            panelClass: 'nocturne-dialog',
            backdropClass: 'nocturne-dialog-backdrop',
          });
          this.dialogRef.close(data);
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

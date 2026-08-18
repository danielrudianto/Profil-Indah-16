import { Component, Inject, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import {
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { NgxMaskDirective } from 'ngx-mask';

import { availableRoles } from 'src/app/models/user.model';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ComboSearchComponent } from 'src/app/components/combo-search/combo-search.component';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Dialog ubah pengguna — kembaran dialog tambahnya, plus tombol hapus untuk
 * administrator. Jabatan Gudang wajib mempertahankan minimal satu tipe
 * produk; sandi tidak pernah tampil di sini (atur ulang lewat halaman
 * profil masing-masing pengguna).
 */
@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
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
export class UserEditComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<UserEditComponent>,
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

  /* Id tipe yang sudah jadi kapsul — sarannya dimatikan di daftarnya. */
  get idTipeTerpilih(): number[] {
    return this.tipeTerpilih.map((x: any) => x.id);
  }

  isAdministrator = false;
  isLoading = true;
  isSubmitting = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();

    this.userFormGroup.controls['role'].valueChanges.subscribe((peran) => {
      if (peran !== 6) {
        this.tipeTerpilih = [];
      }
    });

    this.apiService
      .get(`user/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.userFormGroup.patchValue({
            name: data.name,
            nik: data.nik,
            username: data.username,
            role: data.role,
          });

          this.tipeTerpilih = (data.user_sales ?? []).map((x: any) => ({
            id: x.product_type_id,
            name: x.product_type.name,
          }));
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

  get peranGudang(): boolean {
    return this.userFormGroup.get('role')?.value === 6;
  }

  get bolehSimpan(): boolean {
    return (
      !this.isLoading &&
      this.userFormGroup.valid &&
      (!this.peranGudang || this.tipeTerpilih.length > 0)
    );
  }

  onSelectType(item: any): void {
    if (!this.tipeTerpilih.some((x) => x.id === item.id)) {
      this.tipeTerpilih.push(item);
    }
  }

  onRemoveType(i: number): void {
    this.tipeTerpilih.splice(i, 1);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .put('user', {
        id: this.data.id,
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
        next: (data) => {
          this.alertService.showSuccess(
            this.translateService.instant('user__update-successfully'),
          );
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

  delete(): void {
    this.isSubmitting = true;
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant('user__delete__message'),
        },
      })
      .afterClosed()
      .subscribe((hasil) => {
        /*
          Konfirmasi menutup dengan `true` HANYA lewat tombol hapus; menekan
          batal (atau backdrop) mengirim undefined.
        */
        if (hasil !== true) {
          this.isSubmitting = false;
          return;
        }

        this.apiService.delete(`user/${this.data.id}`).subscribe({
          next: () => {
            this.alertService.showSuccess(
              this.translateService.instant('user__delete__success'),
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
}

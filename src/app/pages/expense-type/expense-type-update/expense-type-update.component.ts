import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Dialog ubah SUB-TIPE pengeluaran — nama dan deskripsinya saja. Induknya
 * baku dan ditampilkan sebagai keterangan, bukan pilihan: memindahkan anak
 * antar kategori mengubah arti laporan lama, jadi tidak difasilitasi.
 */
@Component({
  selector: 'app-expense-type-update',
  templateUrl: './expense-type-update.component.html',
  imports: [
    DialogShellComponent,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    MatFormField,
    MatLabel,
    MatInput,
    TranslatePipe,
  ],
})
export class ExpenseTypeUpdateComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number; parentName: string },
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ExpenseTypeUpdateComponent>,
  ) {}

  isLoading = true;
  isSubmitting = false;
  expenseTypeFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.fetchByID();
  }

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`expense-type/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.expenseTypeFormGroup.patchValue({
            id: data.id,
            name: data.name,
            description: data.description,
          });
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

  closeDialog(): void {
    this.dialogRef.close();
  }

  delete(): void {
    this.isSubmitting = true;
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant('expense-type__delete__message'),
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

        this.apiService.delete(`expense-type/${this.data.id}`).subscribe({
          next: () => {
            this.alertService.showSuccess(
              this.translateService.instant('expense-type__delete__success'),
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
      .put('expense-type', this.expenseTypeFormGroup.value)
      .subscribe({
        next: (data: any) => {
          this.alertService.showSuccess(
            this.translateService.instant('expense-type__update__success'),
          );
          this.dialogRef.close(data ?? true);
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

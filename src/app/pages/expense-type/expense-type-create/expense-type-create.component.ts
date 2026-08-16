import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NgFor } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Dialog tambah SUB-TIPE pengeluaran.
 *
 * Induknya dipilih dari daftar baku — mat-select, bukan autocomplete, karena
 * kategorinya hanya sepuluh dan tidak bisa bertambah dari sini. Daftar induk
 * dibawa pemanggil lewat MAT_DIALOG_DATA supaya dialog tidak mengambil ulang
 * apa yang sudah ada di halamannya.
 */
@Component({
  selector: 'app-expense-type-create',
  templateUrl: './expense-type-create.component.html',
  imports: [
    DialogShellComponent,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    TranslatePipe,
  ],
})
export class ExpenseTypeCreateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { parents: any[]; preset: any | null },
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<ExpenseTypeCreateComponent>,
  ) {}

  isSubmitting = false;
  expenseTypeFormGroup: FormGroup = new FormGroup({
    /* Tombol + pada baris induk membuka dialog dengan induknya terpilih. */
    parent_id: new FormControl(this.data.preset?.id ?? null, Validators.required),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  });

  closeDialog(): void {
    this.dialogRef.close();
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .post('expense-type', this.expenseTypeFormGroup.value)
      .subscribe({
        next: (data: any) => {
          this.alertService.showSuccess(
            this.translateService.instant('expense-type__create__success'),
          );
          /* Bawa datanya pulang: daftar bisa langsung memuat ulang. */
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

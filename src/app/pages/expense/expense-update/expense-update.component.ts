import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { MatFormField, MatLabel, MatSuffix, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NgxMaskDirective } from 'ngx-mask';

import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ComboSearchComponent } from 'src/app/components/combo-search/combo-search.component';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Dialog ubah pengeluaran — kembaran dialog catat (18b), ditambah tombol
 * hapus. Nama tipe dan perusahaan yang tersimpan tampil lewat masukan
 * `initial` milik combo-search, tanpa memancing pencarian.
 */
@Component({
  providers: [provideNativeDateAdapter()],
  selector: 'app-expense-update',
  templateUrl: './expense-update.component.html',
  imports: [
    DialogShellComponent,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    ComboSearchComponent,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatInput,
    MatSuffix,
    MatDatepicker,
    MatDatepickerInput,
    NgxMaskDirective,
    TranslatePipe,
  ],
})
export class ExpenseUpdateComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private authService: AuthService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<ExpenseUpdateComponent>,
  ) {}

  isAdministrator: boolean = false;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  expenseFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    expense_type: new FormControl('', Validators.required),
    company: new FormControl('', Validators.required),
    value: new FormControl('', [Validators.required, Validators.min(1)]),
    expense_type_name: new FormControl(''),
    company_name: new FormControl(''),
  });

  ngOnInit(): void {
    this.fetchByID();
    this.isAdministrator = this.authService.isAdministrator();
  }

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`expense/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.expenseFormGroup.patchValue({
            id: this.data.id,
            date: new Date(data.date),
            description: data.description,
            expense_type: data.expense_type_id,
            company: data.company_id,
            value: data.value,
            expense_type_name: data.expense_type.name,
            company_name: data.company.name,
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

  closeDialog() {
    this.dialogRef.close();
  }

  onSelectCompany(event: any) {
    this.expenseFormGroup.patchValue({
      company: event.id,
      company_name: event.name,
    });
  }

  onUnselectCompany() {
    this.expenseFormGroup.patchValue({ company: '', company_name: '' });
  }

  onSelectExpenseType(event: any) {
    this.expenseFormGroup.patchValue({
      expense_type: event.id,
      expense_type_name: event.name,
    });
  }

  onUnselectExpenseType() {
    this.expenseFormGroup.patchValue({ expense_type: '', expense_type_name: '' });
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService
      .put('expense', {
        date: new Date(this.expenseFormGroup.controls['date'].value),
        company_id: this.expenseFormGroup.controls['company'].value,
        description: this.expenseFormGroup.controls['description'].value,
        expense_type_id: this.expenseFormGroup.controls['expense_type'].value,
        id: this.data.id,
        value: Number(this.expenseFormGroup.controls['value'].value),
      })
      .subscribe({
        next: () => {
          this.alertService.showSuccess(
            this.translateService.instant('expense__update__success'),
          );
          this.dialogRef.close({
            id: this.data.id,
            date: new Date(this.expenseFormGroup.controls['date'].value),
            description: this.expenseFormGroup.controls['description'].value,
            expense_type_id: this.expenseFormGroup.controls['expense_type'].value,
            company_id: this.expenseFormGroup.controls['company'].value,
            value: this.expenseFormGroup.controls['value'].value,
            company: {
              name: this.expenseFormGroup.controls['company_name'].value,
            },
            expense_type: {
              name: this.expenseFormGroup.controls['expense_type_name'].value,
            },
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

  delete() {
    this.isSubmitting = true;
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant('expense__delete__title'),
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

        this.apiService.delete(`expense/${this.data.id}`).subscribe({
          next: () => {
            this.alertService.showSuccess(
              this.translateService.instant('expense__delete__success'),
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

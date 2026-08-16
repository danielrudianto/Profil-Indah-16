import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatFormField, MatLabel, MatSuffix, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepicker, MatDatepickerInput } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NgxMaskDirective } from 'ngx-mask';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ComboSearchComponent } from 'src/app/components/combo-search/combo-search.component';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Dialog catat pengeluaran — bagian `18b` berkas desain.
 *
 * DIALOG, bukan halaman: formulirnya pendek (lima isian), dan berkas desain
 * memintanya sebagai dialog 560px yang dibuka dari daftar. Halaman penuh
 * dengan stepper dua langkah yang dulu dipakai sudah tidak ada.
 */
@Component({
  providers: [provideNativeDateAdapter()],
  selector: 'app-expense-create',
  templateUrl: './expense-create.component.html',
  imports: [
    DialogShellComponent,
    FormsModule,
    ReactiveFormsModule,
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
export class ExpenseCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private translateService: TranslateService,
    private dialogRef: MatDialogRef<ExpenseCreateComponent>,
  ) {}

  isSubmitting: boolean = false;
  expenseFormGroup: FormGroup = new FormGroup({
    date: new FormControl(new Date(), Validators.required),
    expense_type_id: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    company_id: new FormControl('', Validators.required),
    value: new FormControl('', [Validators.required, Validators.min(1)]),
  });

  onSelectCompany(data: any) {
    this.expenseFormGroup.patchValue({ company_id: data.id });
  }

  onUnselectCompany() {
    this.expenseFormGroup.patchValue({ company_id: '' });
  }

  onSelectExpenseType(data: any) {
    this.expenseFormGroup.patchValue({ expense_type_id: data.id });
  }

  onUnselectExpenseType() {
    this.expenseFormGroup.patchValue({ expense_type_id: '' });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  submitForm() {
    this.isSubmitting = true;

    this.apiService
      .post('expense', {
        expense_type_id: this.expenseFormGroup.controls['expense_type_id'].value,
        value: parseFloat(this.expenseFormGroup.controls['value'].value),
        date: this.datePipe.transform(
          new Date(this.expenseFormGroup.controls['date'].value),
          'yyyy-MM-dd',
        ),
        description: this.expenseFormGroup.controls['description'].value,
        company_id: this.expenseFormGroup.controls['company_id'].value,
      })
      .subscribe({
        next: (data: any) => {
          this.alertService.showSuccess(
            this.translateService.instant('expense__create__success'),
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

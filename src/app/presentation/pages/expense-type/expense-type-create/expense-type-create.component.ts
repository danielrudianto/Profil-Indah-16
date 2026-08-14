import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgIf } from '@angular/common';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-expense-type-create',
    templateUrl: './expense-type-create.component.html',
    styleUrls: ['./expense-type-create.component.css'],
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, NgIf, MatDivider, MatFormField, MatLabel, MatInput, MatDialogActions, MatButton, TranslateModule]
})
export class ExpenseTypeCreateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private dialog: MatDialogRef<ExpenseTypeCreateComponent>,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  isSubmitting: boolean = false;

  expenseTypeFormGroup: FormGroup = new FormGroup({
    parent_id: new FormControl(this.data.parentId),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  });

  save() {
    this.isSubmitting = true;
    this.apiService
      .post('expense-type', this.expenseTypeFormGroup.value)
      .subscribe({
        next: (data: any) => {
          this.alertService.showSuccess(
            this.translateService.instant('expense-type__create__success')
          );
          this.dialog.close(data);
        },
        error: (error) => {
          this.alertService.showError(Error(error));
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }
}

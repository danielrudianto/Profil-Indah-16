import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-expense-type-create',
  templateUrl: './expense-type-create.component.html',
  styleUrls: ['./expense-type-create.component.css'],
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

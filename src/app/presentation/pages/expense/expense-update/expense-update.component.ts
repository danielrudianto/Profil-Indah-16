import { DatePipe } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
    selector: 'app-expense-update',
    templateUrl: './expense-update.component.html',
    styleUrls: ['./expense-update.component.css'],
    animations: [slideInOutAnimation],
    standalone: false
})
export class ExpenseUpdateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private dialogRef: MatDialogRef<ExpenseUpdateComponent>
  ) {}

  isSubmitting: boolean = false;
  expenseFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    date: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    expense_type: new FormControl('', Validators.required),
    company: new FormControl('', Validators.required),
    value: new FormControl('', [Validators.required, Validators.min(1)]),
    expense_type_name: new FormControl('', Validators.required),
    company_name: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.fetchByID();
  }

  fetchByID(): void {
    this.apiService.get(`expense/${this.data.id}`).subscribe({
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
        this.closeDialog();
      },
    });
  }

  closeDialog(data: any = undefined) {
    this.dialogRef.close(data);
  }

  onSelectCompany(event: any) {
    this.expenseFormGroup.patchValue({
      company: event.id,
      company_name: event.name,
    });
  }

  onSelectExpenseType(event: any) {
    this.expenseFormGroup.patchValue({
      expense_type: event.id,
      expense_type_name: event.name,
    });
  }

  onUnselectCompany() {
    this.expenseFormGroup.patchValue({
      company: '',
      company_name: '',
    });
  }

  onUnselectExpenseType() {
    this.expenseFormGroup.patchValue({
      expense_type: '',
      expense_type_name: '',
    });
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
          this.translateService
            .get('expense__update__success')
            .subscribe((translation) => {
              this.alertService.showSuccess(translation);
              this.closeDialog({
                id: this.data.id,
                date: new Date(this.expenseFormGroup.controls['date'].value),
                description:
                  this.expenseFormGroup.controls['description'].value,
                expense_type_id:
                  this.expenseFormGroup.controls['expense_type'].value,
                company_id: this.expenseFormGroup.controls['company'].value,
                value: this.expenseFormGroup.controls['value'].value,
                company: {
                  name: this.expenseFormGroup.controls['company_name'].value,
                },
                expense_type: {
                  name: this.expenseFormGroup.controls['expense_type_name']
                    .value,
                },
              });
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
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant('expense__delete__title'),
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result == true) {
          this.isSubmitting = true;
          this.apiService
            .delete(`expense/${this.data.id}`)
            .subscribe({
              next: () => {
                this.alertService.showSuccess(
                  this.translateService.instant('expense__delete__success')
                );
                this.closeDialog('deleted');
              },
              error: (error) => {
                this.alertService.showError(error);
              },
            })
            .add(() => {
              this.isSubmitting = false;
            });
        }
      });
  }
}

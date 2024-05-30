import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-expense-type-update',
  templateUrl: './expense-type-update.component.html',
  styleUrls: ['./expense-type-update.component.css'],
})
export class ExpenseTypeUpdateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private dialog: MatDialogRef<ExpenseTypeUpdateComponent>,
    private alertService: AlertService
  ) {}

  isSubmitting: boolean = false;
  isLoading: boolean = true;

  expenseTypeFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    id: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.fetchByID();
  }

  /**
   * Fetches expense type data by ID and updates the form group with the fetched data.
   * @return {void} This function does not return anything.
   */
  fetchByID() {
    this.apiService
      .get(`expense-type/${this.data.id}`, {})
      .subscribe({
        next: (data) => {
          this.expenseTypeFormGroup.patchValue(data);
        },
        error: (error) => {
          this.alertService.showError(Error(error));
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  save() {
    this.isSubmitting = true;
    this.apiService
      .put(`expense-type`, this.expenseTypeFormGroup.value)
      .subscribe({
        next: (data) => {
          this.alertService.showSuccess('Expense type updated successfully');
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

import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { NgIf } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-expense-type-update',
    templateUrl: './expense-type-update.component.html',
    styleUrls: ['./expense-type-update.component.css'],
    imports: [MatDialogTitle, CdkScrollable, MatDialogContent, NgIf, MatProgressSpinner, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatButton, MatIcon, MatDialogActions, TranslatePipe]
})
export class ExpenseTypeUpdateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<ExpenseTypeUpdateComponent>,
    private alertService: AlertService,
    private translateService: TranslateService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  isSubmitting: boolean = false;
  isLoading: boolean = true;

  isAdministrator: boolean = false;

  expenseTypeFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    id: new FormControl('', Validators.required),
    can_delete: new FormControl(false),
  });

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    this.fetchByID();
  }

  fetchByID() {
    this.apiService
      .get(`expense-type/${this.data.id}`, {})
      .subscribe({
        next: (data: any) => {
          this.expenseTypeFormGroup.patchValue(data);
          console.log(data.children.length);
          this.expenseTypeFormGroup.patchValue({
            can_delete: data.children.length == 0,
          });
        },
        error: (error) => {
          this.alertService.showError(Error(error));
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  delete() {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant('expense-type__delete__message'),
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === true) {
          this.isSubmitting = true;
          this.apiService.delete(`expense-type/${this.data.id}`).subscribe({
            next: (_) => {
              this.alertService.showSuccess(
                this.translateService.instant('expense-type__delete__success')
              );

              if (data.id == this.data.id) {
                this.dialogRef.close('parent-deleted');
              } else {
                this.dialogRef.close('deleted');
              }
            },
            error: (error) => {},
          });
        }
      });
  }

  save() {
    this.isSubmitting = true;
    this.apiService
      .put(`expense-type`, this.expenseTypeFormGroup.value)
      .subscribe({
        next: (data) => {
          this.alertService.showSuccess(
            this.translateService.instant('expense-type__update__success')
          );
          this.dialogRef.close(data);
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

import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from 'src/app/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-payment-method-update',
    templateUrl: './payment-method-update.component.html',
    styleUrls: ['./payment-method-update.component.scss'],
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, MatButton, MatIcon, MatDialogActions, TranslatePipe]
})
export class PaymentMethodUpdateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private dialogRef: MatDialogRef<PaymentMethodUpdateComponent>,
    private alertService: AlertService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {}

  isAdministrator: boolean = false;
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  paymentMethodFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.fetchByID();
    this.isAdministrator = this.authService.isAdministrator();
  }

  closeDialog(data: any = undefined) {
    this.dialogRef.close(data);
  }

  delete(): void {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'payment-method__delete__message'
          ),
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result === true) {
          this.isSubmitting = true;

          this.apiService.delete(`payment-method/${this.data.id}`).subscribe({
            next: (_) => {
              this.alertService.showSuccess(
                this.translateService.instant('payment-method__delete__success')
              );
              this.dialogRef.close('deleted');
            },
            error: (error) => {
              this.alertService.showError(error);
            },
          });
        }
      });
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .put('payment-method', this.paymentMethodFormGroup.value)
      .subscribe({
        next: (data: any) => {
          this.translateService
            .get([
              'payment-method__add__successfully-prefix',
              'payment-method__update__successfully',
            ])
            .subscribe((translation) => {
              this.alertService.showSuccess(
                `${translation['payment-method__add__successfully-prefix']} ${data.name} ${translation['payment-method__update__successfully']}`
              );
              this.closeDialog(data);
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

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`payment-method/${this.data.id}`)
      .subscribe({
        next: (data) => {
          this.paymentMethodFormGroup.patchValue(data);
        },
        error: (error) => {
          this.alertService.showError(error);
          this.closeDialog();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}

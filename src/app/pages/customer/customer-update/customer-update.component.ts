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
import { NgxMaskDirective } from 'ngx-mask';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';
@Component({
    selector: 'app-customer-update',
    templateUrl: './customer-update.component.html',
    imports: [
    DialogShellComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    NgxMaskDirective,
    TranslatePipe,
  ]
})
export class CustomerUpdateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<CustomerUpdateComponent>,
    private translateService: TranslateService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  isAdministrator: boolean = false;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  customerFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    npwp: new FormControl('', Validators.pattern(/^([0-9]{15})|^$/)),
    pic: new FormControl('', Validators.required),
    phone_number: new FormControl(''),
    can_delete: new FormControl(false),
  });

  ngOnInit(): void {
    this.fetchByID();
    this.isAdministrator = this.authService.isAdministrator();
  }

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`customer/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.customerFormGroup.patchValue(data);
        },
        error: (error) => {
          this.dialogRef;
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  closeDialog() {
    this.dialogRef.close();
  }

  delete() {
    this.isSubmitting = true;
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant('customer__delete__message'),
        },
      })
      .afterClosed()
      .subscribe({
        next: (_) => {
          this.apiService.delete(`customer/${this.data.id}`).subscribe({
            next: (_) => {
              this.alertService.showSuccess(
                this.translateService.instant('customer__delete__success')
              );

              this.dialogRef.close('deleted');
            },
            error: (error) => {
              this.alertService.showError(error);
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

  submitForm() {
    this.isSubmitting = true;
    this.apiService.put('customer', this.customerFormGroup.value).subscribe({
      next: (data: any) => {
        this.translateService
          .get('customer__update__success')
          .subscribe((message: string) => {
            this.dialogRef.close(data);
            this.alertService.showSuccess(`${data.name} ${message}`);
          });
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }
}

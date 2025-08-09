import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-customer-update',
  templateUrl: './customer-update.component.html',
  styleUrls: ['./customer-update.component.css'],
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

  delete() {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant('customer__delete__message'),
        },
      })
      .afterClosed()
      .subscribe({
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

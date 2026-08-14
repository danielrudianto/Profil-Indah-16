import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-company-update',
    templateUrl: './company-update.component.html',
    styleUrls: ['./company-update.component.css'],
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, NgxMaskDirective, MatButton, MatIcon, MatDialogActions, TranslatePipe]
})
export class CompanyUpdateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private alertService: AlertService,
    private dialogRef: MatDialogRef<CompanyUpdateComponent>,
    private translateService: TranslateService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  isSubmitting: boolean = false;
  isAdministrator: boolean = false;
  companyFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    npwp: new FormControl('', Validators.pattern(/^([0-9]{15})|^$/)),
    can_delete: new FormControl(false),
  });

  ngOnInit(): void {
    this.fetchByID();
    this.isAdministrator = this.authService.isAdministrator();
  }

  fetchByID(): void {
    this.apiService.get(`company/${this.data.id}`).subscribe({
      next: (data) => {
        this.companyFormGroup.patchValue(data);
      },
    });
  }

  delete() {
    this.dialog
      .open(DeleteConfirmationComponent, {
        data: {
          title: this.translateService.instant(
            'company__update__delete__message'
          ),
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data == true) {
          this.apiService.delete(`company/${this.data.id}`).subscribe({
            next: (_) => {
              this.alertService.showSuccess(
                this.translateService.instant('company__delete__success')
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

  closeDialog(data: any = undefined) {
    this.dialogRef.close(data);
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService.put('company', this.companyFormGroup.value).subscribe({
      next: (data: any) => {
        this.translateService
          .get('company__update__success')
          .subscribe((message: string) => {
            this.alertService.showSuccess(`${data.name} ${message}`);
            this.closeDialog(data);
          });
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }
}

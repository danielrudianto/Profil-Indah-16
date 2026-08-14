import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-customer-create',
    templateUrl: './customer-create.component.html',
    styleUrls: ['./customer-create.component.css'],
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, NgxMaskDirective, MatDialogActions, MatButton, TranslateModule]
})
export class CustomerCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialogRef<CustomerCreateComponent>,
    private translateService: TranslateService
  ) {}

  isSubmitting: boolean = false;
  customerFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    npwp: new FormControl('', Validators.pattern(/^([0-9]{15})|^$/)),
    pic: new FormControl('', Validators.required),
    phone_number: new FormControl(''),
  });

  closeDialog() {
    this.dialog.close();
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService
      .post('customer', this.customerFormGroup.value)
      .subscribe({
        next: (data: any) => {
          this.translateService
            .get('customer__create__success')
            .subscribe((message: string) => {
              this.alertService.showSuccess(`Customer ${data.name} ${message}`);
              this.closeDialog();
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
}

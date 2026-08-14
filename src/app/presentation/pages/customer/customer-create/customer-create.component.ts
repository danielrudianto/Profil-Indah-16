import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-customer-create',
    templateUrl: './customer-create.component.html',
    styleUrls: ['./customer-create.component.css'],
    standalone: false
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

import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
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
    private dialog: MatDialogRef<CustomerUpdateComponent>,
    private translateService: TranslateService
  ) {}

  isLoading: boolean = true;
  isSubmitting: boolean = false;
  customerFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    address: new FormControl('', Validators.required),
    npwp: new FormControl('', Validators.pattern(/^([0-9]{15})|^$/)),
    pic: new FormControl('', Validators.required),
    phone_number: new FormControl(''),
  });

  ngOnInit(): void {
    this.fetchByID();
  }

  closeDialog(data: any = undefined) {
    this.dialog.close(data);
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
          this.closeDialog();
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService.put('customer', this.customerFormGroup.value).subscribe({
      next: (data: any) => {
        this.translateService
          .get('customer__update__success')
          .subscribe((message: string) => {
            this.alertService.showSuccess(`${data.name} ${message}`);
            this.closeDialog();
          });
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }
}

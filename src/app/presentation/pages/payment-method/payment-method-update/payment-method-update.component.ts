import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-payment-method-update',
  templateUrl: './payment-method-update.component.html',
  styleUrls: ['./payment-method-update.component.css'],
})
export class PaymentMethodUpdateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private dialog: MatDialogRef<PaymentMethodUpdateComponent>,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}
  isSubmitting: boolean = false;
  isLoading: boolean = false;
  isOpened: boolean = false;
  paymentMethodFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.fetchByID();
  }

  closeDialog(data: any = undefined) {
    this.dialog.close(data);
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

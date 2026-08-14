import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-payment-method-create',
    templateUrl: './payment-method-create.component.html',
    styleUrls: ['./payment-method-create.component.css'],
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, MatDialogActions, MatButton, TranslateModule]
})
export class PaymentMethodCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialogRef<PaymentMethodCreateComponent>,
    private translateService: TranslateService
  ) {}

  isSubmitting: boolean = false;
  isOpened: boolean = false;
  paymentMethodFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.isOpened = true;
  }

  closeDialog() {
    this.dialog.close();
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .post('payment-method', this.paymentMethodFormGroup.value)
      .subscribe({
        next: (data: any) => {
          this.translateService
            .get([
              'payment-method__add__successfully-prefix',
              'payment-method__add__successfully',
            ])
            .subscribe((translation) => {
              this.alertService.showSuccess(
                `${translation['payment-method__add__successfully-prefix']} ${data.name} ${translation['payment-method__add__successfully']}`
              );
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

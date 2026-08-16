import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

@Component({
    selector: 'app-payment-method-create',
    templateUrl: './payment-method-create.component.html',
    imports: [
    DialogShellComponent,
    FormsModule,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    TranslatePipe,
  ]
})
export class PaymentMethodCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialogRef<PaymentMethodCreateComponent>,
    private translateService: TranslateService
  ) {}

  isSubmitting: boolean = false;
  paymentMethodFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
  });

  closeDialog() {
    this.dialog.close();
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .post('payment-method', this.paymentMethodFormGroup.value)
      .subscribe({
        next: (data: any) => {
          this.alertService.showSuccess(
            `${data.name} ${this.translateService.instant('payment-method__add__successfully')}`
          );
          /* Bawa datanya pulang: daftar bisa langsung memuat ulang. */
          this.dialog.close(data);
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

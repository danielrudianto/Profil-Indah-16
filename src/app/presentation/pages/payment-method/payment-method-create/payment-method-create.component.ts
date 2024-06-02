import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-payment-method-create',
  templateUrl: './payment-method-create.component.html',
  styleUrls: ['./payment-method-create.component.css'],
})
export class PaymentMethodCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService,
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
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
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

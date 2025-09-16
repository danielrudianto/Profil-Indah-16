import { DatePipe } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-receivable-payment-create',
  templateUrl: './receivable-payment-create.component.html',
  styleUrls: ['./receivable-payment-create.component.css'],
})
export class ReceivablePaymentCreateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number; max: number },
    private apiService: ApiService,
    private datePipe: DatePipe,
    private alertService: AlertService,
    private dialog: MatDialogRef<ReceivablePaymentCreateComponent>
  ) {}

  isSubmitting: boolean = false;
  paymentFormGroup: FormGroup = new FormGroup({
    date: new FormControl(new Date(), Validators.required),
    value: new FormControl('', [Validators.required]),
    payment_method: new FormControl('', Validators.required),
    full_payment: new FormControl(false, Validators.required),
  });

  ngOnInit(): void {
    this.paymentFormGroup.controls['value'].setValidators([
      Validators.max(this.data.max),
      Validators.min(1),
      Validators.required,
    ]);

    this.paymentFormGroup.controls['value'].updateValueAndValidity();

    this.paymentFormGroup.controls['full_payment'].valueChanges.subscribe(
      (value) => {
        if (value) {
          this.paymentFormGroup.controls['value'].setValue(1);
        } else {
          this.paymentFormGroup.controls['value'].setValue(0);
        }
      }
    );
  }

  onSelectPaymentMethod(event: any) {
    this.paymentFormGroup.patchValue({
      payment_method: event.id,
    });
  }

  onUnselectPaymentMethod() {
    this.paymentFormGroup.patchValue({
      payment_method: null,
    });
  }

  submitPayment() {
    this.isSubmitting = true;
    this.apiService
      .post('receivable/payment', {
        payment_method_id:
          this.paymentFormGroup.controls['payment_method'].value == -1
            ? null
            : this.paymentFormGroup.controls['payment_method'].value,
        amount: this.paymentFormGroup.controls['full_payment'].value
          ? this.data.max
          : Number(this.paymentFormGroup.controls['value'].value),
        date: this.datePipe.transform(
          this.paymentFormGroup.controls['date'].value,
          'yyyy-MM-dd'
        ),
        full_payment: this.paymentFormGroup.controls['full_payment'].value,
        sales_invoice_id: this.data.id,
      })
      .subscribe({
        next: (data: any) => {
          this.closeDialog(data);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  closeDialog(data: any = undefined) {
    this.dialog.close(data);
  }
}

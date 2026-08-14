import { DatePipe, NgClass } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgxMaskDirective } from 'ngx-mask';
import { AutocompleteSearchComponent } from '../../../../components/autocomplete-search/autocomplete-search.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-receivable-payment-create',
    templateUrl: './receivable-payment-create.component.html',
    styleUrls: ['./receivable-payment-create.component.css'],
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, NgClass, NgxMaskDirective, AutocompleteSearchComponent, MatCheckbox, MatDialogActions, MatButton, TranslateModule]
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

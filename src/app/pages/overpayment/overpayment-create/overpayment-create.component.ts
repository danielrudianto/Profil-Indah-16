import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import moment from 'moment';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { availableBankSearch, IBank } from 'src/app/utils/bank';
import { VerticalDividerComponent } from '../../../components/vertical-divider/vertical-divider.component';
import { BoxStepperComponent } from '../../../components/box-stepper/box-stepper.component';
import { AutocompleteSearchComponent } from '../../../components/autocomplete-search/autocomplete-search.component';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgxMaskDirective } from 'ngx-mask';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'app-overpayment-create',
    templateUrl: './overpayment-create.component.html',
    styleUrl: './overpayment-create.component.scss',
    imports: [VerticalDividerComponent, BoxStepperComponent, FormsModule, ReactiveFormsModule, AutocompleteSearchComponent, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, NgxMaskDirective, MatSelect, MatOption, MatAutocompleteTrigger, MatAutocomplete, NgFor, NgIf, TranslatePipe]
})
export class OverpaymentCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {}

  paymentMethods = [];
  banks: IBank[] = availableBankSearch.search('').splice(0, 5);
  isSubmitting: boolean = false;

  bankValidator(control: AbstractControl): ValidationErrors | null {
    const returnPaymentMethod = control.get('return_payment_method')?.value;
    const returnPaymentBank = control.get('return_payment_bank')?.value;
    const returnPaymentNumber = control.get('return_payment_number')?.value;
    if (returnPaymentMethod === 'transfer') {
      const bankRequired =
        !returnPaymentBank || returnPaymentBank.trim() === '';
      const numberRequired =
        !returnPaymentNumber || returnPaymentNumber.trim() === '';
      return bankRequired || numberRequired
        ? { bankOrNumberRequired: true }
        : null;
    }
    return null; // No errors
  }

  metaFormGroup: FormGroup = new FormGroup({
    customer_id: new FormControl(0, Validators.required),
    date: new FormControl('', Validators.required),
    payment_method_id: new FormControl('', Validators.required),
    value: new FormControl(0, [Validators.required, Validators.min(0)]),
  });

  returnFormGroup: FormGroup = new FormGroup(
    {
      return_payment_date: new FormControl('', Validators.required),
      return_payment_method: new FormControl('', Validators.required),
      return_payment_name: new FormControl('', Validators.required),
      return_payment_bank: new FormControl(''),
      return_payment_number: new FormControl(''),
    },
    {
      validators: this.bankValidator,
    }
  );

  ngOnInit(): void {
    this.fetchPaymentMethods();
    this.returnFormGroup.controls[
      'return_payment_bank'
    ]?.valueChanges.subscribe((data) => {
      this.banks = availableBankSearch.search(data).splice(0, 5);
    });

    this.returnFormGroup.controls[
      'return_payment_method'
    ].valueChanges.subscribe(() => {
      this.onPaymentMethodChange();
    });
  }

  fetchPaymentMethods() {
    this.apiService.get('payment-method/all', {}).subscribe({
      next: (data: any) => {
        this.paymentMethods = data;
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  onSelectCustomer(data: any) {
    this.metaFormGroup.patchValue({
      customer_id: data.id,
    });
  }

  onUnselectCustomer() {
    this.metaFormGroup.patchValue({
      customer_id: null,
    });
  }

  onSelectPaymentMethod(data: any) {
    this.metaFormGroup.patchValue({
      payment_method_id: data.id,
    });
  }

  onUnselectPaymentMethod() {
    this.metaFormGroup.patchValue({
      payment_method_id: null,
    });
  }

  onPaymentMethodChange() {
    const method = this.returnFormGroup.get('return_payment_method')?.value;
    const bankControl = this.returnFormGroup.get('return_payment_bank');
    const numberControl = this.returnFormGroup.get('return_payment_number');
    if (method === 'Cash') {
      bankControl?.disable();
      numberControl?.disable();
      bankControl?.setValue('');
      numberControl?.setValue('');
      bankControl?.clearValidators();
      numberControl?.clearValidators();
    } else if (method === 'Bank transfer') {
      bankControl?.enable();
      numberControl?.enable();
      bankControl?.setValidators(Validators.required);
      numberControl?.setValidators(Validators.required);
    } else {
      bankControl?.disable();
      numberControl?.disable();
      bankControl?.clearValidators();
      numberControl?.clearValidators();
    }
    bankControl?.updateValueAndValidity();
    numberControl?.updateValueAndValidity();
  }

  submitForm() {
    if (!this.metaFormGroup.valid) return;
    if (!this.returnFormGroup.valid) return;

    this.isSubmitting = true;
    const customerID = this.metaFormGroup.get('customer_id')?.value;

    this.apiService
      .post('overpayment', {
        customer_id: customerID == 0 ? null : customerID,
        payment_method_id:
          this.metaFormGroup.get('payment_method_id')?.value == -1
            ? null
            : this.metaFormGroup.get('payment_method_id')?.value,
        date: moment(new Date(this.metaFormGroup.get('date')?.value)).format(
          'YYYY-MM-DD'
        ),
        return_payment_date: moment(
          new Date(this.returnFormGroup.get('return_payment_date')?.value)
        ).format('YYYY-MM-DD'),
        return_payment_name: this.returnFormGroup.get('return_payment_name')
          ?.value,
        return_payment_bank:
          this.returnFormGroup.get('return_payment_method')?.value == 'Cash'
            ? null
            : this.returnFormGroup.get('return_payment_bank')?.value,
        return_payment_method: this.returnFormGroup.get('return_payment_method')
          ?.value,
        return_payment_number:
          this.returnFormGroup.get('return_payment_method')?.value == 'Cash'
            ? null
            : this.returnFormGroup.get('return_payment_number')?.value,
        value: this.metaFormGroup.controls['value']?.value,
        sales_deposit_code_id: null,
      })
      .subscribe({
        next: (data) => {
          this.alertService.showSuccess(
            this.translateService.instant('overpayment__create__success')
          );
          this.metaFormGroup.reset();
          this.returnFormGroup.reset();
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

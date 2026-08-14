import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { availableBankSearch, IBank } from 'src/app/utils/bank';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatAutocompleteTrigger, MatAutocomplete } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-deposit-delete-confirmation',
    templateUrl: './deposit-delete-confirmation.component.html',
    styleUrl: './deposit-delete-confirmation.component.css',
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatSelect, MatOption, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatAutocompleteTrigger, MatAutocomplete, NgFor, NgIf, MatDialogActions, MatButton, MatDialogClose, TranslatePipe]
})
export class DepositDeleteConfirmationComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private dialog: MatDialogRef<DepositDeleteConfirmationComponent>,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private datePipe: DatePipe
  ) {}

  isSubmitting: boolean = false;

  formGroup: FormGroup = new FormGroup(
    {
      id: new FormControl('', Validators.required),
      method: new FormControl('', Validators.required),
      return_payment_date: new FormControl(''),
      return_payment_method: new FormControl(''),
      return_payment_name: new FormControl(''),
      return_payment_bank: new FormControl(''),
      return_payment_number: new FormControl(''),
    },
    {
      validators: this.bankValidator,
    }
  );

  banks: IBank[] = availableBankSearch.search('').splice(0, 5);

  bankValidator(group: AbstractControl): ValidationErrors | null {
    const method = group.get('method')?.value;
    const return_payment_date = group.get('return_payment_date')?.value;
    const return_payment_method = group.get('return_payment_method')?.value;
    const return_payment_bank = group.get('return_payment_bank')?.value;
    const return_payment_number = group.get('return_payment_number')?.value;

    if (method === 'delete') {
      return null;
    }

    let errors: any = {};

    if (!return_payment_method || return_payment_method === '') {
      errors.return_payment_method = 'Return payment method is required';
    }

    if (return_payment_method === 'transfer') {
      if (!return_payment_bank || return_payment_bank.trim() === '') {
        errors.return_payment_bank = 'Bank is required for transfer';
      }
      if (!return_payment_number || return_payment_number.trim() === '') {
        errors.return_payment_number = 'Bank number is required for transfer';
      }
    }

    // If method is 'create' and errors exist, return them
    return Object.keys(errors).length > 0 ? errors : null;
  }

  onMethodChange() {
    const method = this.formGroup.get('method')?.value;
    const payment_method = this.formGroup.get('return_payment_method')?.value;
    const payment_method_control = this.formGroup.get('return_payment_method');
    const date_control = this.formGroup.get('return_payment_date');
    const account_control = this.formGroup.get('return_payment_name');
    if (method === 'create') {
      payment_method_control?.enable();
      date_control?.enable();
      account_control?.enable();
    } else if (method === 'delete') {
      payment_method_control?.disable();
      date_control?.disable();
      account_control?.disable();
    }

    payment_method_control?.updateValueAndValidity();
  }

  onPaymentMethodChange() {
    const method = this.formGroup.get('return_payment_method')?.value;
    const bankControl = this.formGroup.get('return_payment_bank');
    const numberControl = this.formGroup.get('return_payment_number');
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

  ngOnInit(): void {
    this.formGroup.patchValue({
      id: this.data.id,
    });

    this.formGroup.controls['method'].valueChanges.subscribe(() => {
      this.onMethodChange();
    });

    this.formGroup.controls['return_payment_method'].valueChanges.subscribe(
      () => {
        this.onPaymentMethodChange();
      }
    );
  }

  onSubmit() {
    this.isSubmitting = true;
    this.apiService
      .post('sales-deposit/reject', {
        ...this.formGroup.value,
        return_payment_date:
          this.formGroup.get('method')?.value == 'delete'
            ? undefined
            : this.datePipe.transform(
                this.formGroup.get('return_payment_date')?.value,
                'yyyy-MM-dd'
              ),
      })
      .subscribe({
        next: () => {
          this.alertService.showSuccess(
            this.translateService.instant('sales-deposit__reject__success')
          );
          this.dialog.close('reject');
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

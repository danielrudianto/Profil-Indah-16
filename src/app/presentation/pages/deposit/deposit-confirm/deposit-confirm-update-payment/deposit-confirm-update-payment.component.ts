import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgxMaskDirective } from 'ngx-mask';
import { MatButton } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-deposit-confirm-update-payment',
    templateUrl: './deposit-confirm-update-payment.component.html',
    styleUrl: './deposit-confirm-update-payment.component.css',
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, NgxMaskDirective, MatDialogActions, MatButton, TranslateModule]
})
export class DepositConfirmUpdatePaymentComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<DepositConfirmUpdatePaymentComponent>
  ) {}

  formGroup: FormGroup = new FormGroup({
    date: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    value: new FormControl('', [Validators.required, Validators.min(1)]),
  });

  ngOnInit(): void {
    this.formGroup.setValue({
      date: this.data.date,
      name: this.data.name,
      value: this.data.value,
    });
  }

  submit() {
    this.dialog.close(this.formGroup.value);
  }
}

import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-deposit-confirm-update-payment',
  templateUrl: './deposit-confirm-update-payment.component.html',
  styleUrl: './deposit-confirm-update-payment.component.css',
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

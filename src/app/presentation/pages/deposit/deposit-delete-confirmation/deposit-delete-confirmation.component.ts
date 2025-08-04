import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-deposit-delete-confirmation',
  templateUrl: './deposit-delete-confirmation.component.html',
  styleUrl: './deposit-delete-confirmation.component.css',
})
export class DepositDeleteConfirmationComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private dialog: MatDialogRef<DepositDeleteConfirmationComponent>
  ) {}

  isSubmitting: boolean = false;

  formGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    method: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.formGroup.patchValue({
      id: this.data.id,
    });
  }

  confirm() {
    this.isSubmitting = true;
  }
}

import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-submit-confirmation',
    templateUrl: './submit-confirmation.component.html',
    styleUrls: ['./submit-confirmation.component.css'],
    standalone: false
})
export class SubmitConfirmationComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialogRef<SubmitConfirmationComponent>
  ) {}

  deleteDocument() {
    this.dialog.close(true);
  }
}

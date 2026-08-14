import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatButton } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-submit-confirmation',
    templateUrl: './submit-confirmation.component.html',
    styleUrls: ['./submit-confirmation.component.scss'],
    imports: [MatDialogTitle, NgIf, CdkScrollable, MatDialogContent, MatDialogActions, MatButton, MatDialogClose, TranslatePipe]
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

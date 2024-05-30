import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(private snackBar: MatSnackBar) {}

  showError(error: any) {
    this.snackBar.open(
      `${
        error.error == null || error.error == '' || error.error == undefined
          ? error.statusText
          : error.error
      }`,
      'Close',
      {
        duration: 1000,
      }
    );
  }

  showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 2000,
    });
  }

  showInfo(message: string) {
    return this.snackBar.open(message, 'Close', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
      panelClass: ['white-snackbar'],
    });
  }
}

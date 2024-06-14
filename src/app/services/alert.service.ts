import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor(
    private snackBar: MatSnackBar,
    private translateService: TranslateService
  ) {}

  showError(error: any) {
    this.snackBar.open(
      `${
        error.error == null || error.error == '' || error.error == undefined
          ? error.statusText
          : error.error
      }`,
      this.translateService.instant('general__close'),
      {
        duration: 1000,
      }
    );
  }

  showSuccess(message: string) {
    this.snackBar.open(
      message,
      this.translateService.instant('general__close'),
      {
        duration: 2000,
      }
    );
  }

  showInfo(message: string) {
    return this.snackBar.open(
      message,
      this.translateService.instant('general__close'),
      {
        duration: 2000,
        horizontalPosition: 'end',
        verticalPosition: 'bottom',
        panelClass: ['white-snackbar'],
      }
    );
  }
}

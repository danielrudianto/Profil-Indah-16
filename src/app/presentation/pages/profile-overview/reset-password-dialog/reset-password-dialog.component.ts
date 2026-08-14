import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-reset-password-dialog',
    templateUrl: './reset-password-dialog.component.html',
    styleUrls: ['./reset-password-dialog.component.css'],
    standalone: false
})
export class ResetPasswordDialogComponent {
  constructor(
    private apiService: ApiService,
    private dialog: MatDialogRef<ResetPasswordDialogComponent>,
    private alertService: AlertService,
    private authService: AuthService
  ) {}

  isSubmitting: boolean = false;

  resetPasswordForm: FormGroup = new FormGroup({
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
  });

  resetPassword() {
    this.isSubmitting = true;
    this.apiService
      .post('user/changePassword', {
        password: this.resetPasswordForm.value.password,
      })
      .subscribe({
        next: (data) => {
          this.alertService.showSuccess('Your password has been reset');
          this.dialog.close();
          this.authService.logout();
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }
}

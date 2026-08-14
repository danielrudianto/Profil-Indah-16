import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css'],
    standalone: false
})
export class LoginComponent {
  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  isHovered: boolean = false;
  isSubmitting: boolean = false;
  isVisibilityOn: boolean = false;

  loginFormGroup: FormGroup = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  /**
   * Logs in the user by sending a POST request to the 'auth/login' endpoint with the username and password from the loginFormGroup.
   * Sets the isSubmitting flag to true before sending the request and sets it back to false in the complete callback.
   * If the request is successful, sets the token using the authService and navigates to the home page.
   * If there is an error, logs the error to the console.
   */
  login() {
    this.isSubmitting = true;
    this.apiService
      .post('auth/login', {
        username: this.loginFormGroup.value.username,
        password: this.loginFormGroup.value.password,
      })
      .subscribe({
        next: (data) => {
          this.authService.setToken(data);
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error(`[error]: Error on authenticating user`, error);
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }
}

import { Component } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { LanguageService } from 'src/app/services/language.service';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';

/**
 * Halaman masuk — sistem desain Nocturne.
 *
 * Logika autentikasinya tidak berubah dari sebelumnya; yang dirombak hanya
 * tampilannya. Yang ditambahkan: pemilih bahasa di kaki kartu dan tombol
 * perlihatkan-sandi yang kini benar-benar tombol, bukan ikon yang tidak bisa
 * dicapai lewat papan ketik.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatPrefix,
    MatSuffix,FormsModule, ReactiveFormsModule, TranslatePipe],
})
export class LoginComponent {
  constructor(
    private apiService: ApiService,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    private languageService: LanguageService
  ) {}

  isSubmitting: boolean = false;
  isVisibilityOn: boolean = false;
  currentLang: string = 'id';

  loginFormGroup: FormGroup = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.languageService.currentLanguage.subscribe({
      next: (bahasa) => {
        this.currentLang = bahasa;
      },
    });
  }

  changeLanguage(bahasa: string): void {
    this.languageService.switchLanguage(bahasa);
  }

  /**
   * Mengirim kredensial ke `auth/login`, menyimpan tokennya, lalu berpindah ke
   * halaman utama.
   *
   * isSubmitting dikembalikan lewat .add() — dijalankan baik saat berhasil
   * maupun gagal, sehingga tombolnya tidak tertinggal dalam keadaan nonaktif
   * ketika login ditolak.
   */
  login() {
    if (this.loginFormGroup.invalid || this.isSubmitting) {
      return;
    }

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

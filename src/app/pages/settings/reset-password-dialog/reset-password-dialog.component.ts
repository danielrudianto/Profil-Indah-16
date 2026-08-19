import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DynamicDialogComponent } from 'src/app/components/dynamic-dialog/dynamic-dialog.component';
import { DialogShellComponent } from 'src/app/components/dialog-shell/dialog-shell.component';

/**
 * Dialog ganti kata sandi — sistem desain Nocturne.
 *
 * Sandi lama wajib dibuktikan dulu: server menolak bila salah, supaya
 * token yang tertinggal di komputer terbuka tidak cukup untuk merebut
 * akun. Setelah berhasil, sesi diakhiri — masuk lagi dengan sandi baru
 * adalah bukti hidup bahwa gantinya beneran tersimpan.
 */
@Component({
  selector: 'app-reset-password-dialog',
  templateUrl: './reset-password-dialog.component.html',
  styleUrls: ['./reset-password-dialog.component.scss'],
  imports: [
    NgIf,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    TranslatePipe,
    DynamicDialogComponent,
    DialogShellComponent,
  ],
})
export class ResetPasswordDialogComponent implements AfterViewInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private authService: AuthService,
    private translateService: TranslateService,
    private dynamicComponentService: DynamicComponentService,
  ) {}

  @ViewChild('input') input!: ElementRef<HTMLInputElement>;

  isOpened = true;
  isSubmitting = false;
  lihatSandi = false;

  sandiFormGroup: FormGroup = new FormGroup({
    currentPassword: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    confirmPassword: new FormControl('', Validators.required),
  });

  ngAfterViewInit(): void {
    this.input?.nativeElement.focus();
  }

  get konfirmasiBeda(): boolean {
    const nilai = this.sandiFormGroup.value;
    return (
      nilai.confirmPassword !== '' && nilai.password !== nilai.confirmPassword
    );
  }

  get bolehKirim(): boolean {
    return this.sandiFormGroup.valid && !this.konfirmasiBeda;
  }

  submitForm(): void {
    if (this.isSubmitting || !this.bolehKirim) {
      return;
    }

    this.isSubmitting = true;
    this.apiService
      .post('user/changePassword', {
        currentPassword: this.sandiFormGroup.value.currentPassword,
        password: this.sandiFormGroup.value.password,
      })
      .subscribe({
        next: () => {
          this.alertService.showSuccess(
            this.translateService.instant('ganti-sandi__success'),
          );
          this.closeDialog(true);
          this.authService.logout();
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  closeDialog(hasil?: any): void {
    this.isOpened = false;
    /* Menunggu peralihan menutupnya selesai sebelum komponennya dicabut. */
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(hasil);
    }, 300);
  }
}

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

  /**
   * Corong tunggal untuk seluruh galat dari backend — seluruh handler error di
   * aplikasi ini bermuara ke sini.
   *
   * Backend tidak lagi mengirim kalimat, melainkan KUNCI i18n seperti
   * "validation.password.required", dan badannya berupa teks mentah, bukan JSON.
   * Tanpa penerjemahan di sini, kunci itulah yang muncul di snackbar apa adanya.
   */
  showError(error: any) {
    this.snackBar.open(
      this.terjemahkanGalat(error),
      this.translateService.instant('general__close'),
      {
        duration: 1000,
      }
    );
  }

  /*
    Kunci yang tidak dikenal dikembalikan apa adanya oleh ngx-translate, dan
    perilaku itu justru yang diandalkan di sini: galat yang belum punya
    terjemahan tetap tampil sebagai teks aslinya, bukan menjadi kosong. Karena
    itu hasil terjemahannya tidak perlu diperiksa lagi.

    statusText dipakai hanya ketika badannya benar-benar kosong — misalnya saat
    sambungan putus dan tidak ada balasan apa pun dari server.
  */
  private terjemahkanGalat(error: any): string {
    const badan = error?.error;

    if (badan == null || badan === '') {
      return error?.statusText ?? '';
    }

    if (typeof badan !== 'string') {
      return `${badan}`;
    }

    return this.translateService.instant(badan);
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

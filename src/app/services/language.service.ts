import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  constructor(private translate: TranslateService) {
    // Add supported languages
    translate.addLangs(['id', 'en']);

    // Check for local storage
    const lang = localStorage.getItem('lang');
    if (lang) {
      translate.use(lang);
      this.currentLanguage.next(lang);
    } else {
      // Set default language
      this.currentLanguage.next('id');
    }
  }

  // Create an observable that emits the current language
  public currentLanguage: BehaviorSubject<string> = new BehaviorSubject('id');

  /*
    Ganti bahasa MEMUAT ULANG halaman. Label ngx-translate memang bisa
    bertukar hidup-hidup, tetapi tanggal (LOCALE_ID) dan datepicker
    Material (MAT_DATE_LOCALE) terpatri saat bootstrap — tanpa muat
    ulang, labelnya berganti bahasa sementara tanggalnya tertinggal di
    bahasa lama.
  */
  switchLanguage(language: string) {
    localStorage.setItem('lang', language);
    window.location.reload();
  }
}

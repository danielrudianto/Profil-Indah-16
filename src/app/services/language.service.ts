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

  switchLanguage(language: string) {
    this.translate.use(language);
    this.currentLanguage.next(language);
    localStorage.setItem('lang', language);
  }
}

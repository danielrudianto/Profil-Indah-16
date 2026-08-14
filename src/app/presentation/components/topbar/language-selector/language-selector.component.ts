import { Component } from '@angular/core';
import { LanguageService } from 'src/app/services/language.service';
import { MatIconButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-language-selector',
    templateUrl: './language-selector.component.html',
    styleUrls: ['./language-selector.component.css'],
    imports: [MatIconButton, MatMenuTrigger, NgIf, MatMenu, MatMenuItem]
})
export class LanguageSelectorComponent {
  constructor(private languageService: LanguageService) {}

  currentLang: string = '';

  ngOnInit(): void {
    this.languageService.currentLanguage.subscribe({
      next: (data) => {
        this.currentLang = data;
      },
    });
  }

  changeLanguage(language: string) {
    this.languageService.switchLanguage(language);
  }
}

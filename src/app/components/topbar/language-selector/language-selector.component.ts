import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';

/**
 * Pemilih bahasa — pil ID/EN sesuai Nocturne.
 *
 * Sebelumnya berupa tombol bendera dengan mat-menu. Bentuk itu menyembunyikan
 * pilihan di balik satu klik tambahan, dan bendera bukan penanda bahasa yang
 * dapat diandalkan: satu bendera mewakili negara, bukan bahasa.
 */
@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
  imports: [TranslatePipe],
})
export class LanguageSelectorComponent implements OnInit {
  constructor(private languageService: LanguageService) {}

  private destroyRef = inject(DestroyRef);

  currentLang: string = '';

  ngOnInit(): void {
    this.languageService.currentLanguage
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => (this.currentLang = data));
  }

  changeLanguage(language: string) {
    this.languageService.switchLanguage(language);
  }
}

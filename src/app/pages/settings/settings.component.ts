import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgFor } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import {
  ModeTampilan,
  SettingsService,
} from 'src/app/services/settings.service';
import { LanguageService } from 'src/app/services/language.service';
import {
  ACCENT_COLORS,
  ACCENT_DEFAULT,
  AccentColor,
} from 'src/app/constants/accent-color.constant';

/**
 * Halaman pengaturan tampilan.
 *
 * Dibuat bersamaan dengan dikeluarkannya pemilih aksen dari topbar. Tanpa
 * halaman ini keempat belas warna itu tidak punya pintu masuk sama sekali —
 * fiturnya masih ada di kode tetapi tidak bisa dijangkau siapa pun.
 *
 * Semua pilihan di sini berlaku SEKETIKA dan tersimpan sendiri lewat
 * SettingsService; tidak ada tombol simpan. Pilihan yang hasilnya langsung
 * terlihat di layar tidak perlu dikonfirmasi — pengguna sudah melihat
 * akibatnya sebelum sempat menekan tombol apa pun.
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  imports: [NgFor, TranslatePipe],
})
export class SettingsComponent implements OnInit {
  constructor(
    private settingsService: SettingsService,
    private languageService: LanguageService,
  ) {}

  private destroyRef = inject(DestroyRef);

  readonly warna: AccentColor[] = ACCENT_COLORS;

  aksenSekarang: AccentColor = ACCENT_DEFAULT;
  mode: ModeTampilan = 'light';
  bahasa: string = '';

  ngOnInit(): void {
    this.settingsService.accent
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((warna) => (this.aksenSekarang = warna));

    this.settingsService.mode
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mode) => (this.mode = mode));

    this.languageService.currentLanguage
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((bahasa) => (this.bahasa = bahasa));
  }

  lacakWarna = (_: number, warna: AccentColor): string => warna.label;

  pilihAksen(warna: AccentColor): void {
    this.settingsService.setAccent(warna);
  }

  pilihMode(mode: ModeTampilan): void {
    this.settingsService.setMode(mode);
  }

  pilihBahasa(bahasa: string): void {
    this.languageService.switchLanguage(bahasa);
  }
}

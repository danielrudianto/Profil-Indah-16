import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  ACCENT_COLORS,
  AccentColor,
} from 'src/app/constants/accent-color.constant';

/**
 * Preferensi tampilan: mode gelap dan warna aksen.
 *
 * Polanya mengikuti LanguageService — BehaviorSubject supaya komponen bisa
 * berlangganan, dan localStorage supaya pilihannya bertahan antar sesi.
 *
 * Keduanya bekerja lewat elemen <html>, bukan lewat pemuatan berkas tema
 * kedua. Tema Material di styles.scss dipasang dengan mat.theme() yang
 * memancarkan CSS custom property, jadi mengubah satu properti pada akar
 * dokumen sudah cukup untuk mengubah seluruh halaman — termasuk yang belum
 * dimuat, karena rutenya lazy.
 *
 * Disuntik oleh AppComponent, bukan hanya oleh pemilih di topbar. Topbar baru
 * muncul setelah login, sedangkan providedIn: 'root' hanya membentuk instansnya
 * ketika ada yang meminta — tanpa suntikan di akar, preferensi yang tersimpan
 * tidak akan terpasang di halaman login.
 */

export type ModeTampilan = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private static readonly KUNCI_MODE = 'settings__mode';
  private static readonly KUNCI_AKSEN = 'settings__accent';

  /** Warna bawaan mengikuti palet azure yang dipasang di styles.scss. */
  private static readonly AKSEN_BAWAAN = ACCENT_COLORS[0];

  public readonly mode: BehaviorSubject<ModeTampilan>;
  public readonly accent: BehaviorSubject<AccentColor>;

  constructor() {
    this.mode = new BehaviorSubject<ModeTampilan>(this.bacaMode());
    this.accent = new BehaviorSubject<AccentColor>(this.bacaAksen());

    this.terapkanMode(this.mode.value);
    this.terapkanAksen(this.accent.value);
  }

  setMode(mode: ModeTampilan): void {
    this.terapkanMode(mode);
    localStorage.setItem(SettingsService.KUNCI_MODE, mode);
    this.mode.next(mode);
  }

  toggleMode(): void {
    this.setMode(this.mode.value === 'dark' ? 'light' : 'dark');
  }

  setAccent(warna: AccentColor): void {
    this.terapkanAksen(warna);
    localStorage.setItem(SettingsService.KUNCI_AKSEN, warna.label);
    this.accent.next(warna);
  }

  /**
   * Membaca pilihan tersimpan; bila belum ada, mengikuti setelan sistem
   * pengguna. Nilai yang tidak dikenal diperlakukan sebagai belum ada, supaya
   * isi localStorage yang rusak tidak membuat tampilannya macet.
   */
  private bacaMode(): ModeTampilan {
    const tersimpan = localStorage.getItem(SettingsService.KUNCI_MODE);
    if (tersimpan === 'light' || tersimpan === 'dark') {
      return tersimpan;
    }

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  /*
    Yang disimpan adalah label warnanya, bukan nilai heksadesimalnya, dan
    pembacaannya dicocokkan kembali ke daftar. Dengan begitu nilai yang disunting
    lewat peralatan pengembang tidak pernah sampai ke properti CSS, dan penyetelan
    ulang palet di kemudian hari langsung berlaku pada pengguna lama tanpa perlu
    membersihkan localStorage mereka.
  */
  private bacaAksen(): AccentColor {
    const tersimpan = localStorage.getItem(SettingsService.KUNCI_AKSEN);
    return (
      ACCENT_COLORS.find((w) => w.label === tersimpan) ??
      SettingsService.AKSEN_BAWAAN
    );
  }

  private terapkanMode(mode: ModeTampilan): void {
    document.documentElement.style.colorScheme = mode;
  }

  private terapkanAksen(warna: AccentColor): void {
    /*
      --mat-sys-primary adalah token yang dibaca komponen Material untuk warna
      utamanya, dan Material menuliskannya sebagai light-dark(terang, gelap).
      Bentuk itu dipertahankan di sini: menimpanya dengan satu warna akan
      memaksa warna yang sama pada kedua mode.
    */
    document.documentElement.style.setProperty(
      '--mat-sys-primary',
      `light-dark(${warna.light}, ${warna.dark})`
    );
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
  ACCENT_COLORS,
  ACCENT_DEFAULT,
  AccentColor,
} from 'src/app/constants/accent-color.constant';
import {
  UKURAN_TEKS,
  UKURAN_TEKS_DEFAULT,
  PilihanUkuranTeks,
} from 'src/app/constants/text-size.constant';

/**
 * Preferensi tampilan: mode gelap, warna aksen, dan ukuran teks.
 *
 * Polanya mengikuti LanguageService — BehaviorSubject supaya komponen bisa
 * berlangganan, dan localStorage supaya pilihannya bertahan antar sesi.
 *
 * Keduanya bekerja lewat elemen <html>. Yang ditulis di sana adalah token
 * Nocturne, dan seluruh gaya membacanya dari situ, sehingga satu penulisan
 * cukup untuk mengubah seluruh halaman — termasuk yang belum dimuat karena
 * rutenya lazy.
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
  private static readonly KUNCI_UKURAN = 'settings__text-size';

  public readonly mode: BehaviorSubject<ModeTampilan>;
  public readonly accent: BehaviorSubject<AccentColor>;
  public readonly ukuranTeks: BehaviorSubject<PilihanUkuranTeks>;

  constructor() {
    this.mode = new BehaviorSubject<ModeTampilan>(this.bacaMode());
    this.accent = new BehaviorSubject<AccentColor>(this.bacaAksen());
    this.ukuranTeks = new BehaviorSubject<PilihanUkuranTeks>(this.bacaUkuran());

    this.terapkan();
  }

  setMode(mode: ModeTampilan): void {
    localStorage.setItem(SettingsService.KUNCI_MODE, mode);
    this.mode.next(mode);
    this.terapkan();
  }

  toggleMode(): void {
    this.setMode(this.mode.value === 'dark' ? 'light' : 'dark');
  }

  setUkuranTeks(ukuran: PilihanUkuranTeks): void {
    localStorage.setItem(SettingsService.KUNCI_UKURAN, ukuran.nilai);
    this.ukuranTeks.next(ukuran);
    this.terapkan();
  }

  setAccent(warna: AccentColor): void {
    localStorage.setItem(SettingsService.KUNCI_AKSEN, warna.base);
    this.accent.next(warna);
    this.terapkan();
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
    Yang disimpan adalah nilai `base`-nya, lalu dicocokkan kembali ke daftar
    saat dibaca. Dengan begitu nilai yang disunting lewat peralatan pengembang
    tidak pernah sampai ke properti CSS, dan penyetelan ulang palet di kemudian
    hari langsung berlaku pada pengguna lama tanpa perlu membersihkan
    localStorage mereka.
  */
  /*
    Sama seperti aksen: yang disimpan namanya, lalu dicocokkan kembali ke
    daftar. Pengali yang disunting lewat peralatan pengembang karenanya tidak
    pernah sampai ke CSS, dan penyetelan ulang angkanya kelak langsung berlaku
    pada pengguna lama tanpa perlu membersihkan localStorage mereka.
  */
  private bacaUkuran(): PilihanUkuranTeks {
    const tersimpan = localStorage.getItem(SettingsService.KUNCI_UKURAN);
    return (
      UKURAN_TEKS.find((u) => u.nilai === tersimpan) ?? UKURAN_TEKS_DEFAULT
    );
  }

  private bacaAksen(): AccentColor {
    const tersimpan = localStorage.getItem(SettingsService.KUNCI_AKSEN);
    return ACCENT_COLORS.find((w) => w.base === tersimpan) ?? ACCENT_DEFAULT;
  }

  /**
   * Menuliskan seluruh token yang bergantung pada tema dan aksen sekaligus.
   *
   * Ditulis dalam satu langkah, bukan terpisah per properti, karena keduanya
   * saling terkait: latar mode gelap diambil dari `d900` milik aksen, sehingga
   * mengganti aksen tanpa menulis ulang latarnya menghasilkan perpaduan yang
   * tidak pernah dirancang.
   */
  private terapkan(): void {
    const akar = document.documentElement;
    const mode = this.mode.value;
    const aksen = this.accent.value;
    const gelap = mode === 'dark';

    akar.style.colorScheme = mode;
    akar.setAttribute('data-theme', mode);

    /*
      Pada mode gelap aksennya DICERAHKAN dengan tint pasangannya. Desain
      melarang memakai `base` mentah di sana: warna sepekat itu di atas ground
      gelap nyaris tidak terbaca, dan tulisan di atasnya ikut hilang.
    */
    const warnaAksen = gelap
      ? `color-mix(in srgb, ${aksen.base} 62%, ${aksen.tint})`
      : aksen.base;

    /*
      GROUND DIAMBIL APA ADANYA DARI design_handoff/TOKENS.md.

      Berkas itu menyatakan dirinya satu-satunya sumber kebenaran warna dan
      melarang menghitung ulang dari rumus color-mix — ia SUDAH hasil
      hitungnya. Bentuk sebelumnya di sini justru menghitung sendiri, dan
      mencampur ground dengan rona aksen; itu akar semua selisih warna yang
      terjadi selama pengerjaan.

      Akibatnya ground tidak lagi ikut berubah ketika pengguna mengganti
      aksen. Itu memang maksud desainnya: yang berwarna hanya aksennya,
      groundnya netral.
    */
    const token: Record<string, string> = {
      /*
        Pengali tipografi. Dibaca oleh SETIAP deklarasi font-size aplikasi,
        yang seluruhnya ditulis sebagai calc(<n>px * var(--skala-teks, 1)).
      */
      '--skala-teks': String(this.ukuranTeks.value.skala),

      '--color-bg': gelap ? '#0d121d' : '#dde7fb',
      '--color-surface': gelap ? '#161b29' : '#f0f5fe',
      '--color-sidebar': gelap ? '#121724' : '#e8eefc',

      '--color-text': gelap ? '#e9e9ed' : '#292b31',
      '--color-text-muted': gelap ? '#8f93a3' : '#595d6c',
      '--color-text-faint': gelap ? '#6b7080' : '#75798c',

      '--color-divider': gelap
        ? 'rgba(233, 233, 237, 0.12)'
        : 'rgba(41, 43, 49, 0.14)',

      '--color-hover': gelap
        ? 'rgba(233, 233, 237, 0.06)'
        : 'rgba(41, 43, 49, 0.05)',

      /*
        Aksen tetap dihitung — TOKENS.md hanya memuat nilai pasti untuk biru
        (#527ff3 gelap, #154dec terang), sementara pengguna boleh memilih di
        antara lima belas warna. Rumusnya disetel agar biru mendarat tepat di
        angka itu.
      */
      '--color-accent': warnaAksen,
      '--color-accent-base': aksen.base,
      '--color-accent-tint': aksen.tint,

      /* Ground keadaan aktif: kartu pilihan, ikon dialog, avatar, banner. */
      '--color-active': gelap
        ? `color-mix(in srgb, ${aksen.base} 22%, #0d121d)`
        : `color-mix(in srgb, ${aksen.tint} 45%, #ffffff)`,

      /* Item sidebar aktif, tag halaman, chip saringan aktif. */
      '--color-accent-wash': gelap
        ? `color-mix(in srgb, ${warnaAksen} 12%, transparent)`
        : `color-mix(in srgb, ${aksen.base} 10%, transparent)`,

      /* Isi tombol utama — tipis, bukan isian penuh. */
      '--color-accent-wash-lemah': gelap
        ? `color-mix(in srgb, ${warnaAksen} 10%, transparent)`
        : `color-mix(in srgb, ${aksen.base} 8%, transparent)`,

      /* Lingkaran dekoratif di latar; dipakai halaman login. */
      '--blob-a': warnaAksen,
      '--blob-b': aksen.d900,
      '--blob-c': aksen.d800,
    };

    for (const [nama, nilai] of Object.entries(token)) {
      akar.style.setProperty(nama, nilai);
    }
  }
}

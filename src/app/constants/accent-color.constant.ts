/**
 * Pilihan warna aksen yang ditawarkan pemilih di topbar.
 *
 * Nilainya sengaja dibatasi pada daftar ini, bukan pemilih warna bebas.
 *
 * SETIAP WARNA PUNYA DUA NILAI, dan itu bukan hiasan. Material 3 menuliskan
 * --mat-sys-primary sebagai light-dark(terang, gelap) — satu properti yang
 * memuat dua warna sekaligus, dan peramban memilih salah satunya mengikuti
 * color-scheme. Menimpanya dengan satu warna saja akan memaksa warna yang sama
 * dipakai pada kedua mode: aksen gelap di atas permukaan gelap nyaris tidak
 * terlihat, dan tulisan di atasnya ikut hilang.
 *
 * `light` cukup gelap untuk dipakai bersama teks putih pada mode terang;
 * `dark` cukup terang untuk dibaca di atas permukaan gelap. Keduanya ditulis
 * apa adanya, bukan dihitung dari satu sama lain — perhitungan warna otomatis
 * gampang meleset pada rona tertentu dan kegagalannya baru terlihat oleh mata.
 *
 * ColorPickerComponent yang sudah ada di repo ini memang bisa memilih warna
 * bebas, tetapi bentuknya pemilih HSL sepenuhnya dan lebih cocok pada halaman
 * pengaturan tersendiri daripada di dalam menu topbar.
 */

export interface AccentColor {
  /** Kunci i18n untuk nama warnanya. */
  label: string;
  /** Heksadesimal enam digit untuk mode terang. */
  light: string;
  /** Heksadesimal enam digit untuk mode gelap. */
  dark: string;
}

export const ACCENT_COLORS: AccentColor[] = [
  { label: 'accent-selector__azure', light: '#005cbb', dark: '#abc7ff' },
  { label: 'accent-selector__violet', light: '#6750a4', dark: '#d0bcff' },
  { label: 'accent-selector__green', light: '#286c2c', dark: '#a1d69c' },
  { label: 'accent-selector__rose', light: '#a03b5f', dark: '#ffb1c6' },
  { label: 'accent-selector__orange', light: '#8f4c19', dark: '#ffb787' },
  { label: 'accent-selector__slate', light: '#44546a', dark: '#adc6e9' },
];

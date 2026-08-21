/**
 * Pilihan ukuran teks aplikasi.
 *
 * Nilainya PENGALI, bukan ukuran huruf. Seluruh deklarasi `font-size` di
 * aplikasi ini ditulis sebagai `calc(<n>px * var(--skala-teks, 1))`, sehingga
 * satu penulisan variabel di elemen <html> menggeser seluruh tipografi
 * sekaligus — termasuk halaman yang belum dimuat karena rutenya lazy.
 *
 * YANG DISKALAKAN HANYA TEKS, bukan seluruh halaman. Menskalakan halaman lewat
 * `zoom` memang lebih singkat, tetapi overlay CDK — autocomplete, select, menu
 * — menghitung posisinya lewat getBoundingClientRect di JavaScript, dan zoom
 * membuat perhitungan itu terhitung dua kali sehingga panelnya mendarat
 * meleset. Padding dan tinggi baris karenanya tetap, dan itulah alasan
 * pengalinya berhenti di 1,3: lebih dari itu teks mulai berdesakan di dalam
 * tombol yang tingginya tidak ikut tumbuh.
 */

export type UkuranTeks = 'kecil' | 'normal' | 'besar' | 'sangat-besar';

export interface PilihanUkuranTeks {
  /** Nilai yang disimpan di localStorage. */
  nilai: UkuranTeks;
  /** Pengali yang ditulis ke --skala-teks. */
  skala: number;
  /** Kunci i18n untuk namanya. */
  label: string;
}

export const UKURAN_TEKS: PilihanUkuranTeks[] = [
  {
    nilai: 'kecil',
    skala: 0.9,
    label: 'settings__text-size__small',
  },
  {
    nilai: 'normal',
    skala: 1,
    label: 'settings__text-size__normal',
  },
  {
    nilai: 'besar',
    skala: 1.15,
    label: 'settings__text-size__large',
  },
  {
    nilai: 'sangat-besar',
    skala: 1.3,
    label: 'settings__text-size__larger',
  },
];

export const UKURAN_TEKS_DEFAULT: PilihanUkuranTeks = UKURAN_TEKS[1];

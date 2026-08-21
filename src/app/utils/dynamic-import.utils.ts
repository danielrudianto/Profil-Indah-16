/**
 * Mengambil isi sebenarnya dari modul yang diimpor secara dinamis.
 *
 * Pustaka yang dipaketkan sebagai CJS/UMD — pdfmake, exceljs, dan kebanyakan
 * pustaka lama — muncul berbeda tergantung cara mengimpornya. `import * as X`
 * memberi objek `module.exports` apa adanya, sehingga `X.Workbook` bekerja.
 * Tetapi `await import(...)` membungkusnya menjadi namespace modul dengan
 * SATU ekspor bernama `default`, sehingga `modul.Workbook` menghasilkan
 * `undefined`.
 *
 * Bahayanya: TypeScript tidak melihat selisih ini sama sekali — berkas tipe
 * kedua pustaka itu mendeklarasikan ekspor bernama, jadi kompilasi lolos dan
 * kegagalannya baru muncul saat penggunanya menekan tombol Cetak atau Ekspor.
 * Itu benar-benar terjadi: keduanya lumpuh satu hari penuh di produksi.
 * Bentuknya diperiksa pada bundel hasil build — kedua chunk berakhir dengan
 * `export default ...`.
 *
 * `?? modul` dipertahankan supaya versi pustaka yang kelak benar-benar ESM,
 * yang tidak lagi punya `default`, tetap bekerja tanpa perubahan di sini.
 */
export function isiModul<T>(modul: unknown): T {
  const m = modul as { default?: T };
  return (m?.default ?? modul) as T;
}

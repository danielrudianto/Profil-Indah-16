import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Penjaga sesi.
 *
 * Mengembalikan UrlTree, bukan `false`, dan itu bukan soal gaya.
 *
 * Bentuk sebelumnya memanggil authService.logout() — yang di dalamnya memulai
 * perpindahan ke /Login — lalu mengembalikan `false`. Nilai `false` itu
 * MEMBATALKAN navigasi yang sedang berjalan, termasuk perpindahan yang baru saja
 * dimulai di dalamnya. Akibatnya alamatnya tetap di halaman semula, outlet-nya
 * tidak berisi apa pun, dan pengguna menatap layar kosong tanpa satu pun galat
 * di konsol.
 *
 * Selama masih ada halaman launcher, gejalanya jarang terlihat. Setelah
 * navigasi samping menjadi satu-satunya jalan, layar kosong itu langsung
 * terbaca seperti aplikasi yang rusak.
 *
 * UrlTree menyatakan "jangan ke sini, ke sana saja" dalam satu langkah,
 * sehingga tidak ada dua navigasi yang saling membatalkan.
 */
export const AuthGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.validateToken()) {
    return true;
  }

  /*
    logout() tetap dipanggil untuk membersihkan token dan data pengguna yang
    tersisa. Perpindahan yang ikut dimulainya menuju alamat yang sama dengan
    UrlTree di bawah, jadi keduanya tidak berselisih.
  */
  authService.logout();
  return router.parseUrl('/Login');
};

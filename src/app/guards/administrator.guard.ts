import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../constants/role.constant';

/**
 * Penjaga peran.
 *
 * Semuanya mengembalikan UrlTree ketika menolak, bukan `false`.
 *
 * `false` membatalkan navigasi tanpa menggantinya dengan apa pun: alamatnya
 * tetap di halaman sebelumnya, outlet-nya kosong, dan pengguna menatap layar
 * kosong tanpa penjelasan. Penolakan yang benar mengembalikan pengguna ke
 * halaman yang memang boleh dibukanya.
 *
 * Daftar perannya sengaja tetap ditulis di sini, bukan diambil dari
 * navigation.constant.ts. Menu dan penjagaan menjawab dua pertanyaan berbeda —
 * "apa yang ditawarkan" dan "apa yang diizinkan" — dan menyatukannya membuat
 * kekeliruan pada salah satunya diam-diam melonggarkan yang lain.
 */

/** Tujuan penolakan: dashboard, yang menyesuaikan diri dengan peran pengguna. */
function tolak(router: Router): UrlTree {
  return router.parseUrl('/');
}

export const AdministratorGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  return authService.isAdministrator() ? true : tolak(inject(Router));
};

export const SuperAdministratorGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  return authService.isSuperAdministrator() ? true : tolak(inject(Router));
};

function berdasarPeran(izin: Role[]): CanActivateFn {
  return (): boolean | UrlTree => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const peran = authService.getUserInfo()?.role;
    return peran != null && izin.includes(peran) ? true : tolak(router);
  };
}

export const SalesGuard = berdasarPeran([
  Role.Sales,
  Role.General,
  Role.Administrator,
  Role.Owner,
]);

export const PurchasingGuard = berdasarPeran([
  Role.Purchasing,
  Role.General,
  Role.Administrator,
  Role.Owner,
]);

export const GeneralGuard = berdasarPeran([
  Role.General,
  Role.Administrator,
  Role.Owner,
]);

/**
 * Semua peran yang bekerja dengan barang: pembelian, penjualan, umum, admin,
 * dan pemilik.
 *
 * Muncul ketika keempat subpohon peran digabung menjadi satu pohon. Halaman
 * seperti Stok dan Paket dulu berdiri di bawah KEEMPAT shell sekaligus,
 * sehingga hak aksesnya adalah gabungan keempat penjaga itu — dan tidak ada
 * satu pun penjaga lama yang menyatakannya. Tanpa ini, menggabungkan rutenya
 * akan diam-diam mempersempit siapa yang boleh membuka Stok.
 */
export const OperationalGuard = berdasarPeran([
  Role.Purchasing,
  Role.Sales,
  Role.General,
  Role.Administrator,
  Role.Owner,
]);

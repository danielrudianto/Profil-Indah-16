import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment';
import { DynamicComponentService } from './dynamic-component.service';

export interface AuthLogin {
  username: string;
  password: string;
}

export interface AuthUser {
  name: string;
  username: string;
  role: number;
  roleText: string;
  token: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private apiService: ApiService,
    private router: Router,
    private dynamicComponentService: DynamicComponentService
  ) {}

  /**
   * Logs in the user with the provided login data.
   *
   * @param {login} data - The login data containing the username and password.
   * @return {Observable<any>} An observable that emits the response from the API call.
   */
  login(data: AuthLogin) {
    return this.apiService.post('auth/login', data);
  }

  logout() {
    // If there is any dynamicComponentService opened, please close all of them
    this.dynamicComponentService.closeDynamicComponent();

    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user_avatar');

    this.router.navigate(['/Login']);
    return;
  }

  /**
   * Refreshes the authentication token by sending a POST request to the 'auth/refresh-token' endpoint.
   * @return {Observable<any>} An observable that emits the response from the API call.
   */
  refreshToken() {
    return this.apiService.post(
      'auth/refresh-token',
      {},
      {
        'x-access-token': `Bearer ${localStorage.getItem('refreshToken')}`,
      }
    );
  }

  /**
   * Retrieves the user information from the local storage.
   * @return {AuthUser | null} The user information if it exists in the local storage, otherwise null.
   *
   * TIDAK PERNAH MELEMPAR, sekalipun isinya tidak bisa dibaca.
   *
   * Bentuk sebelumnya langsung mem-parse hasil dekripsi. Ketika hasil itu bukan
   * JSON yang sah — dan itu terjadi setiap kali data tersimpan dengan
   * environment.key yang berbeda, misalnya sesi lama dari build produksi lalu
   * aplikasinya dijalankan dengan `ng serve` yang memakai kunci pengembangan —
   * dekripsi mengembalikan string kosong dan JSON.parse melempar.
   *
   * Lemparan itu terjadi di dalam ngOnInit dashboard, membatalkan seluruh
   * penggambaran, dan yang tersisa hanyalah layar kosong. Menganggap sesi yang
   * tidak terbaca sebagai "tidak ada sesi" mengembalikan pengguna ke halaman
   * masuk, yang memang jalan keluar yang benar.
   */
  getUserInfo(): AuthUser | null {
    const user = localStorage.getItem('user');
    if (user == null || user == '') {
      return null;
    }

    try {
      const isi = CryptoJS.AES.decrypt(
        user.toString(),
        environment.key
      ).toString(CryptoJS.enc.Utf8);

      if (isi === '') {
        return null;
      }

      return JSON.parse(isi) as AuthUser;
    } catch {
      return null;
    }
  }

  /**
   * Checks if the current user is an administrator.
   * @return {boolean} Returns true if the user is an administrator, false otherwise.
   */
  isAdministrator(): boolean {
    const role = this.getUserInfo()?.role;
    return role == 5 || role == 7;
  }

  isSuperAdministrator(): boolean {
    return this.getUserInfo()?.role == 7;
  }

  /**
   * Retrieves the expiry time of the token from the local storage.
   * @return {number | null} The expiry time of the token in milliseconds, or null if the token does not exist.
   */
  getTokenExpiryTime(): number | null {
    return this.bacaKedaluwarsa(localStorage.getItem('token'));
  }

  /**
   * Membaca waktu kedaluwarsa dari sebuah JWT, dalam milidetik.
   *
   * Mengembalikan null jika tokennya tidak ada atau bentuknya tidak utuh, alih-
   * alih melempar. Token yang rusak harus berakhir sebagai "sesi tidak sah" —
   * yang mengantar pengguna ke halaman masuk — bukan sebagai lemparan di dalam
   * guard, yang membatalkan navigasi dan meninggalkan layar kosong.
   */
  private bacaKedaluwarsa(token: string | null): number | null {
    if (token == null || token === '') {
      return null;
    }

    try {
      const muatan = token.split('.')[1];
      if (muatan == null) {
        return null;
      }

      const exp = JSON.parse(atob(muatan))?.exp;
      return typeof exp === 'number' ? exp * 1000 : null;
    } catch {
      return null;
    }
  }

  /**
   * Validates the token by checking if it exists in the local storage.
   * @return {boolean} Returns true if the token exists, false otherwise.
   */
  validateToken(): boolean {
    const expiry = this.bacaKedaluwarsa(localStorage.getItem('token'));

    // Token tidak ada atau bentuknya rusak — perlakukan sebagai belum masuk.
    if (expiry == null) {
      return false;
    }

    const now = new Date().getTime();
    if (now <= expiry) {
      return true;
    }

    /*
      Token akses sudah lewat; sesi masih sah selama refresh token-nya belum.
      Refresh token yang hilang atau rusak dulu membuat baris ini melempar
      (`refreshToken!`), padahal keadaannya sederhana: sesinya habis.
    */
    const refreshExpiry = this.bacaKedaluwarsa(
      localStorage.getItem('refreshToken')
    );

    if (refreshExpiry == null || now > refreshExpiry) {
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Sets the user, token, and refresh token in the local storage.
   * @param {any} loginData - The login data containing the user, token, and refresh token.
   */
  setToken(loginData: any) {
    localStorage.setItem(
      'user',
      CryptoJS.AES.encrypt(
        JSON.stringify(loginData.user),
        environment.key
      ).toString()
    );

    console.log(loginData);

    if (loginData.user_avatar != null) {
      localStorage.setItem(
        'user_avatar',
        JSON.stringify(loginData.user_avatar)
      );
    }

    localStorage.setItem('token', loginData.token.toString());
    localStorage.setItem('refreshToken', loginData.refreshToken.toString());
  }

  /**
   * Retrieves the token from the local storage.
   * @return {string | null} The token value from the local storage, or null if it doesn't exist.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getSelfAvatar(): any | null {
    const storedAvatar = localStorage.getItem('user_avatar');
    if (storedAvatar == null || storedAvatar == undefined) {
      return null;
    } else {
      return JSON.parse(storedAvatar);
    }
  }

  setSelfAvatar(avatar: any) {
    localStorage.setItem('user_avatar', JSON.stringify(avatar));
  }
}

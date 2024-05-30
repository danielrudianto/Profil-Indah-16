import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { environment } from 'src/environments/environment.development';

export interface AuthLogin {
  username: string;
  password: string;
}

export interface AuthUser {
  name: string;
  username: string;
  role: number;
  token: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private apiService: ApiService, private router: Router) {}

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
    localStorage.clear();
    this.router.navigate(['/Login']);
    return;
  }

  /**
   * Refreshes the authentication token by sending a POST request to the 'auth/refresh-token' endpoint.
   * @return {Observable<any>} An observable that emits the response from the API call.
   */
  refreshToken() {
    return this.apiService.post('auth/refresh-token', {
      'x-access-token': `Bearer ${localStorage.getItem('token')}`,
    });
  }

  /**
   * Retrieves the user information from the local storage.
   * @return {AuthUser | null} The user information if it exists in the local storage, otherwise null.
   */
  getUserInfo(): AuthUser | null {
    const user = localStorage.getItem('user');
    if (user == null || user == '') {
      return null;
    } else {
      return JSON.parse(
        CryptoJS.AES.decrypt(user.toString(), environment.key).toString(
          CryptoJS.enc.Utf8
        )
      ) as AuthUser;
    }
  }

  /**
   * Checks if the current user is an administrator.
   * @return {boolean} Returns true if the user is an administrator, false otherwise.
   */
  isAdministrator(): boolean {
    const user = localStorage.getItem('user');
    if (user == null || user == '') {
      return false;
    } else {
      const parsedUser = JSON.parse(
        CryptoJS.AES.decrypt(user.toString(), environment.key).toString(
          CryptoJS.enc.Utf8
        )
      ) as AuthUser;

      return parsedUser.role == 5;
    }
  }

  /**
   * Retrieves the expiry time of the token from the local storage.
   * @return {number | null} The expiry time of the token in milliseconds, or null if the token does not exist.
   */
  getTokenExpiryTime(): number | null {
    const token = localStorage.getItem('token');
    if (token == null) {
      return null;
    } else {
      const expiry = JSON.parse(atob(token.split('.')[1])).exp * 1000;
      return expiry;
    }
  }

  /**
   * Validates the token by checking if it exists in the local storage.
   * @return {boolean} Returns true if the token exists, false otherwise.
   */
  validateToken(): boolean {
    const token = localStorage.getItem('token');
    if (token == null) {
      return false;
    } else {
      return true;
    }
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

    if (loginData.user.user_avatar != null) {
      localStorage.setItem(
        'user_avatar',
        JSON.stringify(loginData.user.user_avatar)
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
    console.log(storedAvatar);
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

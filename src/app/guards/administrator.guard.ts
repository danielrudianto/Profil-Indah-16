import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdministratorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.isAdministrator();
};

export const SuperAdministratorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.isSuperAdministrator();
};

export const SalesGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userInfo = authService.getUserInfo();
  return userInfo == null ? false : [2, 3, 5, 7].includes(userInfo.roleID);
};

export const PurchasingGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userInfo = authService.getUserInfo();
  return userInfo == null ? false : [1, 3, 5, 7].includes(userInfo.roleID);
};

export const GeneralGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userInfo = authService.getUserInfo();
  return userInfo == null ? false : [3, 5, 7].includes(userInfo.roleID);
};

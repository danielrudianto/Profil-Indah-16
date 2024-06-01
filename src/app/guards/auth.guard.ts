import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const validation = authService.validateToken();
  if (!validation) {
    authService.logout();
  }
  return validation;
};

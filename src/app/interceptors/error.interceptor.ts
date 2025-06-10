import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError, mergeMap, retryWhen } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err) => {
        if (
          err.status == 400 &&
          request.url.split('/')[request.url.split('/').length - 1] ==
            'refresh-token'
        ) {
          this.authService.logout();
          return EMPTY;
        } else if (err.status === 401) {
          return this.reAuthenticate().pipe(
            mergeMap((data) => {
              if (data.hasOwnProperty('token')) {
                localStorage.setItem('token', data.token);
                request = request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${this.authService.getToken()}`,
                    'Content-Type': 'application/json',
                  },
                });

                return next.handle(request);
              } else {
                this.authService.logout();
                return EMPTY;
              }
            })
          );
        }

        return throwError(err);
      })
    );
  }

  reAuthenticate(): Observable<any> {
    return this.authService.refreshToken();
  }
}

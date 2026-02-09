import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth-service';
import { catchError, switchMap, throwError, of } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {

      if (req.url.includes('/refresh') || req.url.includes('/login')) {
        return auth.logout().pipe(
          catchError(() => of(null)),
          switchMap(() => throwError(() => err))
        );
      }

      if (err.status === 401) {
        return auth.refreshToken().pipe(
          switchMap(res => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${res.access_token}` }
            });
            return next(retryReq);
          }),
          catchError(refreshErr => {
            return auth.logout().pipe(
              catchError(() => of(null)),
              switchMap(() => throwError(() => refreshErr))
            );
          })
        );
      }

      return throwError(() => err);
    })
  );
};

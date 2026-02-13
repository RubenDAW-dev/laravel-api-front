import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth-service';
import { catchError, switchMap, throwError } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();
  const isApiCall = req.url.startsWith('http://localhost:8000/api');
  if (token && isApiCall) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      console.error('[HTTP] error', req.url, err.status, err.error);
      const isLogin = req.url.endsWith('/login');
      const isRefresh = req.url.endsWith('/refresh');

      if (isLogin && err.status === 401) return throwError(() => err);
      if (isRefresh) { auth.logout().subscribe(); return throwError(() => err); }

      if (err.status === 401 && isApiCall) {
        if (!auth.isAuthenticated()) { auth.logout().subscribe(); return throwError(() => err); }
        console.log('[HTTP] trying refresh…');
        return auth.refreshToken().pipe(
          switchMap(() => {
            const newToken = auth.getAccessToken();
            console.log('[HTTP] retry with new token', req.url);
            const retried = req.clone({ setHeaders: newToken ? { Authorization: `Bearer ${newToken}` } : {} });
            return next(retried);
          }),
          catchError((refreshErr) => { console.error('[HTTP] refresh FAILED'); auth.logout().subscribe(); return throwError(() => refreshErr); })
        );
      }
      return throwError(() => err);
    })
  );
};

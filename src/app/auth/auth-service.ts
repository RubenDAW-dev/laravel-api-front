import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, finalize, map, tap } from 'rxjs';
import { LoginResponse, User } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = 'http://localhost:8000/api';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  // 🚀 SIGNALS — necesarios para el PDF
  isLoggedIn = signal<boolean>(!!localStorage.getItem('access_token'));
  currentUser = signal<User | null>(
    JSON.parse(localStorage.getItem('user_data') || 'null')
  );

  constructor(private http: HttpClient) {}

  // -------------------
  // LOGIN
  // -------------------
  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.api}/login`, credentials)
      .pipe(tap(res => this.storeTokens(res)));
  }

  // -------------------
  // REGISTER
  // -------------------
  register(data: { name: string; email: string; password: string }) {
    return this.http.post(`${this.api}/register`, data);
  }

  // -------------------
  // LOGOUT
  // -------------------
  logout() {
    return this.http.post(`${this.api}/logout`, {})
      .pipe(finalize(() => this.clearTokens()));
  }

  // -------------------
  // PROFILE (me)
  // -------------------
getProfile() {
  return this.http.get<{ success: boolean; data: User; message: string }>(`${this.api}/me`)
    .pipe(
      map(res => res.data),
      tap(user => {
        this.userSubject.next(user);
        this.currentUser.set(user);
        localStorage.setItem('user_data', JSON.stringify(user));
      })
    );
}

  // -------------------
  // REFRESH TOKEN
  // -------------------
  refreshToken() {
    return this.http.post<{ access_token: string }>(`${this.api}/refresh`, {})
      .pipe(tap(res => {
        localStorage.setItem('access_token', res.access_token);
      }));
  }

  // -------------------
  // HELPERS
  // -------------------
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }

storeTokens(res: LoginResponse) {
  localStorage.setItem('access_token', res.access_token);
  this.isLoggedIn.set(true);

  if (res.user) {
    this.currentUser.set(res.user);
    this.userSubject.next(res.user);
    localStorage.setItem('user_data', JSON.stringify(res.user));
  }
}

clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_data');
  this.userSubject.next(null);
  this.currentUser.set(null);
  this.isLoggedIn.set(false);
}

loadUserIfNeeded() {
  if (this.getAccessToken() && !this.currentUser()) {
    this.getProfile().subscribe({
      next: (u) => console.log('[Auth] /me OK', u),
      error: (e) => { console.error('[Auth] /me ERROR', e); this.clearTokens(); }
    });
  }
}


  getAccessToken() {
    return localStorage.getItem('access_token');
  }
}
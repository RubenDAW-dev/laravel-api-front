import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, finalize, tap } from 'rxjs';
import { LoginResponse, User } from './auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private api = 'http://localhost:8000/api';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.api}/login`, credentials)
      .pipe(tap(res => this.storeTokens(res)));
  }

  register(data: { name: string; email: string; password: string }) {
    return this.http.post(`${this.api}/register`, data);
  }

  logout() {
    return this.http.post(`${this.api}/logout`, {})
      .pipe(finalize(() => this.clearTokens()));
  }

  getProfile() {
    return this.http.get<User>(`${this.api}/me`)
      .pipe(tap(user => this.userSubject.next(user)));
  }

  refreshToken() {
    return this.http.post<{ access_token: string }>(`${this.api}/refresh`, {})
      .pipe(tap(res => localStorage.setItem('access_token', res.access_token)));
  }

  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }

  private storeTokens(res: LoginResponse) {
    localStorage.setItem('access_token', res.access_token);
  }

  private clearTokens() {
    localStorage.removeItem('access_token');
    this.userSubject.next(null);
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }
}

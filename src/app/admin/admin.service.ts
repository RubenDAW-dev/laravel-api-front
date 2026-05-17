import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private api = 'http://localhost:8000/api/admin';

  private _peticiones = signal<any[]>([]);
  peticiones = this._peticiones.asReadonly();
  private peticionesLoaded = false;

  private _users = signal<any[]>([]);
  users = this._users.asReadonly();
  private usersLoaded = false;

  constructor(private http: HttpClient) {}


  fetchPeticiones(force = false) {
    if (this.peticionesLoaded && !force) {
      return new (class { subscribe(o: any) { o.next?.(); o.complete?.(); } })() as any;
    }
    return this.http.get<any>(`${this.api}/peticiones`).pipe(
      tap(res => {
        this._peticiones.set(res.data ?? []);
        this.peticionesLoaded = true;
      })
    );
  }

  getPeticion(id: number) {
    return this.http.get<any>(`${this.api}/peticiones/${id}`).pipe(
      map(res => res.data)
    );
  }

  createPeticion(formData: FormData) {
    return this.http.post<any>(`${this.api}/peticiones`, formData).pipe(
      tap(res => {
        this._peticiones.update(list => [res.data, ...list]);
      })
    );
  }

  updatePeticion(id: number, formData: FormData) {
    formData.append('_method', 'PUT');
    return this.http.post<any>(`${this.api}/peticiones/${id}`, formData).pipe(
      tap(res => {
        const updated = res.data;
        this._peticiones.update(list => list.map(p => p.id === id ? updated : p));
      })
    );
  }

  deletePeticion(id: number) {
    return this.http.delete<any>(`${this.api}/peticiones/${id}`).pipe(
      tap(() => {
        this._peticiones.update(list => list.filter(p => p.id !== id));
      })
    );
  }


  fetchUsers(force = false) {
    if (this.usersLoaded && !force) {
      return new (class { subscribe(o: any) { o.next?.(); o.complete?.(); } })() as any;
    }
    return this.http.get<any>(`${this.api}/users`).pipe(
      tap(res => {
        this._users.set(res.data ?? []);
        this.usersLoaded = true;
      })
    );
  }

  getUser(id: number) {
    return this.http.get<any>(`${this.api}/users/${id}`).pipe(
      map(res => res.data)
    );
  }

  createUser(data: any) {
    return this.http.post<any>(`${this.api}/users`, data).pipe(
      tap(res => {
        this._users.update(list => [...list, res.data]);
      })
    );
  }

  updateUser(id: number, data: any) {
    return this.http.put<any>(`${this.api}/users/${id}`, data).pipe(
      tap(res => {
        const updated = res.data;
        this._users.update(list => list.map(u => u.id === id ? updated : u));
      })
    );
  }

  deleteUser(id: number) {
    return this.http.delete<any>(`${this.api}/users/${id}`).pipe(
      tap(() => {
        this._users.update(list => list.filter(u => u.id !== id));
      })
    );
  }
}

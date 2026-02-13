import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PeticionService {

  private api = 'http://localhost:8000/api/peticiones';

  private _peticiones = signal<any[]>([]);
  peticiones = this._peticiones.asReadonly();

  loading = signal<boolean>(false);

  constructor(private http: HttpClient) { }

  // ------------------------------------------------------
  // LISTAR TODAS (GET /peticiones)
  // ------------------------------------------------------
  fetchAll() {
    this.loading.set(true);
    return this.http.get<any>(this.api).pipe(
      tap(res => {
        this._peticiones.set(res.data ?? []);
        this.loading.set(false);
      })
    );
  }

  // ------------------------------------------------------
  // OBTENER UNA PETICIÓN POR ID
  // ------------------------------------------------------
  getById(id: number) {
    return this.http.get<any>(`${this.api}/${id}`).pipe(
      map(res => res.data)
    );
  }

  // ------------------------------------------------------
  // CREAR PETICIÓN (POST) con FormData
  // ------------------------------------------------------
  create(formData: FormData) {
    return this.http.post<any>(this.api, formData).pipe(
      tap(res => {
        const nueva = res.data;
        // Añadir a la lista local
        this._peticiones.update(list => [nueva, ...list]);
      })
    );
  }

  // ------------------------------------------------------
  // EDITAR PETICIÓN (POST con _method=PUT)
  // ------------------------------------------------------
  update(id: number, formData: FormData) {
    formData.append('_method', 'PUT');

    return this.http.post<any>(`${this.api}/${id}`, formData).pipe(
      tap(res => {
        const actualizada = res.data;
        this._peticiones.update(list =>
          list.map(p => (p.id === id ? actualizada : p))
        );
      })
    );
  }

  // ------------------------------------------------------
  // ELIMINAR PETICIÓN
  // ------------------------------------------------------
  delete(id: number) {
    return this.http.delete<any>(`${this.api}/${id}`).pipe(
      tap(() => {
        this._peticiones.update(list => list.filter(p => p.id !== id));
      })
    );
  }

  // ------------------------------------------------------
  // FIRMAR (POST /peticiones/firmar/{id})
  // ------------------------------------------------------
  firmar(id: number) {
    return this.http.post<any>(`${this.api}/firmar/${id}`, {});
  }
  
  // src/app/peticion/peticion-service.ts
  listMine() {
    return this.http.get<any>('http://localhost:8000/api/mispeticiones')
      .pipe(map(res => res.data ?? []));
  }
}
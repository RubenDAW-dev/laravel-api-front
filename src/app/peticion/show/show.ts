// src/app/peticion/show/show.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PeticionService } from '../peticion-service';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-peticion-show',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './show.html',
  styleUrls: ['./show.css']
})
export class ShowComponent {
  private service = inject(PeticionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  peticion = signal<any | null>(null);
  cargando = signal<boolean>(true);
  error = signal<string | null>(null);

  // UX firmar
  firmando = signal<boolean>(false);
  yaFirmada = signal<boolean>(false);
  toast = signal<string | null>(null);

  currentUser = this.auth.currentUser;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.error.set('ID no válido'); this.cargando.set(false); return; }

    this.auth.loadUserIfNeeded();
    this.service.getById(id).subscribe({
      next: (data) => { this.peticion.set(data); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar la petición'); this.cargando.set(false); }
    });
  }

  getImg(): string {
    const path = this.peticion()?.files?.[0]?.path;
    return path ? `http://localhost:8000/storage/${path}` : 'assets/no-image.png';
  }

  esDueno(): boolean {
    const p = this.peticion(); const u = this.currentUser();
    return !!(p && u && p.user_id === u.id);
  }

  firmar() {
    const p = this.peticion(); if (!p?.id || this.firmando() || this.yaFirmada()) return;
    this.firmando.set(true); this.toast.set(null);

    this.service.firmar(p.id).subscribe({
      next: (res) => {
        // Suma en cliente y bloquea botón
        const nuevo = { ...p, firmantes: (p.firmantes ?? 0) + 1 };
        this.peticion.set(nuevo);
        this.yaFirmada.set(true);
        this.toast.set(res?.message || '¡Gracias por firmar!');
        this.firmando.set(false);
      },
      error: (err) => {
        // 403 si ya firmó
        const msg = err?.error?.message || 'No se pudo firmar';
        if (err?.status === 403) this.yaFirmada.set(true);
        this.toast.set(String(msg));
        this.firmando.set(false);
      }
    });
  }

  borrar() {
    const p = this.peticion(); if (!p?.id) return;
    if (!confirm('¿Eliminar esta petición?')) return;

    this.service.delete(p.id).subscribe({
      next: () => this.router.navigate(['/peticiones']),
      error: () => alert('No puedes borrar esto (quizás no eres el dueño)')
    });
  }
}
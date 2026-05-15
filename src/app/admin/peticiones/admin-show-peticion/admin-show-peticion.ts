import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-admin-show-peticion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-show-peticion.html',
  styleUrl: './admin-show-peticion.css'
})
export class AdminShowPeticionComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  peticion = signal<any>(null);
  cargando = signal(true);
  error = signal('');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.adminService.getPeticion(id).subscribe({
      next: (p) => { this.peticion.set(p); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar la petición'); this.cargando.set(false); }
    });
  }

  eliminar() {
    const p = this.peticion();
    if (!p || !confirm('¿Eliminar esta petición?')) return;
    this.adminService.deletePeticion(p.id).subscribe({
      next: () => this.router.navigate(['/admin/peticiones']),
      error: () => alert('No se pudo eliminar')
    });
  }

  getFileUrl(file: any): string {
    const path: string = file?.path ?? '';
    const clean = path.startsWith('/storage') ? path : `/storage/${path}`;
    return `http://localhost:8000${clean}`;
  }
}

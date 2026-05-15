import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-admin-peticiones-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-peticiones-list.html',
  styleUrl: './admin-peticiones-list.css'
})
export class AdminPeticionesListComponent implements OnInit {
  private adminService = inject(AdminService);

  peticiones = this.adminService.peticiones;
  cargando = signal(true);
  error = signal('');

  ngOnInit() {
    this.adminService.fetchPeticiones().subscribe({
      next: () => this.cargando.set(false),
      error: (e: any) => {
        this.error.set('Error al cargar peticiones');
        this.cargando.set(false);
      }
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar esta petición?')) return;
    this.adminService.deletePeticion(id).subscribe({
      error: () => alert('No se pudo eliminar la petición')
    });
  }

  getImg(p: any): string {
    if (p.files?.length > 0) {
      const lastFile = p.files[p.files.length - 1];
      const path = lastFile.path.startsWith('/storage')
        ? lastFile.path
        : `/storage/${lastFile.path}`;
      return `http://localhost:8000${path}`;
    }
    return 'assets/no-image.png';
  }
}

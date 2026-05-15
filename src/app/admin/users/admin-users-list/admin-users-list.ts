import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-admin-users-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-users-list.html',
  styleUrl: './admin-users-list.css'
})
export class AdminUsersListComponent implements OnInit {
  private adminService = inject(AdminService);

  users = this.adminService.users;
  cargando = signal(true);
  error = signal('');

  ngOnInit() {
    this.adminService.fetchUsers().subscribe({
      next: () => this.cargando.set(false),
      error: () => {
        this.error.set('Error al cargar usuarios');
        this.cargando.set(false);
      }
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.adminService.deleteUser(id).subscribe({
      error: (e: any) => {
        const msg = e?.error?.message ?? 'No se pudo eliminar el usuario';
        alert(msg);
      }
    });
  }
}

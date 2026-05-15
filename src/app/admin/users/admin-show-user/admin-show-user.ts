import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-admin-show-user',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-show-user.html',
  styleUrl: './admin-show-user.css'
})
export class AdminShowUserComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  user = signal<any>(null);
  cargando = signal(true);
  error = signal('');

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.adminService.getUser(id).subscribe({
      next: (u) => { this.user.set(u); this.cargando.set(false); },
      error: () => { this.error.set('No se pudo cargar el usuario'); this.cargando.set(false); }
    });
  }

  eliminar() {
    const u = this.user();
    if (!u || !confirm('¿Eliminar este usuario?')) return;
    this.adminService.deleteUser(u.id).subscribe({
      next: () => this.router.navigate(['/admin/users']),
      error: (e: any) => {
        const msg = e?.error?.message ?? 'No se pudo eliminar el usuario';
        alert(msg);
      }
    });
  }
}

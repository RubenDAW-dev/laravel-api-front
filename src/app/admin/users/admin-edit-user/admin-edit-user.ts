import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-admin-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-edit-user.html',
  styleUrl: './admin-edit-user.css'
})
export class AdminEditUserComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  userId = signal<number>(0);
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');

  form = this.fb.group({
    name:     ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    role:     ['user', Validators.required],
    password: [''],
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.userId.set(id);

    this.adminService.getUser(id).subscribe({
      next: (u) => {
        this.form.patchValue({
          name:  u.name,
          email: u.email,
          role:  u.role ?? 'user',
        });
        this.cargando.set(false);
      },
      error: () => { this.error.set('No se pudo cargar el usuario'); this.cargando.set(false); }
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.guardando.set(true);
    this.error.set('');

    const payload: any = {
      name:  this.form.value.name,
      email: this.form.value.email,
      role:  this.form.value.role,
    };

    if (this.form.value.password) {
      payload.password = this.form.value.password;
    }

    this.adminService.updateUser(this.userId(), payload).subscribe({
      next: () => this.router.navigate(['/admin/users', this.userId()]),
      error: (e: any) => {
        const msg = e?.error?.message ?? Object.values(e?.error?.errors ?? {}).flat()?.[0] ?? 'Error al guardar';
        this.error.set(String(msg));
        this.guardando.set(false);
      }
    });
  }
}

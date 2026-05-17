import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-admin-create-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-create-user.html',
  styleUrl: './admin-create-user.css'
})
export class AdminCreateUserComponent {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  guardando = signal(false);
  error = signal('');

  form = this.fb.group({
    name:     ['', Validators.required],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role:     ['user', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    this.guardando.set(true);
    this.error.set('');

    this.adminService.createUser(this.form.value).subscribe({
      next: (res: any) => this.router.navigate(['/admin/users', res.data.id]),
      error: (e: any) => {
        const msg = e?.error?.message ?? Object.values(e?.error?.errors ?? {}).flat()?.[0] ?? 'Error al crear';
        this.error.set(String(msg));
        this.guardando.set(false);
      }
    });
  }
}

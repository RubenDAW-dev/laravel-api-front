import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-admin-create-peticion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-create-peticion.html',
  styleUrl: './admin-create-peticion.css'
})
export class AdminCreatePeticionComponent implements OnInit {
  private adminService = inject(AdminService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  guardando = signal(false);
  error = signal('');
  categorias = signal<any[]>([]);
  users = signal<any[]>([]);
  previewUrl = signal('');
  fileToUpload: File | null = null;

  form = this.fb.group({
    titulo:       ['', Validators.required],
    descripcion:  ['', Validators.required],
    destinatario: ['', Validators.required],
    categoria_id: ['', Validators.required],
    user_id:      ['', Validators.required],
    estado:       ['pendiente', Validators.required],
  });

  ngOnInit() {
    this.http.get<any>('http://localhost:8000/api/categorias').subscribe({
      next: res => this.categorias.set(res.data ?? res ?? [])
    });

    this.adminService.fetchUsers().subscribe({
      next: () => this.users.set(this.adminService.users())
    });
  }

  onFileSelected(ev: Event) {
    const file = (ev.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.fileToUpload = file;
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  submit() {
    if (this.form.invalid) return;
    this.guardando.set(true);
    this.error.set('');

    const fd = new FormData();
    fd.append('titulo',       this.form.value.titulo!);
    fd.append('descripcion',  this.form.value.descripcion!);
    fd.append('destinatario', this.form.value.destinatario!);
    fd.append('categoria_id', this.form.value.categoria_id!);
    fd.append('user_id',      this.form.value.user_id!);
    fd.append('estado',       this.form.value.estado!);
    if (this.fileToUpload) fd.append('files[]', this.fileToUpload);

    this.adminService.createPeticion(fd).subscribe({
      next: (res: any) => this.router.navigate(['/admin/peticiones', res.data.id]),
      error: (e: any) => {
        const msg = e?.error?.message ?? Object.values(e?.error?.errors ?? {}).flat()?.[0] ?? 'Error al crear';
        this.error.set(String(msg));
        this.guardando.set(false);
      }
    });
  }
}

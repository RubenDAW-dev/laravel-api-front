// src/app/peticion/edit/edit.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PeticionService } from '../peticion-service';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-peticion-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit.html',
  styleUrls: ['./edit.css']
})
export class EditComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PeticionService);
  private auth = inject(AuthService);

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  // Previsualización
  previewUrl = signal<string>('assets/no-image.png');
  private fileToUpload: File | null = null;

  // Caché de la petición que estamos editando
  peticion = signal<any | null>(null);

  // ID de ruta
  id = signal<number | null>(null);

  form = this.fb.group({
    titulo: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    destinatario: ['', [Validators.required]],
    categoria_id: ['', [Validators.required]]
  });

  ngOnInit(): void {
    // Rehidratar usuario por si entramos directo con F5 (no imprescindible aquí, pero consistente)
    this.auth.loadUserIfNeeded();

    const raw = this.route.snapshot.paramMap.get('id');
    const num = Number(raw);
    if (!raw || Number.isNaN(num)) {
      this.errorMsg.set('ID no válido');
      return;
    }
    this.id.set(num);

    // Cargar datos
    this.loading.set(true);
    this.service.getById(num).subscribe({
      next: (data) => {
        this.peticion.set(data);

        // Rellenar formulario
        this.form.patchValue({
          titulo: data.titulo ?? '',
          descripcion: data.descripcion ?? '',
          destinatario: data.destinatario ?? '',
          categoria_id: String(data.categoria_id ?? '')
        });

        // Previsualizar imagen actual (si hay)
        const path = data?.files?.[0]?.path;
        this.previewUrl.set(path ? `http://localhost:8000/storage/${path}` : 'assets/no-image.png');

        this.loading.set(false);
      },
      error: (err) => {
        console.error('No se pudo cargar la petición', err);
        this.errorMsg.set('No se pudo cargar la petición');
        this.loading.set(false);
      }
    });
  }

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileToUpload = file;

    // Previsualización inmediata de la nueva imagen
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  submit() {
    this.errorMsg.set(null);
    const currentId = this.id();
    if (!currentId) {
      this.errorMsg.set('ID no válido');
      return;
    }
    if (this.form.invalid) {
      this.errorMsg.set('Rellena todos los campos requeridos.');
      return;
    }

    const fd = new FormData();
    fd.append('titulo', this.form.value.titulo!);
    fd.append('descripcion', this.form.value.descripcion!);
    fd.append('destinatario', this.form.value.destinatario!);
    fd.append('categoria_id', this.form.value.categoria_id!);

    // Solo enviamos 'file' si el usuario ha elegido una nueva imagen
    if (this.fileToUpload) {
      fd.append('file', this.fileToUpload);
    }

    this.loading.set(true);
    this.service.update(currentId, fd).subscribe({
      next: () => this.router.navigate(['/peticiones']),
      error: (err) => {
        // 403: no autorizado (no eres el dueño); 422: validación; otros: 500
        const msg =
          err?.error?.message ||
          Object.values(err?.error?.errors || {})?.flat()?.[0] ||
          'No se pudo actualizar la petición.';
        this.errorMsg.set(String(msg));
        this.loading.set(false);
      }
    });
  }
}
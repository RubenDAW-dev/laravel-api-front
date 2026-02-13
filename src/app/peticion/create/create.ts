import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PeticionService } from '../peticion-service';

@Component({
  selector: 'app-peticion-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create.html',
  styleUrls: ['./create.css']
})
export class CreateComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private service = inject(PeticionService);
  

  loading = signal(false);
  errorMsg = signal<string | null>(null);

  // Vista previa de imagen
  previewUrl = signal<string>('assets/no-image.png');
  fileToUpload: File | null = null;

  form = this.fb.group({
    titulo: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    destinatario: ['', [Validators.required]],
    categoria_id: ['', [Validators.required]]
  });

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileToUpload = file;

    // Preview
    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  submit() {
    this.errorMsg.set(null);

    if (this.form.invalid || !this.fileToUpload) {
      this.errorMsg.set('Rellena todos los campos y selecciona una imagen.');
      return;
    }

    const fd = new FormData();
    fd.append('titulo', this.form.value.titulo!);
    fd.append('descripcion', this.form.value.descripcion!);
    fd.append('destinatario', this.form.value.destinatario!);
    fd.append('categoria_id', this.form.value.categoria_id!);
    fd.append('file', this.fileToUpload);

    this.loading.set(true);

    this.service.create(fd).subscribe({
      next: () => this.router.navigate(['/peticiones']),
      error: (err) => {
        // 422 validación del backend: mostrar el primer error legible
        const msg =
          err?.error?.message ||
          Object.values(err?.error?.errors || {})?.flat()?.[0] ||
          'No se pudo crear la petición.';
        this.errorMsg.set(String(msg));
        this.loading.set(false);
      }
    });
  }
}
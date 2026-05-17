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

  filesToUpload: File[] = [];
  previewUrls = signal<string[]>([]);

  form = this.fb.group({
    titulo: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    destinatario: ['', [Validators.required]],
    categoria_id: ['', [Validators.required]]
  });

  onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.filesToUpload = Array.from(input.files);

    const previews: string[] = [];
    this.filesToUpload.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        previews.push(reader.result as string);
        if (previews.length === this.filesToUpload.length) {
          this.previewUrls.set([...previews]);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  submit() {
    this.errorMsg.set(null);

    if (this.form.invalid || this.filesToUpload.length === 0) {
      this.errorMsg.set('Rellena todos los campos y selecciona al menos una imagen.');
      return;
    }

    const fd = new FormData();
    fd.append('titulo', this.form.value.titulo!);
    fd.append('descripcion', this.form.value.descripcion!);
    fd.append('destinatario', this.form.value.destinatario!);
    fd.append('categoria_id', this.form.value.categoria_id!);

    // Append all files as files[]
    this.filesToUpload.forEach(file => fd.append('files[]', file));

    this.loading.set(true);

    this.service.create(fd).subscribe({
      next: () => this.router.navigate(['/peticiones']),
      error: (err: any) => {
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

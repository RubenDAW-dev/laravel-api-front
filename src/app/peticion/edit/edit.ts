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
  public fb = inject(FormBuilder);
  public route = inject(ActivatedRoute);
  public router = inject(Router);
  public service = inject(PeticionService);
  public auth = inject(AuthService);

  public loading = signal(false);
  public errorMsg = signal<string | null>(null);

  public previewUrl = signal<string>('assets/no-image.png');
  public fileToUpload: File | null = null;

  public peticion = signal<any | null>(null);
  public id = signal<number | null>(null);

  public form = this.fb.group({
    titulo: ['', [Validators.required]],
    descripcion: ['', [Validators.required]],
    destinatario: ['', [Validators.required]],
    categoria_id: ['', [Validators.required]]
  });

ngOnInit(): void {
  this.auth.loadUserIfNeeded();

  const raw = this.route.snapshot.paramMap.get('id');
  const num = Number(raw);
  if (!raw || Number.isNaN(num)) {
    this.errorMsg.set('ID no válido');
    return;
  }
  this.id.set(num);

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

      //  de imagen segura
      const filePath = data?.files?.[0]?.path;
      if (filePath) {
        const finalPath = filePath.startsWith('/storage') ? filePath : `/storage/${filePath}`;
        this.previewUrl.set(`http://localhost:8000${finalPath}`);
      } else {
        this.previewUrl.set('assets/no-image.png');
      }

      this.loading.set(false);
    },
    error: (err) => {
      console.error('No se pudo cargar la petición', err);
      this.errorMsg.set('No se pudo cargar la petición');
      this.loading.set(false);
    }
  });
}


  public onFileSelected(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.fileToUpload = file;

    const reader = new FileReader();
    reader.onload = () => this.previewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  public submit() {
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

    if (this.fileToUpload) {
      fd.append('file', this.fileToUpload);
    }

    this.loading.set(true);
    this.service.update(currentId, fd).subscribe({
      next: () => this.router.navigate(['/peticiones']),
      error: (err) => {
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

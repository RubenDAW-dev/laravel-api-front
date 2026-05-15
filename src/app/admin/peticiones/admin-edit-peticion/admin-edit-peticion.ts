import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../admin.service';

@Component({
  selector: 'app-admin-edit-peticion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-edit-peticion.html',
  styleUrl: './admin-edit-peticion.css'
})
export class AdminEditPeticionComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  peticionId = signal<number>(0);
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');
  categorias = signal<any[]>([]);
  previewUrl = signal('');
  fileToUpload: File | null = null;

  form = this.fb.group({
    titulo:       ['', Validators.required],
    descripcion:  ['', Validators.required],
    destinatario: ['', Validators.required],
    categoria_id: ['', Validators.required],
    estado:       ['activa', Validators.required],
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.peticionId.set(id);

    this.http.get<any>('http://localhost:8000/api/categorias').subscribe({
      next: res => this.categorias.set(res.data ?? res ?? [])
    });

    this.adminService.getPeticion(id).subscribe({
      next: (p) => {
        this.form.patchValue({
          titulo:       p.titulo ?? '',
          descripcion:  p.descripcion ?? '',
          destinatario: p.destinatario ?? '',
          categoria_id: String(p.categoria_id ?? ''),
          estado:       p.estado ?? 'activa',
        });

        const lastFile = p.files?.[p.files.length - 1];
        if (lastFile?.path) {
          const path = lastFile.path.startsWith('/storage') ? lastFile.path : `/storage/${lastFile.path}`;
          this.previewUrl.set(`http://localhost:8000${path}`);
        }

        this.cargando.set(false);
      },
      error: () => { this.error.set('No se pudo cargar la petición'); this.cargando.set(false); }
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
    fd.append('estado',       this.form.value.estado!);
    if (this.fileToUpload) fd.append('file', this.fileToUpload);

    this.adminService.updatePeticion(this.peticionId(), fd).subscribe({
      next: () => this.router.navigate(['/admin/peticiones', this.peticionId()]),
      error: (e: any) => {
        const msg = e?.error?.message ?? Object.values(e?.error?.errors ?? {}).flat()?.[0] ?? 'Error al guardar';
        this.error.set(String(msg));
        this.guardando.set(false);
      }
    });
  }
}

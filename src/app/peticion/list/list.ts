import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PeticionService } from '../peticion-service';

@Component({
  selector: 'app-peticion-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './list.html',
  styleUrls: ['./list.css']
})
export class ListComponent {

  private service = inject(PeticionService);
  private route = inject(ActivatedRoute);

  peticiones = signal<any[]>([]);
  cargando = signal<boolean>(true);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const q = (params['q'] ?? '').toLowerCase();

      this.cargando.set(true);

      this.service.fetchAll().subscribe({
        next: () => {
          const data = this.service.peticiones(); // signal de servicio

          if (q) {
            this.peticiones.set(
              data.filter(p =>
                p.titulo.toLowerCase().includes(q) ||
                p.descripcion.toLowerCase().includes(q)
              )
            );
          } else {
            this.peticiones.set(data);
          }

          this.cargando.set(false);
        },
        error: err => {
          console.error('Error al cargar peticiones:', err);
          this.cargando.set(false);
        }
      });
    });
  }

  eliminar(id: number) {
    if (!confirm('¿Seguro de eliminar esta petición?')) return;

    this.service.delete(id).subscribe({
      next: () => {
        this.peticiones.set(this.peticiones().filter(p => p.id !== id));
      },
      error: err => {
        alert('No puedes borrar esto (quizás no eres el dueño)');
      }
    });
  }

  getImg(p: any) {
    if (p.files?.length > 0) {
      return `http://localhost:8000/storage/${p.files[0].path}`;
    }
    return 'assets/no-image.png';
  }
}
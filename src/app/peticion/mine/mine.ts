import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PeticionService } from '../peticion-service';

@Component({
  selector: 'app-peticion-mine',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './mine.html',
  styleUrls: ['./mine.css']
})
export class MineComponent {
  public service = inject(PeticionService);

  public cargando = signal(true);
  public peticiones = signal<any[]>([]);
  public errorMsg = signal<string | null>(null);

  ngOnInit(): void {
    this.service.listMine().subscribe({
      next: (list) => {
        this.peticiones.set(list);
        this.cargando.set(false);
      },
      error: () => {
        this.errorMsg.set('No se pudieron cargar tus peticiones');
        this.cargando.set(false);
      }
    });
  }

  getImg(p: any) {
    if (p.files?.length > 0) {
      // Aseguramos que la URL empiece con /storage
      const path = p.files[0].path.startsWith('/storage')
        ? p.files[0].path
        : `/storage/${p.files[0].path}`;
      return `http://localhost:8000${path}`;
    }
    return 'assets/no-image.png'; // fallback local
  }
}

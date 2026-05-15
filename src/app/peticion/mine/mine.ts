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

  getImg(p: any): string {
    if (p.files?.length > 0) {
      const lastFile = p.files[p.files.length - 1];
      const path = lastFile.path.startsWith('/storage')
        ? lastFile.path
        : `/storage/${lastFile.path}`;
      return `http://localhost:8000${path}`;
    }
    return 'assets/no-image.png';
  }
}

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
  private service = inject(PeticionService);

  cargando = signal(true);
  peticiones = signal<any[]>([]);
  errorMsg = signal<string | null>(null);

  ngOnInit(): void {
    this.service.listMine().subscribe({
      next: (list) => { this.peticiones.set(list); this.cargando.set(false); },
      error: () => { this.errorMsg.set('No se pudieron cargar tus peticiones'); this.cargando.set(false); }
    });
  }

  getImg(p: any) {
    return p?.files?.[0]?.path ? `http://localhost:8000/storage/${p.files[0].path}` : 'assets/no-image.png';
  }
}
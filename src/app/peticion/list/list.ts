import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PeticionService } from '../peticion-service';

@Component({
  selector: 'app-peticion-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list.html',
  styleUrls: ['./list.css']
})
export class ListComponent {

  private service = inject(PeticionService);
  private route = inject(ActivatedRoute);

  cargando = signal<boolean>(true);

  // Filter state
  estadoFiltro = signal<string>('todas');
  categoriaFiltro = signal<string>('todas');

  // Pagination state
  paginaActual = signal<number>(1);
  readonly itemsPorPagina = 6;

  // Getter/setter for ngModel two-way binding on selects
  get estadoBind() { return this.estadoFiltro(); }
  set estadoBind(v: string) {
    this.estadoFiltro.set(v);
    this.categoriaFiltro.set('todas');
    this.paginaActual.set(1);
  }

  get categoriaBind() { return this.categoriaFiltro(); }
  set categoriaBind(v: string) {
    this.categoriaFiltro.set(v);
    this.paginaActual.set(1);
  }

  // Step 1: filter by search term (from URL query param)
  busqueda = signal<string>('');

  peticionesBuscadas = computed(() => {
    const q = this.busqueda().toLowerCase();
    const todas = this.service.peticiones();
    if (!q) return todas;
    return todas.filter((p: any) =>
      p.titulo?.toLowerCase().includes(q) ||
      p.descripcion?.toLowerCase().includes(q)
    );
  });

  // Step 2: filter by estado de firmas
  peticionesPorEstado = computed(() => {
    const lista = this.peticionesBuscadas();
    const estado = this.estadoFiltro();
    if (estado === 'con_firmas') return lista.filter((p: any) => (p.firmantes ?? 0) > 0);
    if (estado === 'sin_firmas') return lista.filter((p: any) => (p.firmantes ?? 0) === 0);
    return lista;
  });

  // Categorías desde la BD
  categoriasDisponibles = this.service.categorias;

  // Step 3: filter by category
  peticionesFiltradas = computed(() => {
    const lista = this.peticionesPorEstado();
    const cat = this.categoriaFiltro();
    if (cat === 'todas') return lista;
    return lista.filter((p: any) => String(p.categoria_id) === cat);
  });

  // Pagination computed
  totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.peticionesFiltradas().length / this.itemsPorPagina))
  );

  peticionesPaginadas = computed(() => {
    const pagina = this.paginaActual();
    const lista = this.peticionesFiltradas();
    const inicio = (pagina - 1) * this.itemsPorPagina;
    return lista.slice(inicio, inicio + this.itemsPorPagina);
  });

  ngOnInit() {
    this.service.fetchCategorias().subscribe();

    this.route.queryParams.subscribe((params: any) => {
      const q = params['q'] ?? '';
      this.busqueda.set(q);
      this.paginaActual.set(1);

      this.cargando.set(true);
      this.service.fetchAll().subscribe({
        next: () => this.cargando.set(false),
        error: (err: any) => {
          console.error('Error al cargar peticiones:', err);
          this.cargando.set(false);
        }
      });
    });
  }

  irAPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaActual.set(pagina);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  eliminar(id: number) {
    if (!confirm('¿Seguro de eliminar esta petición?')) return;
    this.service.delete(id).subscribe({
      error: () => alert('No puedes borrar esto (quizás no eres el dueño)')
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

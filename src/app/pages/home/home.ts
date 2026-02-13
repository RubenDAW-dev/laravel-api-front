import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PeticionService } from '../../peticion/peticion-service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  termino = '';
  constructor(private router: Router) { }
  
  private peticionService = inject(PeticionService);

  petitions = this.peticionService.peticiones;

  ngOnInit() {
    this.peticionService.fetchAll().subscribe();
  }
  buscar() {
    const q = this.termino.trim();
    if (q) {
      this.router.navigate(['/peticiones'], { queryParams: { q } });
    } else {
      this.router.navigate(['/peticiones']);
    }
  }

  getImg(petition: any): string {
  const path = petition?.files?.[0]?.path;
  if (path) {
    const finalPath = path.startsWith('/storage') ? path : `/storage/${path}`;
    return `http://localhost:8000${finalPath}`;
  }
  return 'assets/default.jpg';
}


}

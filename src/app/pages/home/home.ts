import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  termino = '';
  constructor(private router: Router) {}

  buscar() {
    const q = this.termino.trim();
    if (q) {
      this.router.navigate(['/peticiones'], { queryParams: { q } });
    } else {
      this.router.navigate(['/peticiones']);
    }
  }
}
``
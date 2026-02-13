import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  private auth = inject(AuthService);
  router = inject(Router);

  menuOpen = false;


  ngOnInit(): void {
    this.auth.loadUserIfNeeded();
  }
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.auth.logout().subscribe();
  }
  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  currentUser() {
    return this.auth.currentUser();
  }

}
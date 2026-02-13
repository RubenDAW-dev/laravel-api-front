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

  isLoggedIn = this.auth.isLoggedIn;
  currentUser = this.auth.currentUser;

ngOnInit(): void {
  this.auth.loadUserIfNeeded();
}

  logout() {
    this.auth.logout().subscribe();
  }
}
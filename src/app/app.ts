import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./shared/navbar/navbar";
import { FooterComponent } from "./shared/footer/footer";
import { AuthService } from './auth/auth-service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('myfrontend');

  private auth = inject(AuthService);
  private router = inject(Router);

  isAdminRoute = signal(false);

  ngOnInit(): void {
    this.auth.loadUserIfNeeded();

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => {
        this.isAdminRoute.set(e.urlAfterRedirects.startsWith('/admin'));
      });
  }
}

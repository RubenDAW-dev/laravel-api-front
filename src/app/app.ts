import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./shared/navbar/navbar";
import { AuthService } from './auth/auth-service';
import { FooterComponent } from "./shared/footer/footer";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('myfrontend');

  
  private auth = inject(AuthService);

  ngOnInit(): void {
    this.auth.loadUserIfNeeded();
  }

}

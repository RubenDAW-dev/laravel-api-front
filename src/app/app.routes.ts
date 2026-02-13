import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';

import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProfileComponent } from './pages/profile/profile';

import { ListComponent } from './peticion/list/list';
import { CreateComponent } from './peticion/create/create';
import { EditComponent } from './peticion/edit/edit';
import { ShowComponent } from './peticion/show/show';
import { MineComponent } from './peticion/mine/mine';

export const routes: Routes = [
  { path: '', component: HomeComponent },

  { path: 'peticiones', component: ListComponent },
  { path: 'mispeticiones', component: MineComponent, canActivate: [authGuard] },

  { path: 'peticiones/create', component: CreateComponent, canActivate: [authGuard] },
  { path: 'peticiones/edit/:id', component: EditComponent, canActivate: [authGuard] },

  { path: 'peticiones/:id', component: ShowComponent },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: '' },
];
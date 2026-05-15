import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { adminGuard } from './auth/admin-guard';

import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProfileComponent } from './pages/profile/profile';

import { ListComponent } from './peticion/list/list';
import { CreateComponent } from './peticion/create/create';
import { EditComponent } from './peticion/edit/edit';
import { ShowComponent } from './peticion/show/show';
import { MineComponent } from './peticion/mine/mine';

import { AdminLayoutComponent } from './admin/layout/admin-layout';
import { AdminPeticionesListComponent } from './admin/peticiones/admin-peticiones-list/admin-peticiones-list';
import { AdminShowPeticionComponent } from './admin/peticiones/admin-show-peticion/admin-show-peticion';
import { AdminEditPeticionComponent } from './admin/peticiones/admin-edit-peticion/admin-edit-peticion';
import { AdminUsersListComponent } from './admin/users/admin-users-list/admin-users-list';
import { AdminShowUserComponent } from './admin/users/admin-show-user/admin-show-user';
import { AdminEditUserComponent } from './admin/users/admin-edit-user/admin-edit-user';

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

  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'peticiones', pathMatch: 'full' },
      { path: 'peticiones', component: AdminPeticionesListComponent },
      { path: 'peticiones/:id', component: AdminShowPeticionComponent },
      { path: 'peticiones/:id/edit', component: AdminEditPeticionComponent },
      { path: 'users', component: AdminUsersListComponent },
      { path: 'users/:id', component: AdminShowUserComponent },
      { path: 'users/:id/edit', component: AdminEditUserComponent },
    ]
  },

  { path: '**', redirectTo: '' },
];

import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Rutas protegidas - Cliente
  {
    path: 'cliente',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/cliente/cliente.routes').then(m => m.clienteRoutes)
  },
  
  // Rutas protegidas - Barbero
  {
    path: 'barbero',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/barbero/barbero.routes').then(m => m.barberoRoutes)
  },
  
  // Rutas protegidas - Secretaria
  {
    path: 'secretaria',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/secretaria/secretaria.routes').then(m => m.secretariaRoutes)
  },
  
  // Rutas protegidas - Admin
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.adminRoutes)
  },
  
  // Redirección por defecto
  { path: '**', redirectTo: '' }
];

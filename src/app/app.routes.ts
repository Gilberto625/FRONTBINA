import { Routes } from '@angular/router';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas
  { path: '', component: LandingComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  
  // Rutas protegidas - Cliente
  {
    path: 'cliente',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/cliente/cliente.routes').then(m => m.clienteRoutes)
  },
  
  // Rutas protegidas - Barbero
  {
    path: 'barbero',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/barbero/barbero.routes').then(m => m.barberoRoutes)
  },
  
  // Rutas protegidas - Secretaria
  {
    path: 'secretaria',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/secretaria/secretaria.routes').then(m => m.secretariaRoutes)
  },
  
  // Rutas protegidas - Admin
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.adminRoutes)
  },
  
  // Redirección por defecto
  { path: '**', redirectTo: '' }
];

import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'verify-2fa',
    loadComponent: () => import('./components/verify2fa/verify2fa.component').then(m => m.Verify2faComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]  // Ruta protegida
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'setup-totp',
    loadComponent: () => import('./components/setup-totp/setup-totp.component').then(m => m.SetupTotpComponent),
    canActivate: [authGuard]  // Ruta protegida
  },
  {
    path: 'backup-codes',
    loadComponent: () => import('./components/backup-codes/backup-codes.component').then(m => m.BackupCodesComponent),
    canActivate: [authGuard]  // Ruta protegida
  },
  {
    path: 'security',
    loadComponent: () => import('./components/security-dashboard/security-dashboard.component').then(m => m.SecurityDashboardComponent),
    canActivate: [authGuard]  // Ruta protegida
  },
  {
    path: 'change-password',
    loadComponent: () => import('./components/change-password/change-password.component').then(m => m.ChangePasswordComponent),
    canActivate: [authGuard]  // Ruta protegida
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

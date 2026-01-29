import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { secretariaGuard } from './guards/secretaria.guard';
import { barberoGuard } from './guards/barbero.guard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/landing/landing.component').then(m => m.LandingComponent)
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
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]  // Ruta protegida
  },
  {
    path: 'agendar-cita',
    loadComponent: () => import('./components/agendar-cita/agendar-cita.component').then(m => m.AgendarCitaComponent),
    canActivate: [authGuard]  // Ruta protegida
  },
  {
    path: 'mis-citas',
    loadComponent: () => import('./components/mis-citas/mis-citas.component').then(m => m.MisCitasComponent),
    canActivate: [authGuard]  // Ruta protegida
  },
  {
    path: 'mis-compras',
    loadComponent: () => import('./components/mis-compras/mis-compras.component').then(m => m.MisComprasComponent),
    canActivate: [authGuard]  // Ruta protegida
  },
  {
    path: 'productos',
    loadComponent: () => import('./components/productos/productos.component').then(m => m.ProductosComponent),
    canActivate: [authGuard]
  },
  {
    path: 'productos/:id',
    loadComponent: () => import('./components/producto-detalle/producto-detalle.component').then(m => m.ProductoDetalleComponent),
    canActivate: [authGuard]
  },
  {
    path: 'carrito',
    loadComponent: () => import('./components/carrito/carrito.component').then(m => m.CarritoComponent),
    canActivate: [authGuard]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pagar-compra/:id',
    loadComponent: () => import('./components/pagar-compra/pagar-compra.component').then(m => m.PagarCompraComponent),
    canActivate: [authGuard]
  },
  // Panel de Secretaria
  {
    path: 'secretaria/dashboard',
    loadComponent: () => import('./components/secretaria-dashboard/secretaria-dashboard.component').then(m => m.SecretariaDashboardComponent),
    canActivate: [secretariaGuard]
  },
  {
    path: 'secretaria/agenda',
    loadComponent: () => import('./components/secretaria-agenda/secretaria-agenda.component').then(m => m.SecretariaAgendaComponent),
    canActivate: [secretariaGuard]
  },
  {
    path: 'secretaria/citas/crear',
    loadComponent: () => import('./components/secretaria-crear-cita/secretaria-crear-cita.component').then(m => m.SecretariaCrearCitaComponent),
    canActivate: [secretariaGuard]
  },
  {
    path: 'secretaria/compras',
    loadComponent: () => import('./components/secretaria-compras/secretaria-compras.component').then(m => m.SecretariaComprasComponent),
    canActivate: [secretariaGuard]
  },
  {
    path: 'secretaria/pagos',
    loadComponent: () => import('./components/secretaria-validar-pagos/secretaria-validar-pagos.component').then(m => m.SecretariaValidarPagosComponent),
    canActivate: [secretariaGuard]
  },
  {
    path: 'secretaria/productos',
    loadComponent: () => import('./components/secretaria-productos/secretaria-productos.component').then(m => m.SecretariaProductosComponent),
    canActivate: [secretariaGuard]
  },
  {
    path: 'secretaria/asistencias',
    loadComponent: () => import('./components/secretaria-asistencias/secretaria-asistencias.component').then(m => m.SecretariaAsistenciasComponent),
    canActivate: [secretariaGuard]
  },

  // Panel de Barbero
  {
    path: 'barbero/dashboard',
    loadComponent: () => import('./components/barbero-dashboard/barbero-dashboard.component').then(m => m.BarberoDashboardComponent),
    canActivate: [barberoGuard]
  },
  {
    path: 'barbero/citas',
    loadComponent: () => import('./components/barbero-citas/barbero-citas.component').then(m => m.BarberoCitasComponent),
    canActivate: [barberoGuard]
  },
  {
    path: 'barbero/servicios',
    loadComponent: () => import('./components/barbero-servicios/barbero-servicios.component').then(m => m.BarberoServiciosComponent),
    canActivate: [barberoGuard]
  },

  // Panel de Administrador
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/notificaciones',
    loadComponent: () => import('./components/admin-notificaciones/admin-notificaciones.component').then(m => m.AdminNotificacionesComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/empleados',
    loadComponent: () => import('./components/admin-empleados/admin-empleados.component').then(m => m.AdminEmpleadosComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/configuracion',
    loadComponent: () => import('./components/admin-config/admin-config.component').then(m => m.AdminConfigComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/reportes',
    loadComponent: () => import('./components/admin-reportes/admin-reportes.component').then(m => m.AdminReportesComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/dias',
    loadComponent: () => import('./components/admin-dias/admin-dias.component').then(m => m.AdminDiasComponent),
    canActivate: [adminGuard]
  },

  // Notificaciones (usuario)
  {
    path: 'notificaciones',
    loadComponent: () => import('./components/notificaciones/notificaciones.component').then(m => m.NotificacionesComponent),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

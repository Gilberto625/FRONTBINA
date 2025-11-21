import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Rutas públicas
  {
    path: '',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
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
    path: 'verify-2fa',
    loadComponent: () => import('./components/verify2fa/verify2fa.component').then(m => m.Verify2faComponent)
  },

  // Rutas de servicios y productos (públicas)
  {
    path: 'servicios',
    loadComponent: () => import('./pages/servicios/servicios.component').then(m => m.ServiciosComponent)
  },
  {
    path: 'productos',
    loadComponent: () => import('./pages/productos/productos.component').then(m => m.ProductosComponent)
  },
  {
    path: 'producto/:id',
    loadComponent: () => import('./pages/producto-detalle/producto-detalle.component').then(m => m.ProductoDetalleComponent)
  },
  {
    path: 'diagnostics',
    loadComponent: () => import('./components/diagnostics/diagnostics.component').then(m => m.DiagnosticsComponent)
  },

  // Rutas protegidas - Cliente
  {
    path: 'cliente',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/cliente/dashboard/dashboard.component').then(m => m.ClienteDashboardComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'agendar',
        loadComponent: () => import('./pages/cliente/agendar/agendar.component').then(m => m.AgendarComponent)
      },
      {
        path: 'mis-citas',
        loadComponent: () => import('./pages/cliente/mis-citas/mis-citas.component').then(m => m.MisCitasComponent)
      },
      {
        path: 'carrito',
        loadComponent: () => import('./pages/cliente/carrito/carrito.component').then(m => m.CarritoComponent)
      },
      {
        path: 'mis-pedidos',
        loadComponent: () => import('./pages/cliente/mis-pedidos/mis-pedidos.component').then(m => m.MisPedidosComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./pages/cliente/configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Rutas protegidas - Barbero
  {
    path: 'barbero',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/barbero/dashboard/dashboard.component').then(m => m.BarberoDashboardComponent)
      },
      {
        path: 'agenda',
        loadComponent: () => import('./pages/barbero/agenda/agenda.component').then(m => m.BarberoAgendaComponent)
      },
      {
        path: 'tiempos-servicio',
        loadComponent: () => import('./pages/barbero/tiempos-servicio/tiempos-servicio.component').then(m => m.TiemposServicioComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Rutas protegidas - Secretaria
  {
    path: 'secretaria',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/secretaria/dashboard/dashboard.component').then(m => m.SecretariaDashboardComponent)
      },
      {
        path: 'agenda',
        loadComponent: () => import('./pages/secretaria/agenda/agenda.component').then(m => m.AgendaComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/secretaria/productos/productos.component').then(m => m.ProductosGestionComponent)
      },
      {
        path: 'ventas',
        loadComponent: () => import('./pages/secretaria/ventas/ventas.component').then(m => m.GestionVentasComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Rutas protegidas - Administrador
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'empleados',
        loadComponent: () => import('./pages/admin/empleados/empleados.component').then(m => m.EmpleadosComponent)
      },
      {
        path: 'servicios',
        loadComponent: () => import('./pages/admin/servicios/servicios.component').then(m => m.GestionServiciosComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./pages/admin/productos/productos.component').then(m => m.AdminProductosComponent)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./pages/admin/reportes/reportes.component').then(m => m.ReportesComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./pages/admin/configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
      },
      {
        path: 'cuentas-bancarias',
        loadComponent: () => import('./pages/admin/cuentas-bancarias/cuentas-bancarias.component').then(m => m.CuentasBancariasComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Rutas de seguridad (protegidas)
  {
    path: 'setup-totp',
    loadComponent: () => import('./components/setup-totp/setup-totp.component').then(m => m.SetupTotpComponent),
    canActivate: [authGuard]
  },
  {
    path: 'backup-codes',
    loadComponent: () => import('./components/backup-codes/backup-codes.component').then(m => m.BackupCodesComponent),
    canActivate: [authGuard]
  },
  {
    path: 'change-password',
    loadComponent: () => import('./components/change-password/change-password.component').then(m => m.ChangePasswordComponent),
    canActivate: [authGuard]
  },
  {
    path: 'security',
    loadComponent: () => import('./components/security-dashboard/security-dashboard.component').then(m => m.SecurityDashboardComponent),
    canActivate: [authGuard]
  },

  // Redirecciones y rutas no encontradas
  { path: '**', redirectTo: '' }
];
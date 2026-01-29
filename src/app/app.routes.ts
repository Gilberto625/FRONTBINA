import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard, clienteGuard, secretariaGuard, barberoGuard, adminGuard } from './guards/role.guard';

export const routes: Routes = [
  // ============================================
  // RUTAS PÚBLICAS
  // ============================================
  {
    path: '',
    loadComponent: () => import('./components/publico/inicio/inicio.component').then(m => m.InicioComponent)
  },
  {
    path: 'servicios',
    loadComponent: () => import('./components/publico/servicios-lista/servicios-lista.component').then(m => m.ServiciosListaComponent)
  },
  {
    path: 'productos',
    loadComponent: () => import('./components/publico/productos-lista/productos-lista.component').then(m => m.ProductosListaComponent)
  },
  
  // ============================================
  // AUTENTICACIÓN
  // ============================================
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
    path: 'forgot-password',
    loadComponent: () => import('./components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },

  // ============================================
  // RUTAS CLIENTE
  // ============================================
  {
    path: 'cliente',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/cliente/dashboard/cliente-dashboard.component').then(m => m.ClienteDashboardComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'agendar',
        loadComponent: () => import('./components/cliente/agendar/agendar-cita.component').then(m => m.AgendarCitaComponent)
      },
      {
        path: 'citas',
        loadComponent: () => import('./components/cliente/mis-citas/mis-citas.component').then(m => m.MisCitasComponent)
      },
      {
        path: 'carrito',
        loadComponent: () => import('./components/cliente/carrito/carrito.component').then(m => m.CarritoComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./components/cliente/carrito/carrito.component').then(m => m.CarritoComponent)
      },
      {
        path: 'apartados',
        loadComponent: () => import('./components/cliente/carrito/carrito.component').then(m => m.CarritoComponent)
      }
    ]
  },

  // ============================================
  // RUTAS SECRETARIA
  // ============================================
  {
    path: 'secretaria',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/secretaria/dashboard/secretaria-dashboard.component').then(m => m.SecretariaDashboardComponent)
      },
      {
        path: 'agenda',
        loadComponent: () => import('./components/secretaria/dashboard/secretaria-dashboard.component').then(m => m.SecretariaDashboardComponent)
      },
      {
        path: 'crear-cita',
        loadComponent: () => import('./components/secretaria/dashboard/secretaria-dashboard.component').then(m => m.SecretariaDashboardComponent)
      },
      {
        path: 'transferencias',
        loadComponent: () => import('./components/secretaria/dashboard/secretaria-dashboard.component').then(m => m.SecretariaDashboardComponent)
      },
      {
        path: 'ventas',
        loadComponent: () => import('./components/secretaria/dashboard/secretaria-dashboard.component').then(m => m.SecretariaDashboardComponent)
      },
      {
        path: 'catalogo',
        loadComponent: () => import('./components/secretaria/dashboard/secretaria-dashboard.component').then(m => m.SecretariaDashboardComponent)
      },
      {
        path: 'inventario',
        loadComponent: () => import('./components/secretaria/dashboard/secretaria-dashboard.component').then(m => m.SecretariaDashboardComponent)
      },
      {
        path: 'pedidos',
        loadComponent: () => import('./components/secretaria/dashboard/secretaria-dashboard.component').then(m => m.SecretariaDashboardComponent)
      },
      {
        path: 'entregas',
        loadComponent: () => import('./components/secretaria/dashboard/secretaria-dashboard.component').then(m => m.SecretariaDashboardComponent)
      }
    ]
  },

  // ============================================
  // RUTAS BARBERO
  // ============================================
  {
    path: 'barbero',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/barbero/dashboard/barbero-dashboard.component').then(m => m.BarberoDashboardComponent)
      },
      {
        path: 'agenda',
        loadComponent: () => import('./components/barbero/dashboard/barbero-dashboard.component').then(m => m.BarberoDashboardComponent)
      },
      {
        path: 'tiempos',
        loadComponent: () => import('./components/barbero/dashboard/barbero-dashboard.component').then(m => m.BarberoDashboardComponent)
      },
      {
        path: 'notificaciones',
        loadComponent: () => import('./components/barbero/dashboard/barbero-dashboard.component').then(m => m.BarberoDashboardComponent)
      }
    ]
  },

  // ============================================
  // RUTAS ADMIN
  // ============================================
  {
    path: 'admin',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./components/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'empleados',
        loadComponent: () => import('./components/admin/empleados/empleados-lista.component').then(m => m.EmpleadosListaComponent)
      },
      {
        path: 'servicios',
        loadComponent: () => import('./components/admin/servicios/servicios-lista.component').then(m => m.ServiciosListaComponent)
      },
      {
        path: 'productos',
        loadComponent: () => import('./components/admin/productos/productos-lista.component').then(m => m.ProductosListaComponent)
      },
      {
        path: 'inventario',
        loadComponent: () => import('./components/admin/inventario/inventario.component').then(m => m.InventarioComponent)
      },
      {
        path: 'reportes',
        loadComponent: () => import('./components/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./components/admin/configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
      },
      {
        path: 'promociones',
        loadComponent: () => import('./components/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      }
    ]
  },

  // ============================================
  // RUTAS DE SEGURIDAD (existentes)
  // ============================================
  {
    path: 'home',
    loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    canActivate: [authGuard]
  },
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
    path: 'security',
    loadComponent: () => import('./components/security-dashboard/security-dashboard.component').then(m => m.SecurityDashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'change-password',
    loadComponent: () => import('./components/change-password/change-password.component').then(m => m.ChangePasswordComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },

  // ============================================
  // PÁGINAS DE ERROR
  // ============================================
  {
    path: '404',
    loadComponent: () => import('./components/errors/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '400',
    loadComponent: () => import('./components/errors/bad-request/bad-request.component').then(m => m.BadRequestComponent)
  },
  {
    path: '500',
    loadComponent: () => import('./components/errors/server-error/server-error.component').then(m => m.ServerErrorComponent)
  },

  // ============================================
  // REDIRECCIÓN POR DEFECTO (404)
  // ============================================
  {
    path: '**',
    loadComponent: () => import('./components/errors/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];

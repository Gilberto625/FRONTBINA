import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si está autenticado
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Obtener los roles requeridos de la ruta
  const requiredRoles = route.data?.['roles'] as string[];
  
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No se requieren roles específicos
  }

  // Verificar si el usuario tiene alguno de los roles requeridos
  const userRole = authService.getUserRole();
  
  if (requiredRoles.includes(userRole)) {
    return true;
  }

  // Si no tiene el rol requerido, redirigir según el rol actual
  switch (userRole) {
    case 'cliente':
      router.navigate(['/cliente/dashboard']);
      break;
    case 'secretaria':
      router.navigate(['/secretaria/dashboard']);
      break;
    case 'barbero':
      router.navigate(['/barbero/dashboard']);
      break;
    case 'administrador':
      router.navigate(['/admin/dashboard']);
      break;
    default:
      router.navigate(['/']);
      break;
  }
  
  return false;
};

// Guard específico para administradores
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.isAdministrador()) {
    return true;
  }

  // Redirigir al dashboard correspondiente
  const userRole = authService.getUserRole();
  router.navigate([`/${userRole}/dashboard`]);
  return false;
};

// Guard específico para secretarias
export const secretariaGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.isSecretaria() || authService.isAdministrador()) {
    return true;
  }

  const userRole = authService.getUserRole();
  router.navigate([`/${userRole}/dashboard`]);
  return false;
};

// Guard específico para barberos
export const barberoGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.isBarbero() || authService.isAdministrador()) {
    return true;
  }

  const userRole = authService.getUserRole();
  router.navigate([`/${userRole}/dashboard`]);
  return false;
};

// Guard específico para clientes
export const clienteGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.isCliente()) {
    return true;
  }

  const userRole = authService.getUserRole();
  router.navigate([`/${userRole}/dashboard`]);
  return false;
};

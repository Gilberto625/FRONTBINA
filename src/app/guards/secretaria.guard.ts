import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const secretariaGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  if (user && (user.rol === 'secretaria' || user.rol === 'administrador')) {
    return true;
  }

  // Si no es secretaria o admin, redirigir al home
  router.navigate(['/home']);
  return false;
};

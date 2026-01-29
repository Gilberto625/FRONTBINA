import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const barberoGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  const user = authService.getCurrentUser();
  if (user && (user.rol === 'barbero' || user.rol === 'administrador')) {
    return true;
  }

  router.navigate(['/home']);
  return false;
};


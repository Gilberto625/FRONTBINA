import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { RolUsuario } from '../models';

// Guard genérico para verificar roles
export const roleGuard = (rolesPermitidos: RolUsuario[]): CanActivateFn => {
  return (route, state) => {
    const router = inject(Router);
    
    // En producción, esto vendría del AuthService
    const usuarioActual = localStorage.getItem('userRole') as RolUsuario | null;
    
    if (!usuarioActual) {
      router.navigate(['/login']);
      return false;
    }
    
    if (rolesPermitidos.includes(usuarioActual)) {
      return true;
    }
    
    // Redirigir según el rol
    const rutasDefault: Record<RolUsuario, string> = {
      'cliente': '/cliente',
      'secretaria': '/secretaria',
      'barbero': '/barbero',
      'admin': '/admin'
    };
    
    router.navigate([rutasDefault[usuarioActual] || '/']);
    return false;
  };
};

// Guards específicos por rol
export const clienteGuard: CanActivateFn = roleGuard(['cliente']);
export const secretariaGuard: CanActivateFn = roleGuard(['secretaria', 'admin']);
export const barberoGuard: CanActivateFn = roleGuard(['barbero', 'admin']);
export const adminGuard: CanActivateFn = roleGuard(['admin']);

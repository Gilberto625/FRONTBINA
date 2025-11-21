import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const modalService = inject(ModalService);

  // Obtener el token de acceso
  const token = authService.getToken();
  
  // Clonar la request y agregar el token si existe
  let authReq = req;
  if (token && !req.url.includes('/auth/')) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Agregar headers comunes
  authReq = authReq.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Manejar errores de autenticación
      if (error.status === 401) {
        // Token expirado o inválido
        authService.logout();
        router.navigate(['/login']);
        modalService.showError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      } else if (error.status === 403) {
        // Sin permisos
        modalService.showError('No tienes permisos para realizar esta acción.');
      } else if (error.status === 404) {
        // Recurso no encontrado
        modalService.showError('El recurso solicitado no fue encontrado.');
      } else if (error.status === 500) {
        // Error del servidor
        modalService.showError('Error interno del servidor. Por favor, intenta más tarde.');
      } else if (error.status === 0) {
        // Sin conexión
        modalService.showError('No se pudo conectar al servidor. Verifica tu conexión a internet.');
      } else {
        // Otros errores
        const message = error.error?.message || error.error?.detail || 'Ha ocurrido un error inesperado.';
        modalService.showError(message);
      }

      return throwError(() => error);
    })
  );
};


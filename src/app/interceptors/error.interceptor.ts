import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo redirigir para errores específicos y si no es una ruta de API
      if (error.status === 400 && !req.url.includes('/api/')) {
        router.navigate(['/400']);
      } else if (error.status === 404 && !req.url.includes('/api/')) {
        router.navigate(['/404']);
      } else if (error.status === 500 && !req.url.includes('/api/')) {
        router.navigate(['/500']);
      }
      
      // Para errores de API, dejar que los componentes los manejen
      return throwError(() => error);
    })
  );
};

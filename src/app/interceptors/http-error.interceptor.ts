import { Injectable } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ModalService } from '../services/modal.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  constructor(private modal: ModalService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Permitir que una llamada maneje sus errores sin modal global
    if (req.headers.get('X-Skip-Global-Error') === 'true') {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error: any) => {
        // Evitar spam: si el componente ya maneja error, que use header X-Skip-Global-Error
        if (error instanceof HttpErrorResponse) {
          const status = error.status;
          const msg =
            error.error?.mensaje ||
            error.error?.error ||
            error.message ||
            'Ocurrió un error inesperado.';

          // 401/403 normalmente se manejan con authGuard/permisos
          if (status !== 401 && status !== 403) {
            this.modal.showError(`Error ${status || ''}`, msg);
          }
        } else {
          this.modal.showError('Error', 'Ocurrió un error inesperado.');
        }

        return throwError(() => error);
      })
    );
  }
}


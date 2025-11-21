import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { ModalService } from '../services/modal.service';

export const loadingInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const modalService = inject(ModalService);

  // Solo mostrar loading para requests que no sean de autenticación o muy rápidas
  const showLoading = !req.url.includes('/auth/login') && 
                     !req.url.includes('/auth/refresh') &&
                     !req.url.includes('/ping') &&
                     req.method !== 'GET' || 
                     req.url.includes('/reportes/') ||
                     req.url.includes('/exportar/');

  if (showLoading) {
    modalService.showLoading();
  }

  return next(req).pipe(
    finalize(() => {
      if (showLoading) {
        modalService.hideLoading();
      }
    })
  );
};


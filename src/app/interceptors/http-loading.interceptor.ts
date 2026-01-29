import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class HttpLoadingInterceptor implements HttpInterceptor {
  constructor(private loading: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Permitir que ciertas requests no disparen loader global
    if (req.headers.get('X-Skip-Global-Loading') === 'true') {
      return next.handle(req);
    }

    this.loading.show();
    return next.handle(req).pipe(finalize(() => this.loading.hide()));
  }
}


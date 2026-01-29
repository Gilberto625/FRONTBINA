import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export type MetodoPago = 'efectivo' | 'tarjeta' | 'transferencia' | 'mercado_pago';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private apiUrl = environment.apiUrl + '/pagos';
  private csrfToken: string = '';

  constructor(private http: HttpClient) {
    this.obtenerCsrfToken();
  }

  private async obtenerCsrfToken(): Promise<void> {
    try {
      const response: any = await firstValueFrom(
        this.http.get(environment.apiUrl + '/usuarios/csrf/')
      );
      this.csrfToken = response.csrf_token || '';
    } catch (error) {
      console.error('Error al obtener CSRF token:', error);
    }
  }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': this.csrfToken
    });
  }

  crearPagoCompra(datos: {
    compra_id: number;
    monto: number;
    metodo_pago: MetodoPago;
    id_operacion?: string;
    notas?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear/`, datos, { headers: this.getHeaders() });
  }

  historial(): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial/`);
  }

  detalle(pagoId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${pagoId}/`);
  }
}


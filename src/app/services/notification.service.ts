import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl + '/notificaciones';
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

  // Usuario
  misNotificaciones(filtros?: { canal?: string; estado?: string }): Observable<any> {
    let url = `${this.apiUrl}/mis-notificaciones/`;
    const params: string[] = [];
    if (filtros?.canal) params.push(`canal=${encodeURIComponent(filtros.canal)}`);
    if (filtros?.estado) params.push(`estado=${encodeURIComponent(filtros.estado)}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url);
  }

  // Admin/secretaria
  historial(filtros?: { canal?: string; estado?: string; tipo_evento?: string; usuario_id?: number }): Observable<any> {
    let url = `${this.apiUrl}/historial/`;
    const params: string[] = [];
    if (filtros?.canal) params.push(`canal=${encodeURIComponent(filtros.canal)}`);
    if (filtros?.estado) params.push(`estado=${encodeURIComponent(filtros.estado)}`);
    if (filtros?.tipo_evento) params.push(`tipo_evento=${encodeURIComponent(filtros.tipo_evento)}`);
    if (filtros?.usuario_id) params.push(`usuario_id=${filtros.usuario_id}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url);
  }

  enviar(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/enviar/`, datos, { headers: this.getHeaders() });
  }

  procesarProgramadas(): Observable<any> {
    return this.http.post(`${this.apiUrl}/procesar-programadas/`, {}, { headers: this.getHeaders() });
  }
}


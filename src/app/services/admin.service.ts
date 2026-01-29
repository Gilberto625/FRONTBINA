import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;
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

  // Métricas
  metricas(filtros?: { fecha_inicio?: string; fecha_fin?: string }): Observable<any> {
    let url = `${this.apiUrl}/admin/metricas/`;
    const params: string[] = [];
    if (filtros?.fecha_inicio) params.push(`fecha_inicio=${encodeURIComponent(filtros.fecha_inicio)}`);
    if (filtros?.fecha_fin) params.push(`fecha_fin=${encodeURIComponent(filtros.fecha_fin)}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url);
  }

  // Reportes
  reportes(filtros?: { fecha_inicio?: string; fecha_fin?: string }): Observable<any> {
    let url = `${this.apiUrl}/admin/reportes/`;
    const params: string[] = [];
    if (filtros?.fecha_inicio) params.push(`fecha_inicio=${encodeURIComponent(filtros.fecha_inicio)}`);
    if (filtros?.fecha_fin) params.push(`fecha_fin=${encodeURIComponent(filtros.fecha_fin)}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url);
  }

  // Días por demanda
  clasificarDia(datos: { dia_semana: number; demanda: 'alta' | 'media' | 'baja'; configuracion?: any }): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/dias/clasificar/`, datos, { headers: this.getHeaders() });
  }

  // Empleados
  listarEmpleados(filtros?: { rol?: string }): Observable<any> {
    let url = `${this.apiUrl}/admin/empleados/`;
    if (filtros?.rol) url += `?rol=${encodeURIComponent(filtros.rol)}`;
    return this.http.get(url);
  }

  crearEmpleado(datos: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/empleados/crear/`, datos, { headers: this.getHeaders() });
  }

  actualizarEmpleado(empleadoId: number, datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/empleados/${empleadoId}/`, datos, { headers: this.getHeaders() });
  }

  // Configuración del sistema
  obtenerConfiguracion(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/configuracion/`);
  }

  actualizarConfiguracion(datos: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/configuracion/actualizar/`, datos, { headers: this.getHeaders() });
  }
}


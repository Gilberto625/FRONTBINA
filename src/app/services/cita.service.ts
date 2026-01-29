import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  duracion_minutos: number;
  categoria: string;
  categoria_display: string;
}

export interface Barbero {
  id: number;
  usuario_id: number;
  nombre: string;
  email: string;
  especialidades: string;
  fecha_contratacion?: string;
}

export interface Silla {
  id: number;
  numero: number;
  nombre: string;
  activa: boolean;
}

export interface Cita {
  id: number;
  fecha_hora: string;
  servicio: Servicio | number;
  barbero: Barbero | number;
  silla: Silla | number | null;
  estado: string;
  precio_total: number;
  anticipo_pagado: number;
  anticipo_requerido: number;
  duracion_minutos: number;
  notas?: string;
  puede_cancelar?: boolean;
}

export interface Disponibilidad {
  fecha: string;
  horarios: string[];
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  private apiUrl = environment.apiUrl + '/citas';
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

  // Obtener servicios disponibles
  obtenerServicios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/servicios/`);
  }

  // Obtener barberos disponibles
  obtenerBarberos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/barberos/`);
  }

  // Obtener sillas disponibles
  obtenerSillasDisponibles(fecha?: string, servicioId?: number): Observable<any> {
    let url = `${this.apiUrl}/sillas-disponibles/`;
    const params: string[] = [];
    
    if (fecha) params.push(`fecha=${fecha}`);
    if (servicioId) params.push(`servicio_id=${servicioId}`);
    
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    
    return this.http.get(url);
  }

  // Consultar disponibilidad de barbero
  consultarDisponibilidad(barberoId: number, fecha: string, servicioId?: number, sillaId?: number): Observable<any> {
    let url = `${this.apiUrl}/disponibilidad/?fecha=${fecha}&barbero_id=${barberoId}`;
    
    if (servicioId) url += `&servicio_id=${servicioId}`;
    if (sillaId) url += `&silla_id=${sillaId}`;
    
    return this.http.get(url);
  }

  // Agendar cita
  agendarCita(servicioId: number, barberoId: number, sillaId: number, fechaHora: string): Observable<any> {
    const data = {
      servicio_id: servicioId,
      barbero_id: barberoId,
      silla_id: sillaId,
      fecha_hora: fechaHora
    };

    return this.http.post(`${this.apiUrl}/crear/`, data, { headers: this.getHeaders() });
  }

  // Obtener mis citas
  obtenerMisCitas(estado?: string): Observable<any> {
    let url = `${this.apiUrl}/mis-citas/`;
    if (estado) {
      url += `?estado=${estado}`;
    }
    return this.http.get(url);
  }

  // Obtener detalle de cita
  obtenerDetalleCita(citaId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${citaId}/`);
  }

  // Cancelar cita
  cancelarCita(citaId: number, motivo?: string): Observable<any> {
    const data: any = {};
    if (motivo) {
      data.motivo = motivo;
    }
    return this.http.put(`${this.apiUrl}/${citaId}/cancelar/`, data, { headers: this.getHeaders() });
  }

  // Obtener horarios disponibles para una fecha
  obtenerHorariosDisponibles(barberoId: number, fecha: string, servicioId?: number): Observable<any> {
    return this.consultarDisponibilidad(barberoId, fecha, servicioId);
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_minutos: number;
  imagen_servicio?: string;
  activo: boolean;
  categoria?: string;
}

export interface Barbero {
  id: number;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    foto_perfil?: string;
  };
  especialidades: string[];
  horario_inicio: string;
  horario_fin: string;
  dias_trabajo: string[];
  activo: boolean;
}

export interface Cita {
  id: number;
  cliente: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
  servicio: Servicio;
  barbero: Barbero;
  fecha_cita: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';
  notas?: string;
  precio_total: number;
  anticipo_requerido: boolean;
  anticipo_pagado: boolean;
  monto_anticipo?: number;
  created_at: string;
  updated_at: string;
}

export interface HorarioDisponible {
  fecha: string;
  horarios: {
    hora: string;
    disponible: boolean;
    barbero_id: number;
  }[];
}

export interface CitaRequest {
  servicio_id: number;
  barbero_id: number;
  fecha_cita: string;
  hora_inicio: string;
  notas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CitasService {

  constructor(private api: ApiService) {}

  /**
   * Obtener todos los servicios disponibles
   */
  getServicios(): Observable<Servicio[]> {
    return this.api.get<Servicio[]>('/citas/servicios/');
  }

  /**
   * Obtener servicio por ID
   */
  getServicio(id: number): Observable<Servicio> {
    return this.api.get<Servicio>(`/citas/servicios/${id}/`);
  }

  /**
   * Obtener todos los barberos disponibles
   */
  getBarberos(): Observable<Barbero[]> {
    return this.api.get<Barbero[]>('/empleados/barberos/');
  }

  /**
   * Obtener barbero por ID
   */
  getBarbero(id: number): Observable<Barbero> {
    return this.api.get<Barbero>(`/empleados/barberos/${id}/`);
  }

  /**
   * Obtener barberos disponibles para un servicio específico
   */
  getBarberosParaServicio(servicioId: number): Observable<Barbero[]> {
    return this.api.get<Barbero[]>(`/citas/servicios/${servicioId}/barberos/`);
  }

  /**
   * Obtener horarios disponibles para un barbero en una fecha específica
   */
  getHorariosDisponibles(barberoId: number, fecha: string): Observable<HorarioDisponible> {
    return this.api.get<HorarioDisponible>(`/citas/horarios-disponibles/`, {
      barbero_id: barberoId,
      fecha: fecha
    });
  }

  /**
   * Crear una nueva cita
   */
  crearCita(citaData: CitaRequest): Observable<Cita> {
    return this.api.post<Cita>('/citas/crear/', citaData);
  }

  /**
   * Obtener citas del usuario autenticado
   */
  getMisCitas(): Observable<Cita[]> {
    return this.api.get<Cita[]>('/citas/mis-citas/');
  }

  /**
   * Obtener cita por ID
   */
  getCita(id: number): Observable<Cita> {
    return this.api.get<Cita>(`/citas/${id}/`);
  }

  /**
   * Cancelar una cita
   */
  cancelarCita(id: number, motivo?: string): Observable<any> {
    return this.api.post(`/citas/${id}/cancelar/`, { motivo });
  }

  /**
   * Reprogramar una cita
   */
  reprogramarCita(id: number, nuevaFecha: string, nuevaHora: string): Observable<Cita> {
    return this.api.patch<Cita>(`/citas/${id}/reprogramar/`, {
      fecha_cita: nuevaFecha,
      hora_inicio: nuevaHora
    });
  }

  /**
   * Confirmar asistencia a una cita
   */
  confirmarAsistencia(id: number): Observable<any> {
    return this.api.post(`/citas/${id}/confirmar-asistencia/`, {});
  }

  /**
   * Obtener historial de citas
   */
  getHistorialCitas(page: number = 1, pageSize: number = 10): Observable<any> {
    return this.api.get('/citas/historial/', {
      page,
      page_size: pageSize
    });
  }

  /**
   * Calificar una cita completada
   */
  calificarCita(id: number, calificacion: number, comentario?: string): Observable<any> {
    return this.api.post(`/citas/${id}/calificar/`, {
      calificacion,
      comentario
    });
  }

  /**
   * Obtener próximas citas
   */
  getProximasCitas(): Observable<Cita[]> {
    return this.api.get<Cita[]>('/citas/proximas/');
  }

  /**
   * Verificar disponibilidad para una fecha y hora específica
   */
  verificarDisponibilidad(barberoId: number, fecha: string, hora: string, servicioId: number): Observable<{disponible: boolean, mensaje?: string}> {
    return this.api.get('/citas/verificar-disponibilidad/', {
      barbero_id: barberoId,
      fecha: fecha,
      hora: hora,
      servicio_id: servicioId
    });
  }

  /**
   * Obtener estadísticas de citas (para barberos/admin)
   */
  getEstadisticasCitas(fechaInicio?: string, fechaFin?: string): Observable<any> {
    const params: any = {};
    if (fechaInicio) params.fecha_inicio = fechaInicio;
    if (fechaFin) params.fecha_fin = fechaFin;
    
    return this.api.get('/citas/estadisticas/', params);
  }

  /**
   * Obtener agenda del barbero (para barberos)
   */
  getAgendaBarbero(fecha?: string): Observable<Cita[]> {
    const params: any = {};
    if (fecha) params.fecha = fecha;
    
    return this.api.get<Cita[]>('/citas/mi-agenda/', params);
  }

  /**
   * Actualizar estado de una cita (para barberos/secretaria)
   */
  actualizarEstadoCita(id: number, estado: string, notas?: string): Observable<Cita> {
    return this.api.patch<Cita>(`/citas/${id}/estado/`, {
      estado,
      notas
    });
  }

  /**
   * Obtener citas pendientes de confirmación (para secretaria/admin)
   */
  getCitasPendientes(): Observable<Cita[]> {
    return this.api.get<Cita[]>('/citas/pendientes/');
  }

  /**
   * Procesar pago de anticipo
   */
  procesarAnticipo(citaId: number, metodoPago: string, datosPago: any): Observable<any> {
    return this.api.post(`/citas/${citaId}/procesar-anticipo/`, {
      metodo_pago: metodoPago,
      datos_pago: datosPago
    });
  }
}


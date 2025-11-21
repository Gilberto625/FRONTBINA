import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

interface Empleado {
  id?: number;
  usuario: {
    id?: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
  };
  telefono: string;
  direccion: string;
  fecha_contratacion: string;
  salario: number;
  rol: string;
  activo: boolean;
  especialidades?: string[];
  horario_trabajo?: any;
  estadisticas?: any;
}

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
}

interface EstadisticasEmpleados {
  total_empleados: number;
  empleados_activos: number;
  barberos: number;
  secretarias: number;
  nomina_mensual: number;
}

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {

  constructor(private api: ApiService) { }

  // Obtener empleados con filtros y paginación
  getEmpleados(params?: {
    page?: number;
    page_size?: number;
    buscar?: string;
    rol?: string;
    activo?: boolean;
  }): Observable<{results: Empleado[], count: number, next?: string, previous?: string}> {
    return this.api.get('/empleados/', params);
  }

  // Obtener un empleado específico
  getEmpleado(id: number): Observable<Empleado> {
    return this.api.get<Empleado>(`/empleados/${id}/`);
  }

  // Crear nuevo empleado
  crearEmpleado(empleado: Partial<Empleado>): Observable<Empleado> {
    return this.api.post<Empleado>('/empleados/', empleado);
  }

  // Actualizar empleado
  actualizarEmpleado(id: number, empleado: Partial<Empleado>): Observable<Empleado> {
    return this.api.put<Empleado>(`/empleados/${id}/`, empleado);
  }

  // Eliminar empleado
  eliminarEmpleado(id: number): Observable<void> {
    return this.api.delete<void>(`/empleados/${id}/`);
  }

  // Cambiar estado del empleado (activo/inactivo)
  toggleEstadoEmpleado(id: number, activo: boolean): Observable<Empleado> {
    return this.api.patch<Empleado>(`/empleados/${id}/`, { activo });
  }

  // Obtener roles disponibles
  getRoles(): Observable<Rol[]> {
    return this.api.get<Rol[]>('/empleados/roles/');
  }

  // Asignar rol a empleado
  asignarRol(empleadoId: number, rolId: string): Observable<void> {
    return this.api.post<void>(`/empleados/${empleadoId}/asignar-rol/`, { rol: rolId });
  }

  // Obtener estadísticas de empleados
  getEstadisticasEmpleados(): Observable<EstadisticasEmpleados> {
    return this.api.get<EstadisticasEmpleados>('/empleados/estadisticas/');
  }

  // Resetear contraseña de empleado
  resetearPassword(usuarioId: number): Observable<{message: string}> {
    return this.api.post<{message: string}>(`/empleados/resetear-password/${usuarioId}/`, {});
  }

  // Obtener horarios de trabajo
  getHorariosTrabajo(empleadoId: number): Observable<any> {
    return this.api.get(`/empleados/${empleadoId}/horarios/`);
  }

  // Actualizar horarios de trabajo
  actualizarHorariosTrabajo(empleadoId: number, horarios: any): Observable<any> {
    return this.api.put(`/empleados/${empleadoId}/horarios/`, horarios);
  }

  // Obtener especialidades disponibles
  getEspecialidades(): Observable<string[]> {
    return this.api.get<string[]>('/empleados/especialidades/');
  }

  // Obtener rendimiento de empleado
  getRendimientoEmpleado(empleadoId: number, periodo?: string): Observable<any> {
    const params = periodo ? { periodo } : {};
    return this.api.get(`/empleados/${empleadoId}/rendimiento/`, params);
  }

  // Exportar lista de empleados
  exportarEmpleados(formato: 'excel' | 'pdf' = 'excel'): Observable<Blob> {
    return this.api.getBlob(`/empleados/exportar/?formato=${formato}`);
  }

  // Importar empleados desde archivo
  importarEmpleados(archivo: File): Observable<{exitosos: number, errores: any[]}> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.api.post<{exitosos: number, errores: any[]}>('/empleados/importar/', formData);
  }

  // Obtener historial de cambios de un empleado
  getHistorialCambios(empleadoId: number): Observable<any[]> {
    return this.api.get<any[]>(`/empleados/${empleadoId}/historial/`);
  }

  // Generar reporte de nómina
  generarReporteNomina(mes: number, año: number): Observable<Blob> {
    return this.api.getBlob(`/empleados/nomina/?mes=${mes}&año=${año}`);
  }

  // Obtener empleados por rol
  getEmpleadosPorRol(rol: string): Observable<Empleado[]> {
    return this.api.get<Empleado[]>(`/empleados/?rol=${rol}`);
  }

  // Obtener barberos disponibles
  getBarberosDisponibles(fecha?: string, hora?: string): Observable<Empleado[]> {
    const params: any = {};
    if (fecha) params.fecha = fecha;
    if (hora) params.hora = hora;
    return this.api.get<Empleado[]>('/empleados/barberos-disponibles/', params);
  }

  // Obtener estadísticas de rendimiento por empleado
  getEstadisticasRendimiento(empleadoId: number, fechaInicio: string, fechaFin: string): Observable<any> {
    return this.api.get(`/empleados/${empleadoId}/estadisticas-rendimiento/`, {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
  }
}


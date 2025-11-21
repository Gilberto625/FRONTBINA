import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

interface FiltroReporte {
  fecha_inicio: string;
  fecha_fin: string;
  tipo_reporte: string;
  formato: 'excel' | 'pdf';
  incluir_graficos: boolean;
  barbero_id?: number;
  servicio_id?: number;
  categoria_id?: number;
}

interface ReporteHistorial {
  id: number;
  nombre: string;
  tipo: string;
  formato: string;
  fecha_creacion: string;
  tamaño: number;
  nombre_archivo: string;
  parametros: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  constructor(private api: ApiService) { }

  // Generar reporte
  generarReporte(filtros: FiltroReporte): Observable<Blob> {
    return this.api.postBlob('/reportes/generar/', filtros);
  }

  // Obtener historial de reportes
  getHistorialReportes(): Observable<ReporteHistorial[]> {
    return this.api.get<ReporteHistorial[]>('/reportes/historial/');
  }

  // Descargar reporte del historial
  descargarReporte(reporteId: number): Observable<Blob> {
    return this.api.getBlob(`/reportes/${reporteId}/descargar/`);
  }

  // Eliminar reporte del historial
  eliminarReporte(reporteId: number): Observable<void> {
    return this.api.delete<void>(`/reportes/${reporteId}/`);
  }

  // Enviar reporte por email
  enviarReportePorEmail(filtros: FiltroReporte, emails?: string[]): Observable<{message: string}> {
    const payload = { ...filtros, emails };
    return this.api.post<{message: string}>('/reportes/enviar-email/', payload);
  }

  // Programar reporte automático
  programarReporte(configuracion: any): Observable<any> {
    return this.api.post('/reportes/programar/', configuracion);
  }

  // Obtener reportes programados
  getReportesProgramados(): Observable<any[]> {
    return this.api.get<any[]>('/reportes/programados/');
  }

  // Cancelar reporte programado
  cancelarReporteProgramado(id: number): Observable<void> {
    return this.api.delete<void>(`/reportes/programados/${id}/`);
  }

  // Obtener barberos para filtros
  getBarberos(): Observable<any[]> {
    return this.api.get<any[]>('/empleados/?rol=barbero');
  }

  // Obtener servicios para filtros
  getServicios(): Observable<any[]> {
    return this.api.get<any[]>('/servicios/');
  }

  // Obtener categorías para filtros
  getCategorias(): Observable<any[]> {
    return this.api.get<any[]>('/productos/categorias/');
  }

  // Reportes específicos
  
  // Reporte de ventas
  getReporteVentas(filtros: any): Observable<Blob> {
    return this.api.postBlob('/reportes/ventas/', filtros);
  }

  // Reporte de citas
  getReporteCitas(filtros: any): Observable<Blob> {
    return this.api.postBlob('/reportes/citas/', filtros);
  }

  // Reporte de productos
  getReporteProductos(filtros: any): Observable<Blob> {
    return this.api.postBlob('/reportes/productos/', filtros);
  }

  // Reporte de empleados
  getReporteEmpleados(filtros: any): Observable<Blob> {
    return this.api.postBlob('/reportes/empleados/', filtros);
  }

  // Reporte de clientes
  getReporteClientes(filtros: any): Observable<Blob> {
    return this.api.postBlob('/reportes/clientes/', filtros);
  }

  // Reporte financiero
  getReporteFinanciero(filtros: any): Observable<Blob> {
    return this.api.postBlob('/reportes/financiero/', filtros);
  }

  // Análisis de demanda
  getAnalisisDemanda(filtros: any): Observable<Blob> {
    return this.api.postBlob('/reportes/demanda/', filtros);
  }

  // Reporte personalizado
  getReportePersonalizado(configuracion: any): Observable<Blob> {
    return this.api.postBlob('/reportes/personalizado/', configuracion);
  }

  // Métricas en tiempo real para dashboard
  getMetricasVentas(periodo: string = 'mes'): Observable<any> {
    return this.api.get(`/reportes/metricas/ventas/?periodo=${periodo}`);
  }

  getMetricasCitas(periodo: string = 'mes'): Observable<any> {
    return this.api.get(`/reportes/metricas/citas/?periodo=${periodo}`);
  }

  getMetricasClientes(periodo: string = 'mes'): Observable<any> {
    return this.api.get(`/reportes/metricas/clientes/?periodo=${periodo}`);
  }

  getMetricasEmpleados(periodo: string = 'mes'): Observable<any> {
    return this.api.get(`/reportes/metricas/empleados/?periodo=${periodo}`);
  }

  // Comparativas
  getComparativaVentas(periodoActual: string, periodoAnterior: string): Observable<any> {
    return this.api.get('/reportes/comparativa/ventas/', {
      periodo_actual: periodoActual,
      periodo_anterior: periodoAnterior
    });
  }

  getComparativaCitas(periodoActual: string, periodoAnterior: string): Observable<any> {
    return this.api.get('/reportes/comparativa/citas/', {
      periodo_actual: periodoActual,
      periodo_anterior: periodoAnterior
    });
  }

  // Predicciones y análisis avanzado
  getPrediccionVentas(meses: number = 3): Observable<any> {
    return this.api.get(`/reportes/prediccion/ventas/?meses=${meses}`);
  }

  getAnalisisRentabilidad(periodo: string): Observable<any> {
    return this.api.get(`/reportes/analisis/rentabilidad/?periodo=${periodo}`);
  }

  getAnalisisClientes(tipo: 'frecuencia' | 'valor' | 'segmentacion'): Observable<any> {
    return this.api.get(`/reportes/analisis/clientes/?tipo=${tipo}`);
  }

  // Exportaciones masivas
  exportarDatosCompletos(formato: 'excel' | 'csv'): Observable<Blob> {
    return this.api.getBlob(`/reportes/exportar/completo/?formato=${formato}`);
  }

  exportarBackup(): Observable<Blob> {
    return this.api.getBlob('/reportes/backup/');
  }

  // Configuración de reportes
  getConfiguracionReportes(): Observable<any> {
    return this.api.get('/reportes/configuracion/');
  }

  actualizarConfiguracionReportes(configuracion: any): Observable<any> {
    return this.api.put('/reportes/configuracion/', configuracion);
  }

  // Templates de reportes
  getTemplatesReportes(): Observable<any[]> {
    return this.api.get<any[]>('/reportes/templates/');
  }

  crearTemplateReporte(template: any): Observable<any> {
    return this.api.post('/reportes/templates/', template);
  }

  actualizarTemplateReporte(id: number, template: any): Observable<any> {
    return this.api.put(`/reportes/templates/${id}/`, template);
  }

  eliminarTemplateReporte(id: number): Observable<void> {
    return this.api.delete<void>(`/reportes/templates/${id}/`);
  }
}


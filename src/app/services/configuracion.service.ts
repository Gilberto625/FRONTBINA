import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {

  constructor(private api: ApiService) { }

  // Configuración General
  getConfiguracionGeneral(): Observable<any> {
    return this.api.get('/configuracion/general/');
  }

  actualizarConfiguracionGeneral(configuracion: any): Observable<any> {
    return this.api.put('/configuracion/general/', configuracion);
  }

  // Configuración de Citas
  getConfiguracionCitas(): Observable<any> {
    return this.api.get('/configuracion/citas/');
  }

  actualizarConfiguracionCitas(configuracion: any): Observable<any> {
    return this.api.put('/configuracion/citas/', configuracion);
  }

  // Configuración de Pagos
  getConfiguracionPagos(): Observable<any> {
    return this.api.get('/configuracion/pagos/');
  }

  actualizarConfiguracionPagos(configuracion: any): Observable<any> {
    return this.api.put('/configuracion/pagos/', configuracion);
  }

  // Configuración de Notificaciones
  getConfiguracionNotificaciones(): Observable<any> {
    return this.api.get('/configuracion/notificaciones/');
  }

  actualizarConfiguracionNotificaciones(configuracion: any): Observable<any> {
    return this.api.put('/configuracion/notificaciones/', configuracion);
  }

  // Resetear configuración
  resetearConfiguracion(tipo: string): Observable<any> {
    return this.api.post(`/configuracion/resetear/${tipo}/`, {});
  }

  // Exportar configuración
  exportarConfiguracion(): Observable<Blob> {
    return this.api.getBlob('/configuracion/exportar/');
  }

  // Importar configuración
  importarConfiguracion(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('archivo', archivo);
    return this.api.post('/configuracion/importar/', formData);
  }

  // Probar notificaciones
  probarNotificacion(tipo: string): Observable<any> {
    return this.api.post(`/configuracion/probar-notificacion/${tipo}/`, {});
  }

  // Obtener todas las configuraciones
  getTodasConfiguraciones(): Observable<any> {
    return this.api.get('/configuracion/todas/');
  }

  // Backup de configuración
  crearBackupConfiguracion(): Observable<Blob> {
    return this.api.getBlob('/configuracion/backup/');
  }

  // Restaurar desde backup
  restaurarBackup(archivo: File): Observable<any> {
    const formData = new FormData();
    formData.append('backup', archivo);
    return this.api.post('/configuracion/restaurar/', formData);
  }

  // Configuración de horarios especiales
  getHorariosEspeciales(): Observable<any[]> {
    return this.api.get<any[]>('/configuracion/horarios-especiales/');
  }

  crearHorarioEspecial(horario: any): Observable<any> {
    return this.api.post('/configuracion/horarios-especiales/', horario);
  }

  actualizarHorarioEspecial(id: number, horario: any): Observable<any> {
    return this.api.put(`/configuracion/horarios-especiales/${id}/`, horario);
  }

  eliminarHorarioEspecial(id: number): Observable<void> {
    return this.api.delete<void>(`/configuracion/horarios-especiales/${id}/`);
  }

  // Configuración de días festivos
  getDiasFestivos(): Observable<any[]> {
    return this.api.get<any[]>('/configuracion/dias-festivos/');
  }

  crearDiaFestivo(dia: any): Observable<any> {
    return this.api.post('/configuracion/dias-festivos/', dia);
  }

  eliminarDiaFestivo(id: number): Observable<void> {
    return this.api.delete<void>(`/configuracion/dias-festivos/${id}/`);
  }

  // Configuración de plantillas de notificación
  getPlantillasNotificacion(tipo: string): Observable<any[]> {
    return this.api.get<any[]>(`/configuracion/plantillas/${tipo}/`);
  }

  crearPlantillaNotificacion(tipo: string, plantilla: any): Observable<any> {
    return this.api.post(`/configuracion/plantillas/${tipo}/`, plantilla);
  }

  actualizarPlantillaNotificacion(tipo: string, id: number, plantilla: any): Observable<any> {
    return this.api.put(`/configuracion/plantillas/${tipo}/${id}/`, plantilla);
  }

  eliminarPlantillaNotificacion(tipo: string, id: number): Observable<void> {
    return this.api.delete<void>(`/configuracion/plantillas/${tipo}/${id}/`);
  }

  // Configuración de integraciones
  getConfiguracionIntegraciones(): Observable<any> {
    return this.api.get('/configuracion/integraciones/');
  }

  actualizarConfiguracionIntegraciones(configuracion: any): Observable<any> {
    return this.api.put('/configuracion/integraciones/', configuracion);
  }

  // Probar integración
  probarIntegracion(tipo: string): Observable<any> {
    return this.api.post(`/configuracion/probar-integracion/${tipo}/`, {});
  }

  // Configuración de seguridad
  getConfiguracionSeguridad(): Observable<any> {
    return this.api.get('/configuracion/seguridad/');
  }

  actualizarConfiguracionSeguridad(configuracion: any): Observable<any> {
    return this.api.put('/configuracion/seguridad/', configuracion);
  }

  // Logs de configuración
  getLogsConfiguracion(filtros?: any): Observable<any[]> {
    return this.api.get<any[]>('/configuracion/logs/', filtros);
  }

  // Validar configuración
  validarConfiguracion(): Observable<any> {
    return this.api.get('/configuracion/validar/');
  }

  // Obtener configuración por defecto
  getConfiguracionDefecto(tipo: string): Observable<any> {
    return this.api.get(`/configuracion/defecto/${tipo}/`);
  }
}

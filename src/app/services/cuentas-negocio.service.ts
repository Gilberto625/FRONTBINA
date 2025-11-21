import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CuentaBancariaNegocio {
  id: number;
  nombre_cuenta: string;
  banco: string;
  numero_cuenta: string;
  numero_cuenta_enmascarado: string;
  clabe: string;
  clabe_enmascarada: string;
  nombre_titular: string;
  sucursal?: string;
  es_principal: boolean;
  estado: 'activa' | 'inactiva' | 'suspendida';
  merchant_id_banorte?: string;
  terminal_id_banorte?: string;
  configuracion_banorte_completa: boolean;
  puede_recibir_pagos: boolean;
  total_transacciones: number;
  monto_total_recibido: number;
  fecha_creacion: string;
  fecha_modificacion: string;
  creada_por?: {
    id: number;
    nombre: string;
    email: string;
  };
  modificada_por?: {
    id: number;
    nombre: string;
    email: string;
  };
  historial_cambios?: any[];
  notas_internas?: string;
}

export interface ConfiguracionPagosNegocio {
  id: number;
  cuenta_principal: CuentaBancariaNegocio;
  comision_banorte: number;
  tiempo_liquidacion_dias: number;
  monto_minimo_transaccion: number;
  monto_maximo_transaccion: number;
  notificar_transacciones: boolean;
  email_notificaciones: string;
  webhook_url?: string;
  activa: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
}

export interface EstadisticasCuentas {
  total_cuentas: number;
  cuentas_activas: number;
  cuenta_principal: CuentaBancariaNegocio | null;
  transacciones_mes_actual: number;
  monto_recibido_mes_actual: number;
  ultima_transaccion?: {
    fecha: string;
    monto: number;
    referencia: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CuentasNegocioService {

  constructor(private api: ApiService) {}

  /**
   * Obtener todas las cuentas bancarias del negocio
   */
  getCuentasNegocio(): Observable<CuentaBancariaNegocio[]> {
    return this.api.get<CuentaBancariaNegocio[]>('/configuracion/cuentas-negocio/');
  }

  /**
   * Obtener cuenta bancaria específica
   */
  getCuentaNegocio(id: number): Observable<CuentaBancariaNegocio> {
    return this.api.get<CuentaBancariaNegocio>(`/configuracion/cuentas-negocio/${id}/`);
  }

  /**
   * Obtener cuenta principal del negocio
   */
  getCuentaPrincipal(): Observable<CuentaBancariaNegocio> {
    return this.api.get<CuentaBancariaNegocio>('/configuracion/cuenta-principal/');
  }

  /**
   * Crear nueva cuenta bancaria del negocio
   */
  crearCuentaNegocio(datosCuenta: {
    nombre_cuenta: string;
    banco: string;
    numero_cuenta: string;
    clabe: string;
    nombre_titular: string;
    sucursal?: string;
    es_principal?: boolean;
    merchant_id_banorte?: string;
    terminal_id_banorte?: string;
    notas_internas?: string;
  }): Observable<CuentaBancariaNegocio> {
    return this.api.post<CuentaBancariaNegocio>('/configuracion/cuentas-negocio/crear/', datosCuenta);
  }

  /**
   * Modificar cuenta bancaria del negocio
   */
  modificarCuentaNegocio(id: number, datosCuenta: Partial<{
    nombre_cuenta: string;
    numero_cuenta: string;
    clabe: string;
    nombre_titular: string;
    sucursal: string;
    merchant_id_banorte: string;
    terminal_id_banorte: string;
    notas_internas: string;
  }>): Observable<CuentaBancariaNegocio> {
    return this.api.put<CuentaBancariaNegocio>(`/configuracion/cuentas-negocio/${id}/modificar/`, datosCuenta);
  }

  /**
   * Marcar cuenta como principal
   */
  marcarComoPrincipal(id: number): Observable<any> {
    return this.api.post(`/configuracion/cuentas-negocio/${id}/marcar-principal/`, {});
  }

  /**
   * Activar/desactivar cuenta
   */
  cambiarEstadoCuenta(id: number, estado: 'activa' | 'inactiva' | 'suspendida', motivo?: string): Observable<any> {
    return this.api.post(`/configuracion/cuentas-negocio/${id}/cambiar-estado/`, {
      estado,
      motivo
    });
  }

  /**
   * Eliminar cuenta bancaria
   */
  eliminarCuentaNegocio(id: number, motivo: string): Observable<any> {
    return this.api.delete(`/configuracion/cuentas-negocio/${id}/eliminar/`, {
      motivo
    });
  }

  /**
   * Obtener configuración de pagos del negocio
   */
  getConfiguracionPagos(): Observable<ConfiguracionPagosNegocio> {
    return this.api.get<ConfiguracionPagosNegocio>('/configuracion/pagos-negocio/');
  }

  /**
   * Actualizar configuración de pagos
   */
  actualizarConfiguracionPagos(configuracion: Partial<{
    comision_banorte: number;
    tiempo_liquidacion_dias: number;
    monto_minimo_transaccion: number;
    monto_maximo_transaccion: number;
    notificar_transacciones: boolean;
    email_notificaciones: string;
    webhook_url: string;
  }>): Observable<ConfiguracionPagosNegocio> {
    return this.api.put<ConfiguracionPagosNegocio>('/configuracion/pagos-negocio/actualizar/', configuracion);
  }

  /**
   * Obtener estadísticas de cuentas
   */
  getEstadisticasCuentas(): Observable<EstadisticasCuentas> {
    return this.api.get<EstadisticasCuentas>('/configuracion/cuentas-negocio/estadisticas/');
  }

  /**
   * Validar configuración de Banorte
   */
  validarConfiguracionBanorte(id: number): Observable<{
    valida: boolean;
    errores?: string[];
    configuracion_completa: boolean;
  }> {
    return this.api.post(`/configuracion/cuentas-negocio/${id}/validar-banorte/`, {});
  }

  /**
   * Probar conexión con Banorte
   */
  probarConexionBanorte(id: number): Observable<{
    exitosa: boolean;
    mensaje: string;
    tiempo_respuesta?: number;
  }> {
    return this.api.post(`/configuracion/cuentas-negocio/${id}/probar-conexion/`, {});
  }

  /**
   * Obtener historial de transacciones de una cuenta
   */
  getHistorialTransacciones(id: number, fechaInicio?: string, fechaFin?: string): Observable<any[]> {
    const params: any = {};
    if (fechaInicio) params.fecha_inicio = fechaInicio;
    if (fechaFin) params.fecha_fin = fechaFin;

    return this.api.get(`/configuracion/cuentas-negocio/${id}/transacciones/`, params);
  }

  /**
   * Exportar configuración de cuentas
   */
  exportarConfiguracion(): Observable<Blob> {
    return this.api.downloadFile('/configuracion/cuentas-negocio/exportar/', 'configuracion-cuentas.json');
  }

  /**
   * Obtener bancos disponibles en México
   */
  getBancosDisponibles(): Observable<{
    id: string;
    nombre: string;
    codigo: string;
    activo: boolean;
  }[]> {
    return this.api.get('/configuracion/bancos-mexico/');
  }
}

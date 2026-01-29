import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CitaAgenda {
  id: number;
  fecha_hora: string;
  cliente: {
    id: number;
    nombre: string;
    email: string;
    telefono?: string;
  };
  barbero?: {
    id: number;
    nombre: string;
  };
  servicio: {
    id: number;
    nombre: string;
  };
  silla?: {
    id: number;
    nombre: string;
  };
  estado: string;
  precio_total: number;
  anticipo_pagado: number;
}

export interface CompraSecretaria {
  id: number;
  cliente: {
    id: number;
    nombre: string;
    email: string;
  };
  subtotal: number;
  costo_envio: number;
  total: number;
  estado: string;
  pagado: boolean;
  metodo_pago?: string;
  fecha_creacion: string;
  productos: Array<{
    producto: { id: number; nombre: string };
    cantidad: number;
    subtotal: number;
  }>;
}

export interface PagoSecretaria {
  id: number;
  cliente: {
    id: number;
    nombre: string;
    email: string;
  };
  monto: number;
  metodo_pago: string;
  metodo_pago_display: string;
  estado: string;
  estado_display: string;
  cita_id?: number;
  compra_id?: number;
  id_operacion?: string;
  mercado_pago_id?: string;
  fecha_creacion: string;
  fecha_completado?: string;
  validado_por?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecretariaService {
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

  // ============================================
  // CITAS
  // ============================================

  obtenerAgenda(filtros?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
    barbero_id?: number;
  }): Observable<any> {
    let url = `${this.apiUrl}/citas/agenda/`;
    const params: string[] = [];
    if (filtros?.fecha_inicio) params.push(`fecha_inicio=${encodeURIComponent(filtros.fecha_inicio)}`);
    if (filtros?.fecha_fin) params.push(`fecha_fin=${encodeURIComponent(filtros.fecha_fin)}`);
    if (filtros?.estado) params.push(`estado=${encodeURIComponent(filtros.estado)}`);
    if (filtros?.barbero_id) params.push(`barbero_id=${filtros.barbero_id}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url);
  }

  crearCitaManual(datos: {
    cliente_id: number;
    servicio_id: number;
    fecha_hora: string;
    barbero_id?: number;
    silla_id?: number;
    anticipo_pagado?: number;
    metodo_pago_anticipo?: string;
    notas?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/citas/crear-manual/`, datos, { headers: this.getHeaders() });
  }

  registrarAsistencia(citaId: number, asistio: boolean = true): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/citas/${citaId}/asistencia/`,
      { asistio },
      { headers: this.getHeaders() }
    );
  }

  // ============================================
  // COMPRAS
  // ============================================

  listarCompras(filtros?: {
    estado?: string;
    cliente_id?: number;
    pagado?: boolean;
  }): Observable<any> {
    let url = `${this.apiUrl}/productos/compras/`;
    const params: string[] = [];
    if (filtros?.estado) params.push(`estado=${encodeURIComponent(filtros.estado)}`);
    if (filtros?.cliente_id) params.push(`cliente_id=${filtros.cliente_id}`);
    if (filtros?.pagado !== undefined) params.push(`pagado=${filtros.pagado}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url);
  }

  validarPagoCompra(compraId: number, idPagoTransferencia?: string): Observable<any> {
    const data: any = {};
    if (idPagoTransferencia) data.id_pago_transferencia = idPagoTransferencia;
    return this.http.post(
      `${this.apiUrl}/productos/compras/${compraId}/validar-pago/`,
      data,
      { headers: this.getHeaders() }
    );
  }

  // ============================================
  // PAGOS
  // ============================================

  listarPagos(filtros?: {
    estado?: string;
    metodo_pago?: string;
    cliente_id?: number;
    cita_id?: number;
    compra_id?: number;
  }): Observable<any> {
    let url = `${this.apiUrl}/pagos/listar/`;
    const params: string[] = [];
    if (filtros?.estado) params.push(`estado=${encodeURIComponent(filtros.estado)}`);
    if (filtros?.metodo_pago) params.push(`metodo_pago=${encodeURIComponent(filtros.metodo_pago)}`);
    if (filtros?.cliente_id) params.push(`cliente_id=${filtros.cliente_id}`);
    if (filtros?.cita_id) params.push(`cita_id=${filtros.cita_id}`);
    if (filtros?.compra_id) params.push(`compra_id=${filtros.compra_id}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get(url);
  }

  validarTransferencia(pagoId: number, idOperacion: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/pagos/${pagoId}/validar-transferencia/`,
      { id_operacion: idOperacion },
      { headers: this.getHeaders() }
    );
  }

  // ============================================
  // PRODUCTOS
  // ============================================

  productosBajoStock(): Observable<any> {
    return this.http.get(`${this.apiUrl}/productos/stock-bajo/`);
  }

  actualizarStock(productoId: number, operacion: 'aumentar' | 'reducir', cantidad: number): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/productos/${productoId}/stock/actualizar/`,
      { operacion, cantidad },
      { headers: this.getHeaders() }
    );
  }
}

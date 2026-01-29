import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Compra {
  id: number;
  cliente?: number;
  fecha_creacion: string;
  estado: string;
  metodo_entrega: 'local' | 'moto_mandado' | 'paqueteria';
  metodo_entrega_display?: string;
  estado_display?: string;
  pagado?: boolean;
  direccion_entrega?: string;
  subtotal?: number;
  costo_envio: number;
  total?: number;
  productos?: CompraProducto[];
  pago?: Pago;
}

export interface CompraProducto {
  id: number;
  producto: number | Producto;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  categoria_display: string;
  imagen_url?: string;
}

export interface Pago {
  id: number;
  metodo: string;
  estado: string;
  monto: number;
  fecha_creacion: string;
}

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private apiUrl = environment.apiUrl + '/productos';
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

  // Obtener mis compras
  obtenerMisCompras(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mis-compras/`);
  }

  // Obtener detalle de compra
  obtenerDetalleCompra(compraId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/compras/${compraId}/`);
  }

  // Crear compra
  crearCompra(datos: {
    productos: Array<{ producto_id: number; cantidad: number }>;
    metodo_entrega: 'local' | 'moto_mandado' | 'paqueteria';
    direccion_entrega?: string;
    notas?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/crear-compra/`, datos, { headers: this.getHeaders() });
  }

  // Cancelar compra
  cancelarCompra(compraId: number, motivo?: string): Observable<any> {
    const data: any = {};
    if (motivo) {
      data.motivo = motivo;
    }
    return this.http.put(`${this.apiUrl}/compras/${compraId}/cancelar/`, data, { headers: this.getHeaders() });
  }
}

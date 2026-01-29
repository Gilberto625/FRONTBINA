// admin.service.ts
// Servicio para todas las operaciones de administración

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Interfaces
export interface Empleado {
  id: number;
  email: string;
  username: string;
  nombre: string;
  apellido: string;
  telefono: string;
  rol: string;
  activo: boolean;
  verificado?: boolean;
  date_joined?: string;
}

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_minutos: number;
  categoria: string;
  imagen_url: string;
  activo: boolean;
  popular: boolean;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  stock: number;
  stock_minimo: number;
  imagen_url: string;
  activo: boolean;
  destacado: boolean;
  nuevo: boolean;
}

export interface DashboardStats {
  ventas_dia: number;
  citas_hoy: number;
  citas_pendientes: number;
  productos_stock_bajo: number;
  total_clientes: number;
  servicios_activos: number;
  productos_activos: number;
}

export interface Configuracion {
  nombre_negocio: string;
  direccion: string;
  telefono: string;
  email_contacto: string;
  horario_apertura: string;
  horario_cierre: string;
  porcentaje_anticipo: number;
  tiempo_espera_maximo: number;
  citas_penalizacion: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  // Subjects para datos en cache
  private empleadosSubject = new BehaviorSubject<Empleado[]>([]);
  private serviciosSubject = new BehaviorSubject<Servicio[]>([]);
  private productosSubject = new BehaviorSubject<Producto[]>([]);

  empleados$ = this.empleadosSubject.asObservable();
  servicios$ = this.serviciosSubject.asObservable();
  productos$ = this.productosSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-User-Email': user.email || ''
    });
  }

  // ============================================
  // DASHBOARD
  // ============================================
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/dashboard/`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // ============================================
  // EMPLEADOS
  // ============================================
  getEmpleados(rol?: string): Observable<any> {
    let url = `${this.apiUrl}/admin/empleados/`;
    if (rol) {
      url += `?rol=${rol}`;
    }
    return this.http.get(url, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap((response: any) => {
        if (response.ok) {
          this.empleadosSubject.next(response.empleados);
        }
      })
    );
  }

  getEmpleado(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/empleados/${id}/`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  crearEmpleado(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/empleados/`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  actualizarEmpleado(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/empleados/${id}/`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  eliminarEmpleado(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/empleados/${id}/`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // ============================================
  // SERVICIOS
  // ============================================
  getServicios(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/servicios/`, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap((response: any) => {
        if (response.ok) {
          this.serviciosSubject.next(response.servicios);
        }
      })
    );
  }

  getServicio(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/servicios/${id}/`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  crearServicio(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/servicios/`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  actualizarServicio(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/servicios/${id}/`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  eliminarServicio(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/servicios/${id}/`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // ============================================
  // PRODUCTOS
  // ============================================
  getProductos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/productos/`, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      tap((response: any) => {
        if (response.ok) {
          this.productosSubject.next(response.productos);
        }
      })
    );
  }

  getProducto(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/productos/${id}/`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  crearProducto(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/productos/`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  actualizarProducto(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/productos/${id}/`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/productos/${id}/`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  actualizarStock(id: number, cantidad: number, operacion: 'sumar' | 'establecer' = 'sumar'): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/productos/${id}/stock/`, 
      { cantidad, operacion },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  // ============================================
  // CONFIGURACIÓN
  // ============================================
  getConfiguracion(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/configuracion/`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  actualizarConfiguracion(data: Partial<Configuracion>): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/configuracion/`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // ============================================
  // REPORTES
  // ============================================
  getReportes(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/reportes/`, {
      headers: this.getHeaders(),
      withCredentials: true
    });
  }

  // ============================================
  // IMÁGENES - CLOUDINARY
  // ============================================
  
  /**
   * Subir imagen a Cloudinary
   * @param file Archivo de imagen o string base64
   * @param folder Carpeta en Cloudinary (ej: 'servicios', 'productos')
   */
  uploadImage(file: File | string, folder: string = 'barberia'): Observable<any> {
    if (typeof file === 'string') {
      // Es base64
      return this.http.post(`${this.apiUrl}/admin/upload/`, 
        { image: file, folder },
        {
          headers: this.getHeaders(),
          withCredentials: true
        }
      );
    } else {
      // Es archivo
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', folder);
      
      // No usar Content-Type header para FormData
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      return this.http.post(`${this.apiUrl}/admin/upload/`, formData, {
        headers: { 'X-User-Email': user.email || '' },
        withCredentials: true
      });
    }
  }

  /**
   * Eliminar imagen de Cloudinary
   * @param publicId ID público de la imagen en Cloudinary
   */
  deleteImage(publicId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/delete-image/`, 
      { public_id: publicId },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  // ============================================
  // HELPERS
  // ============================================
  getProductosStockBajo(): Producto[] {
    return this.productosSubject.value.filter(p => p.stock <= p.stock_minimo && p.activo);
  }

  getEmpleadosActivos(): Empleado[] {
    return this.empleadosSubject.value.filter(e => e.activo);
  }

  getServiciosActivos(): Servicio[] {
    return this.serviciosSubject.value.filter(s => s.activo);
  }
}

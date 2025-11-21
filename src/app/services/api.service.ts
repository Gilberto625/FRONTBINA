import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ApiResponse<T = any> {
  ok: boolean;
  mensaje?: string;
  data?: T;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl.replace('/api/usuarios', ''); // Base URL sin el path específico
  private csrfToken: string | null = null;

  constructor(private http: HttpClient) {
    this.initializeCsrf();
  }

  /**
   * Inicializar CSRF token
   */
  private async initializeCsrf(): Promise<void> {
    try {
      const response = await this.http.get<{csrfToken: string}>(`${this.baseUrl}/api/usuarios/csrf/`).toPromise();
      this.csrfToken = response?.csrfToken || null;
    } catch (error) {
      console.error('Error obteniendo CSRF token:', error);
    }
  }

  /**
   * Obtener headers con CSRF token
   */
  private getHeaders(): HttpHeaders {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (this.csrfToken) {
      headers = headers.set('X-CSRFToken', this.csrfToken);
    }

    return headers;
  }

  /**
   * Manejar errores HTTP
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = error.error?.mensaje || error.error?.error || `Error ${error.status}: ${error.message}`;
    }

    console.error('API Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // ================================
  // MÉTODOS GENÉRICOS
  // ================================

  /**
   * GET request genérico
   */
  get<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * POST request genérico
   */
  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT request genérico
   */
  put<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, data, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE request genérico
   */
  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ================================
  // ENDPOINTS ESPECÍFICOS
  // ================================

  // --- AUTENTICACIÓN ---
  register(userData: any): Observable<ApiResponse> {
    return this.post('/api/usuarios/register/', userData);
  }

  verifyRegistration2FA(tempToken: string, codigo: string): Observable<ApiResponse> {
    return this.post('/api/usuarios/register/2fa/verificar/', { tempToken, codigo });
  }

  login(email: string, password: string): Observable<ApiResponse> {
    return this.post('/api/usuarios/login/', { email, password });
  }

  verifyLogin2FA(tempToken: string, codigo: string): Observable<ApiResponse> {
    return this.post('/api/usuarios/login/2fa/verificar/', { tempToken, codigo });
  }

  googleLogin(idToken: string): Observable<ApiResponse> {
    return this.post('/api/usuarios/login/google/', { idToken });
  }

  // --- SERVICIOS ---
  getServicios(): Observable<ApiResponse> {
    return this.get('/api/citas/servicios/');
  }

  // --- PRODUCTOS ---
  getProductos(): Observable<ApiResponse> {
    return this.get('/api/productos/');
  }

  getProductoById(id: number): Observable<ApiResponse> {
    return this.get(`/api/productos/${id}/`);
  }

  // --- CITAS ---
  getBarberos(): Observable<ApiResponse> {
    return this.get('/api/citas/barberos/');
  }

  getDisponibilidadBarbero(barberoId: number, fecha?: string): Observable<ApiResponse> {
    const endpoint = fecha 
      ? `/api/citas/barberos/${barberoId}/disponibilidad/?fecha=${fecha}`
      : `/api/citas/barberos/${barberoId}/disponibilidad/`;
    return this.get(endpoint);
  }

  agendarCita(citaData: any): Observable<ApiResponse> {
    return this.post('/api/citas/agendar/', citaData);
  }

  getCitasCliente(clienteId: number): Observable<ApiResponse> {
    return this.get(`/api/citas/cliente/${clienteId}/`);
  }

  // --- VENTAS ---
  getMetodosPago(): Observable<ApiResponse> {
    return this.get('/api/ventas/metodos-pago/');
  }

  procesarPago(pagoData: any): Observable<ApiResponse> {
    return this.post('/api/ventas/procesar-pago/', pagoData);
  }

  // --- CARRITO ---
  getCarrito(): Observable<ApiResponse> {
    return this.get('/api/ventas/carrito/');
  }

  agregarAlCarrito(productoId: number, cantidad: number): Observable<ApiResponse> {
    return this.post('/api/ventas/carrito/agregar/', { producto_id: productoId, cantidad });
  }

  actualizarCarrito(itemId: number, cantidad: number): Observable<ApiResponse> {
    return this.put(`/api/ventas/carrito/item/${itemId}/`, { cantidad });
  }

  eliminarDelCarrito(itemId: number): Observable<ApiResponse> {
    return this.delete(`/api/ventas/carrito/item/${itemId}/`);
  }

  // --- EMPLEADOS (para barberos) ---
  getMisTiempos(): Observable<ApiResponse> {
    return this.get('/api/empleados/mis-tiempos/');
  }

  // --- CONFIGURACIÓN ---
  getConfiguracion(): Observable<ApiResponse> {
    return this.get('/api/configuracion/general/');
  }

  // --- REPORTES (para admin) ---
  getReporteVentas(fechaInicio?: string, fechaFin?: string): Observable<ApiResponse> {
    let endpoint = '/api/reportes/ventas/';
    if (fechaInicio && fechaFin) {
      endpoint += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
    }
    return this.get(endpoint);
  }

  getReporteCitas(fechaInicio?: string, fechaFin?: string): Observable<ApiResponse> {
    let endpoint = '/api/reportes/citas/';
    if (fechaInicio && fechaFin) {
      endpoint += `?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
    }
    return this.get(endpoint);
  }

  // --- NOTIFICACIONES ---
  getNotificaciones(): Observable<ApiResponse> {
    return this.get('/api/notificaciones/');
  }

  marcarNotificacionLeida(notificacionId: number): Observable<ApiResponse> {
    return this.put(`/api/notificaciones/${notificacionId}/marcar-leida/`, {});
  }

  // ================================
  // UTILIDADES
  // ================================

  /**
   * Refrescar CSRF token
   */
  async refreshCsrfToken(): Promise<void> {
    await this.initializeCsrf();
  }

  /**
   * Verificar si el backend está disponible
   */
  checkBackendHealth(): Observable<ApiResponse> {
    return this.get('/api/usuarios/csrf/');
  }
}

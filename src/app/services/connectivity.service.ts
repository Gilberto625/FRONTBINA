import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface BackendStatus {
  online: boolean;
  responseTime: number;
  version?: string;
  lastCheck: Date;
  error?: string;
}

export interface EndpointCheck {
  endpoint: string;
  status: 'online' | 'offline' | 'error';
  responseTime: number;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConnectivityService {
  private backendStatusSubject = new BehaviorSubject<BackendStatus>({
    online: false,
    responseTime: 0,
    lastCheck: new Date()
  });

  public backendStatus$ = this.backendStatusSubject.asObservable();

  // Endpoints críticos para verificar
  private criticalEndpoints = [
    '/usuarios/csrf/',
    '/citas/servicios/',
    '/productos/',
    '/empleados/',
    '/reportes/dashboard/',
    '/configuracion/',
    '/notificaciones/'
  ];

  constructor(private http: HttpClient) {
    this.startHealthCheck();
  }

  /**
   * Verificar conectividad con el backend
   */
  checkBackendHealth(): Observable<BackendStatus> {
    const startTime = Date.now();
    
    return this.http.get(`${environment.apiUrl}/health/`, { 
      responseType: 'json',
      timeout: 5000 
    }).pipe(
      timeout(5000),
      map((response: any) => {
        const responseTime = Date.now() - startTime;
        const status: BackendStatus = {
          online: true,
          responseTime,
          version: response.version || '1.0.0',
          lastCheck: new Date()
        };
        this.backendStatusSubject.next(status);
        return status;
      }),
      catchError(error => {
        const responseTime = Date.now() - startTime;
        const status: BackendStatus = {
          online: false,
          responseTime,
          lastCheck: new Date(),
          error: this.getErrorMessage(error)
        };
        this.backendStatusSubject.next(status);
        throw status;
      })
    );
  }

  /**
   * Verificar endpoints específicos
   */
  checkEndpoints(): Observable<EndpointCheck[]> {
    const checks: Observable<EndpointCheck>[] = this.criticalEndpoints.map(endpoint => 
      this.checkSingleEndpoint(endpoint)
    );

    return new Observable(observer => {
      Promise.all(checks.map(check => check.toPromise()))
        .then(results => {
          observer.next(results);
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }

  /**
   * Verificar un endpoint específico
   */
  private checkSingleEndpoint(endpoint: string): Observable<EndpointCheck> {
    const startTime = Date.now();
    
    return this.http.get(`${environment.apiUrl}${endpoint}`, {
      timeout: 3000
    }).pipe(
      map(() => ({
        endpoint,
        status: 'online' as const,
        responseTime: Date.now() - startTime
      })),
      catchError(error => {
        return new Observable<EndpointCheck>(observer => {
          observer.next({
            endpoint,
            status: error.status === 0 ? 'offline' : 'error',
            responseTime: Date.now() - startTime,
            error: this.getErrorMessage(error)
          });
          observer.complete();
        });
      })
    );
  }

  /**
   * Verificar autenticación con el backend
   */
  checkAuthentication(): Observable<boolean> {
    return this.http.get(`${environment.apiUrl}/usuarios/profile/`).pipe(
      map(() => true),
      catchError(() => new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      }))
    );
  }

  /**
   * Ping simple al servidor
   */
  ping(): Observable<number> {
    const startTime = Date.now();
    
    return this.http.get(`${environment.apiUrl}/ping/`, { 
      responseType: 'text',
      timeout: 2000 
    }).pipe(
      map(() => Date.now() - startTime),
      catchError(() => new Observable<number>(observer => {
        observer.next(-1);
        observer.complete();
      }))
    );
  }

  /**
   * Verificar configuración CORS
   */
  checkCORS(): Observable<boolean> {
    return this.http.options(`${environment.apiUrl}/`).pipe(
      map(() => true),
      catchError(() => new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      }))
    );
  }

  /**
   * Obtener información del servidor
   */
  getServerInfo(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/info/`).pipe(
      catchError(error => {
        console.warn('No se pudo obtener información del servidor:', error);
        return new Observable(observer => {
          observer.next({
            error: 'Información no disponible',
            message: this.getErrorMessage(error)
          });
          observer.complete();
        });
      })
    );
  }

  /**
   * Verificar si el backend está en modo de mantenimiento
   */
  checkMaintenanceMode(): Observable<boolean> {
    return this.http.get(`${environment.apiUrl}/maintenance/`).pipe(
      map((response: any) => response.maintenance || false),
      catchError(() => new Observable<boolean>(observer => {
        observer.next(false);
        observer.complete();
      }))
    );
  }

  /**
   * Iniciar verificación periódica de salud
   */
  private startHealthCheck(): void {
    // Verificar inmediatamente
    this.checkBackendHealth().subscribe({
      next: () => console.log('Backend conectado correctamente'),
      error: (error) => console.warn('Backend no disponible:', error)
    });

    // Verificar cada 30 segundos
    interval(30000).subscribe(() => {
      this.checkBackendHealth().subscribe({
        error: () => {} // Silenciar errores en verificaciones periódicas
      });
    });
  }

  /**
   * Obtener mensaje de error legible
   */
  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Sin conexión al servidor';
    } else if (error.status === 404) {
      return 'Endpoint no encontrado';
    } else if (error.status === 500) {
      return 'Error interno del servidor';
    } else if (error.status === 403) {
      return 'Sin permisos de acceso';
    } else if (error.status === 401) {
      return 'No autenticado';
    } else if (error.name === 'TimeoutError') {
      return 'Tiempo de espera agotado';
    } else {
      return error.message || 'Error desconocido';
    }
  }

  /**
   * Obtener estado actual del backend
   */
  getCurrentStatus(): BackendStatus {
    return this.backendStatusSubject.value;
  }

  /**
   * Verificar si el backend está online
   */
  isBackendOnline(): boolean {
    return this.backendStatusSubject.value.online;
  }

  /**
   * Forzar verificación manual
   */
  forceCheck(): Observable<BackendStatus> {
    return this.checkBackendHealth();
  }

  /**
   * Diagnóstico completo del sistema
   */
  runDiagnostics(): Observable<{
    backend: BackendStatus;
    endpoints: EndpointCheck[];
    cors: boolean;
    authentication: boolean;
    serverInfo: any;
  }> {
    return new Observable(observer => {
      Promise.all([
        this.checkBackendHealth().toPromise().catch(e => e),
        this.checkEndpoints().toPromise().catch(() => []),
        this.checkCORS().toPromise().catch(() => false),
        this.checkAuthentication().toPromise().catch(() => false),
        this.getServerInfo().toPromise().catch(() => ({}))
      ]).then(([backend, endpoints, cors, authentication, serverInfo]) => {
        observer.next({
          backend,
          endpoints,
          cors,
          authentication,
          serverInfo
        });
        observer.complete();
      });
    });
  }
}


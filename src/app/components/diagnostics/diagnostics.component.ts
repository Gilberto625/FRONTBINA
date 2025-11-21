import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConnectivityService, BackendStatus, EndpointCheck } from '../../services/connectivity.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-diagnostics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './diagnostics.component.html',
  styleUrls: ['./diagnostics.component.css']
})
export class DiagnosticsComponent implements OnInit {
  backendStatus: BackendStatus | null = null;
  endpointChecks: EndpointCheck[] = [];
  corsStatus: boolean | null = null;
  authStatus: boolean | null = null;
  serverInfo: any = null;
  
  isRunning = false;
  lastUpdate = new Date();
  
  // Configuración del entorno
  environment = environment;

  constructor(
    private connectivityService: ConnectivityService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.runDiagnostics();
    
    // Suscribirse a cambios de estado del backend
    this.connectivityService.backendStatus$.subscribe(status => {
      this.backendStatus = status;
      this.lastUpdate = new Date();
    });
  }

  /**
   * Ejecutar diagnósticos completos
   */
  async runDiagnostics(): Promise<void> {
    this.isRunning = true;
    
    try {
      const diagnostics = await this.connectivityService.runDiagnostics().toPromise();

      if (diagnostics) {
        this.backendStatus = diagnostics.backend;
        this.endpointChecks = diagnostics.endpoints;
        this.corsStatus = diagnostics.cors;
        this.authStatus = diagnostics.authentication;
        this.serverInfo = diagnostics.serverInfo;
      }
      
    } catch (error) {
      console.error('Error ejecutando diagnósticos:', error);
    } finally {
      this.isRunning = false;
      this.lastUpdate = new Date();
    }
  }

  /**
   * Verificar solo conectividad básica
   */
  async checkConnectivity(): Promise<void> {
    this.isRunning = true;
    
    try {
      this.backendStatus = await this.connectivityService.checkBackendHealth().toPromise() ?? null;
    } catch (error) {
      console.error('Error verificando conectividad:', error);
      this.backendStatus = error as BackendStatus;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Verificar solo endpoints
   */
  async checkEndpoints(): Promise<void> {
    this.isRunning = true;
    
    try {
      this.endpointChecks = await this.connectivityService.checkEndpoints().toPromise() ?? [];
    } catch (error) {
      console.error('Error verificando endpoints:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Forzar verificación de autenticación
   */
  async checkAuth(): Promise<void> {
    this.isRunning = true;
    
    try {
      this.authStatus = await this.connectivityService.checkAuthentication().toPromise() ?? null;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      this.authStatus = false;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Obtener clase CSS para el estado
   */
  getStatusClass(status: string | boolean | null): string {
    if (status === true || status === 'online') {
      return 'status-success';
    } else if (status === false || status === 'offline') {
      return 'status-error';
    } else if (status === 'error') {
      return 'status-warning';
    } else {
      return 'status-unknown';
    }
  }

  /**
   * Obtener icono para el estado
   */
  getStatusIcon(status: string | boolean | null): string {
    if (status === true || status === 'online') {
      return 'fas fa-check-circle';
    } else if (status === false || status === 'offline') {
      return 'fas fa-times-circle';
    } else if (status === 'error') {
      return 'fas fa-exclamation-triangle';
    } else {
      return 'fas fa-question-circle';
    }
  }

  /**
   * Formatear tiempo de respuesta
   */
  formatResponseTime(time: number): string {
    if (time < 0) return 'N/A';
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  }

  /**
   * Obtener color para tiempo de respuesta
   */
  getResponseTimeClass(time: number): string {
    if (time < 0) return 'response-unknown';
    if (time < 200) return 'response-excellent';
    if (time < 500) return 'response-good';
    if (time < 1000) return 'response-fair';
    return 'response-poor';
  }

  /**
   * Copiar información de diagnóstico al portapapeles
   */
  copyDiagnostics(): void {
    const diagnosticsInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        production: environment.production,
        apiUrl: environment.apiUrl,
        version: environment.version
      },
      backend: this.backendStatus,
      endpoints: this.endpointChecks,
      cors: this.corsStatus,
      authentication: this.authStatus,
      server: this.serverInfo
    };

    navigator.clipboard.writeText(JSON.stringify(diagnosticsInfo, null, 2))
      .then(() => {
        alert('Información de diagnóstico copiada al portapapeles');
      })
      .catch(err => {
        console.error('Error copiando al portapapeles:', err);
      });
  }

  /**
   * Descargar reporte de diagnóstico
   */
  downloadReport(): void {
    const diagnosticsInfo = {
      timestamp: new Date().toISOString(),
      environment: {
        production: environment.production,
        apiUrl: environment.apiUrl,
        version: environment.version
      },
      backend: this.backendStatus,
      endpoints: this.endpointChecks,
      cors: this.corsStatus,
      authentication: this.authStatus,
      server: this.serverInfo
    };

    const blob = new Blob([JSON.stringify(diagnosticsInfo, null, 2)], {
      type: 'application/json'
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagnostics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  /**
   * Obtener resumen del estado general
   */
  hasServerInfo(): boolean {
    return this.serverInfo && Object.keys(this.serverInfo).length > 0;
  }

  getServerInfoKeys(): string[] {
    return this.serverInfo ? Object.keys(this.serverInfo) : [];
  }

  getOverallStatus(): { status: string, message: string, class: string } {
    if (!this.backendStatus) {
      return {
        status: 'unknown',
        message: 'Ejecuta los diagnósticos para verificar el estado',
        class: 'status-unknown'
      };
    }

    if (!this.backendStatus.online) {
      return {
        status: 'error',
        message: 'Backend no disponible',
        class: 'status-error'
      };
    }

    const failedEndpoints = this.endpointChecks.filter(e => e.status !== 'online').length;
    
    if (failedEndpoints === 0) {
      return {
        status: 'success',
        message: 'Todos los sistemas funcionando correctamente',
        class: 'status-success'
      };
    } else if (failedEndpoints <= 2) {
      return {
        status: 'warning',
        message: `${failedEndpoints} endpoint(s) con problemas`,
        class: 'status-warning'
      };
    } else {
      return {
        status: 'error',
        message: `Múltiples endpoints con problemas (${failedEndpoints})`,
        class: 'status-error'
      };
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-test-connection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="test-connection-container">
      <h2>🔗 Prueba de Conexión Backend</h2>
      
      <div class="status-card" [ngClass]="statusClass">
        <h3>Estado de Conexión</h3>
        <p><strong>Backend URL:</strong> {{ backendUrl }}</p>
        <p><strong>Estado:</strong> {{ connectionStatus }}</p>
        <p *ngIf="lastChecked"><strong>Última verificación:</strong> {{ lastChecked | date:'medium' }}</p>
        <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>
      </div>

      <div class="actions">
        <button (click)="testConnection()" [disabled]="isLoading" class="test-btn">
          {{ isLoading ? 'Probando...' : 'Probar Conexión' }}
        </button>
        <button (click)="testEndpoints()" [disabled]="isLoading" class="test-btn">
          {{ isLoading ? 'Probando...' : 'Probar Endpoints' }}
        </button>
      </div>

      <div class="endpoints-test" *ngIf="endpointResults.length > 0">
        <h3>Resultados de Endpoints</h3>
        <div class="endpoint-result" *ngFor="let result of endpointResults" [ngClass]="result.success ? 'success' : 'error'">
          <strong>{{ result.method }} {{ result.endpoint }}</strong>
          <span class="status">{{ result.success ? '✅' : '❌' }}</span>
          <p *ngIf="result.message">{{ result.message }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-connection-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .status-card {
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      background: #f9f9f9;
    }

    .status-card.connected {
      border-color: #4CAF50;
      background: #e8f5e8;
    }

    .status-card.disconnected {
      border-color: #f44336;
      background: #ffeaea;
    }

    .status-card.loading {
      border-color: #2196F3;
      background: #e3f2fd;
    }

    .actions {
      display: flex;
      gap: 10px;
      margin: 20px 0;
    }

    .test-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      background: #2196F3;
      color: white;
      cursor: pointer;
      font-size: 16px;
    }

    .test-btn:hover:not(:disabled) {
      background: #1976D2;
    }

    .test-btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .endpoints-test {
      margin-top: 30px;
    }

    .endpoint-result {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      margin: 5px 0;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .endpoint-result.success {
      background: #e8f5e8;
      border-color: #4CAF50;
    }

    .endpoint-result.error {
      background: #ffeaea;
      border-color: #f44336;
    }

    .status {
      font-size: 18px;
    }

    .error-message {
      color: #f44336;
      font-weight: bold;
    }

    h2 {
      color: #333;
      text-align: center;
    }

    h3 {
      color: #555;
      margin-bottom: 15px;
    }
  `]
})
export class TestConnectionComponent implements OnInit {
  backendUrl: string = '';
  connectionStatus: string = 'No probado';
  statusClass: string = '';
  isLoading: boolean = false;
  lastChecked: Date | null = null;
  errorMessage: string = '';
  endpointResults: any[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    // Obtener la URL base del servicio API
    this.backendUrl = (this.apiService as any).baseUrl || 'No configurado';
  }

  async testConnection(): Promise<void> {
    this.isLoading = true;
    this.statusClass = 'loading';
    this.connectionStatus = 'Probando...';
    this.errorMessage = '';

    try {
      const response = await this.apiService.checkBackendHealth().toPromise();
      
      if (response?.ok) {
        this.connectionStatus = '✅ Conectado';
        this.statusClass = 'connected';
        this.errorMessage = '';
      } else {
        this.connectionStatus = '❌ Error en respuesta';
        this.statusClass = 'disconnected';
        this.errorMessage = response?.mensaje || 'Respuesta inesperada del servidor';
      }
    } catch (error: any) {
      this.connectionStatus = '❌ Desconectado';
      this.statusClass = 'disconnected';
      this.errorMessage = error.message || 'Error de conexión';
    } finally {
      this.isLoading = false;
      this.lastChecked = new Date();
    }
  }

  async testEndpoints(): Promise<void> {
    this.isLoading = true;
    this.endpointResults = [];

    const endpointsToTest = [
      { method: 'GET', endpoint: '/api/usuarios/csrf/', description: 'CSRF Token' },
      { method: 'GET', endpoint: '/api/citas/servicios/', description: 'Servicios' },
      { method: 'GET', endpoint: '/api/productos/', description: 'Productos' },
      { method: 'GET', endpoint: '/api/citas/barberos/', description: 'Barberos' },
      { method: 'GET', endpoint: '/api/ventas/metodos-pago/', description: 'Métodos de Pago' }
    ];

    for (const endpoint of endpointsToTest) {
      try {
        const response = await this.apiService.get(endpoint.endpoint).toPromise();
        
        this.endpointResults.push({
          method: endpoint.method,
          endpoint: endpoint.endpoint,
          description: endpoint.description,
          success: response?.ok || false,
          message: response?.mensaje || 'OK'
        });
      } catch (error: any) {
        this.endpointResults.push({
          method: endpoint.method,
          endpoint: endpoint.endpoint,
          description: endpoint.description,
          success: false,
          message: error.message || 'Error de conexión'
        });
      }
    }

    this.isLoading = false;
  }
}

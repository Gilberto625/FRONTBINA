import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface MetricasNegocio {
  ventasHoy: number;
  ventasMes: number;
  citasHoy: number;
  citasMes: number;
  clientesNuevos: number;
  ingresosTotales: number;
  crecimientoMensual: number;
  citasCompletadas: number;
}

interface VentaReciente {
  id: number;
  cliente: string;
  productos: string[];
  total: number;
  fecha: string;
  metodo_pago: string;
}

interface CitaReciente {
  id: number;
  cliente: string;
  barbero: string;
  servicios: string[];
  fecha: string;
  hora: string;
  estado: string;
  total: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  metricas: MetricasNegocio | null = null;
  ventasRecientes: VentaReciente[] = [];
  citasRecientes: CitaReciente[] = [];
  
  isLoading = true;
  error: string | null = null;

  // Mock data
  mockMetricas: MetricasNegocio = {
    ventasHoy: 15,
    ventasMes: 342,
    citasHoy: 28,
    citasMes: 756,
    clientesNuevos: 45,
    ingresosTotales: 125680,
    crecimientoMensual: 15.8,
    citasCompletadas: 698
  };

  mockVentas: VentaReciente[] = [
    {
      id: 1,
      cliente: 'Juan Pérez',
      productos: ['Pomada Premium', 'Aceite de Barba'],
      total: 630,
      fecha: '2024-01-20',
      metodo_pago: 'Tarjeta'
    },
    {
      id: 2,
      cliente: 'Carlos Ruiz',
      productos: ['Shampoo Anticaspa'],
      total: 220,
      fecha: '2024-01-20',
      metodo_pago: 'Efectivo'
    },
    {
      id: 3,
      cliente: 'Miguel Torres',
      productos: ['Kit Completo'],
      total: 650,
      fecha: '2024-01-19',
      metodo_pago: 'Transferencia'
    }
  ];

  mockCitas: CitaReciente[] = [
    {
      id: 1,
      cliente: 'Ana García',
      barbero: 'Carlos Mendoza',
      servicios: ['Corte Moderno', 'Peinado'],
      fecha: '2024-01-21',
      hora: '10:00',
      estado: 'confirmada',
      total: 200
    },
    {
      id: 2,
      cliente: 'Luis Martín',
      barbero: 'Miguel Torres',
      servicios: ['Combo Completo'],
      fecha: '2024-01-21',
      hora: '11:30',
      estado: 'en_proceso',
      total: 300
    },
    {
      id: 3,
      cliente: 'Roberto Silva',
      barbero: 'Antonio Ruiz',
      servicios: ['Arreglo de Barba'],
      fecha: '2024-01-21',
      hora: '14:00',
      estado: 'completada',
      total: 100
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.metricas = this.mockMetricas;
      this.ventasRecientes = this.mockVentas;
      this.citasRecientes = this.mockCitas;

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.error = 'Error al cargar los datos del dashboard.';
    } finally {
      this.isLoading = false;
    }
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get userName(): string {
    const user = this.currentUser;
    return user ? `${user.nombre} ${user.apellido}` : 'Administrador';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'confirmada':
        return 'estado-confirmada';
      case 'en_proceso':
        return 'estado-proceso';
      case 'completada':
        return 'estado-completada';
      case 'cancelada':
        return 'estado-cancelada';
      default:
        return 'estado-default';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'confirmada': return 'Confirmada';
      case 'en_proceso': return 'En Proceso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  }

  getMetodoPagoIcon(metodo: string): string {
    switch (metodo.toLowerCase()) {
      case 'tarjeta': return 'credit-card';
      case 'efectivo': return 'banknote';
      case 'transferencia': return 'arrow-right-left';
      default: return 'wallet';
    }
  }

  getCrecimientoClass(): string {
    if (!this.metricas) return '';
    return this.metricas.crecimientoMensual >= 0 ? 'positivo' : 'negativo';
  }

  getCrecimientoIcon(): string {
    if (!this.metricas) return 'minus';
    return this.metricas.crecimientoMensual >= 0 ? 'trending-up' : 'trending-down';
  }
}

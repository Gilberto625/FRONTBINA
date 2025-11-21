import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CitasService } from '../../../services/citas.service';
import { ProductosService } from '../../../services/productos.service';

interface ResumenCliente {
  proximasCitas: any[];
  pedidosRecientes: any[];
  estadisticas: {
    totalCitas: number;
    citasCompletadas: number;
    totalPedidos: number;
    montoGastado: number;
  };
}

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class ClienteDashboardComponent implements OnInit {
  resumen: ResumenCliente | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private citasService: CitasService,
    private productosService: ProductosService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      // Por ahora usamos datos mock hasta que el backend esté listo
      this.resumen = {
        proximasCitas: [
          {
            id: 1,
            servicio: 'Corte de Cabello + Barba',
            barbero: 'Carlos Mendoza',
            fecha: '2024-01-25',
            hora: '15:30',
            estado: 'confirmada',
            precio: 250
          },
          {
            id: 2,
            servicio: 'Tratamiento Capilar',
            barbero: 'Miguel Torres',
            fecha: '2024-02-02',
            hora: '11:00',
            estado: 'pendiente',
            precio: 300
          }
        ],
        pedidosRecientes: [
          {
            id: 1,
            numero: 'PED-001',
            fecha: '2024-01-20',
            total: 450,
            estado: 'entregado',
            productos: ['Pomada Premium', 'Aceite de Barba']
          },
          {
            id: 2,
            numero: 'PED-002',
            fecha: '2024-01-22',
            total: 180,
            estado: 'en_camino',
            productos: ['Shampoo Anticaspa']
          }
        ],
        estadisticas: {
          totalCitas: 15,
          citasCompletadas: 12,
          totalPedidos: 8,
          montoGastado: 3450
        }
      };

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.error = 'Error al cargar los datos del dashboard.';
    } finally {
      this.isLoading = false;
    }
  }

  get currentUser() {
    return this.authService.getCurrentUserValue();
  }

  get userName(): string {
    const user = this.currentUser;
    return user ? `${user.nombre} ${user.apellido}` : 'Usuario';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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
      case 'entregado':
        return 'estado-success';
      case 'pendiente':
      case 'en_camino':
        return 'estado-warning';
      case 'cancelada':
        return 'estado-error';
      default:
        return 'estado-default';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'confirmada': return 'Confirmada';
      case 'pendiente': return 'Pendiente';
      case 'cancelada': return 'Cancelada';
      case 'entregado': return 'Entregado';
      case 'en_camino': return 'En camino';
      default: return estado;
    }
  }
}

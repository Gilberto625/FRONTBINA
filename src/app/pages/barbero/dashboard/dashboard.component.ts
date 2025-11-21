import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface CitaBarbero {
  id: number;
  cliente: string;
  telefono: string;
  servicios: string[];
  hora: string;
  duracion: number;
  estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'completada';
  precio: number;
  notas?: string;
}

interface EstadisticasBarbero {
  citasHoy: number;
  citasCompletadas: number;
  ingresosDia: number;
  tiempoPromedio: number;
  clientesAtendidos: number;
  calificacionPromedio: number;
}

interface ServicioBarbero {
  id: number;
  nombre: string;
  duracionEstimada: number;
  precio: number;
  vecesRealizado: number;
}

@Component({
  selector: 'app-barbero-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class BarberoDashboardComponent implements OnInit {
  citasHoy: CitaBarbero[] = [];
  estadisticas: EstadisticasBarbero | null = null;
  servicios: ServicioBarbero[] = [];
  
  isLoading = true;
  error: string | null = null;

  // Mock data
  mockCitas: CitaBarbero[] = [
    {
      id: 1,
      cliente: 'Juan Pérez',
      telefono: '555-0123',
      servicios: ['Corte Clásico', 'Arreglo Barba'],
      hora: '10:00',
      duracion: 45,
      estado: 'confirmada',
      precio: 250
    },
    {
      id: 2,
      cliente: 'Carlos Ruiz',
      telefono: '555-0456',
      servicios: ['Combo Completo'],
      hora: '11:30',
      duracion: 60,
      estado: 'en_proceso',
      precio: 300,
      notas: 'Cliente prefiere corte más corto'
    },
    {
      id: 3,
      cliente: 'Luis Martín',
      telefono: '555-0789',
      servicios: ['Corte Moderno'],
      hora: '14:00',
      duracion: 30,
      estado: 'pendiente',
      precio: 200
    },
    {
      id: 4,
      cliente: 'Roberto Silva',
      telefono: '555-0321',
      servicios: ['Tratamiento Capilar'],
      hora: '15:30',
      duracion: 40,
      estado: 'confirmada',
      precio: 250
    }
  ];

  mockEstadisticas: EstadisticasBarbero = {
    citasHoy: 8,
    citasCompletadas: 5,
    ingresosDia: 1250,
    tiempoPromedio: 42,
    clientesAtendidos: 5,
    calificacionPromedio: 4.8
  };

  mockServicios: ServicioBarbero[] = [
    {
      id: 1,
      nombre: 'Corte Clásico',
      duracionEstimada: 30,
      precio: 150,
      vecesRealizado: 15
    },
    {
      id: 2,
      nombre: 'Corte Moderno',
      duracionEstimada: 35,
      precio: 200,
      vecesRealizado: 12
    },
    {
      id: 3,
      nombre: 'Arreglo de Barba',
      duracionEstimada: 20,
      precio: 100,
      vecesRealizado: 18
    },
    {
      id: 4,
      nombre: 'Combo Completo',
      duracionEstimada: 60,
      precio: 300,
      vecesRealizado: 8
    },
    {
      id: 5,
      nombre: 'Tratamiento Capilar',
      duracionEstimada: 40,
      precio: 250,
      vecesRealizado: 6
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

      this.citasHoy = this.mockCitas;
      this.estadisticas = this.mockEstadisticas;
      this.servicios = this.mockServicios;

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.error = 'Error al cargar los datos del dashboard.';
    } finally {
      this.isLoading = false;
    }
  }

  get citasOrdenadas(): CitaBarbero[] {
    return [...this.citasHoy].sort((a, b) => a.hora.localeCompare(b.hora));
  }

  get proximaCita(): CitaBarbero | null {
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    
    const citasPendientes = this.citasHoy
      .filter(cita => cita.estado === 'confirmada' || cita.estado === 'pendiente')
      .sort((a, b) => a.hora.localeCompare(b.hora));
    
    for (const cita of citasPendientes) {
      const [hora, minuto] = cita.hora.split(':').map(Number);
      const horaCita = hora * 60 + minuto;
      
      if (horaCita >= horaActual) {
        return cita;
      }
    }
    
    return null;
  }

  get serviciosMasRealizados(): ServicioBarbero[] {
    return [...this.servicios]
      .sort((a, b) => b.vecesRealizado - a.vecesRealizado)
      .slice(0, 3);
  }

  async iniciarCita(cita: CitaBarbero): Promise<void> {
    try {
      cita.estado = 'en_proceso';
      this.showToast(`Cita con ${cita.cliente} iniciada`, 'success');
    } catch (error) {
      console.error('Error iniciando cita:', error);
      this.showToast('Error al iniciar cita', 'error');
    }
  }

  async completarCita(cita: CitaBarbero): Promise<void> {
    try {
      cita.estado = 'completada';
      
      // Actualizar estadísticas
      if (this.estadisticas) {
        this.estadisticas.citasCompletadas++;
        this.estadisticas.clientesAtendidos++;
        this.estadisticas.ingresosDia += cita.precio;
      }
      
      this.showToast(`Cita con ${cita.cliente} completada`, 'success');
    } catch (error) {
      console.error('Error completando cita:', error);
      this.showToast('Error al completar cita', 'error');
    }
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 8px;
      color: white;
      background: ${type === 'success' ? '#4CAF50' : '#F44336'};
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }

  get barberoName(): string {
    const user = this.currentUser;
    return user ? `${user.nombre} ${user.apellido}` : 'Barbero';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatTime(timeString: string): string {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'confirmada': return 'estado-confirmada';
      case 'pendiente': return 'estado-pendiente';
      case 'en_proceso': return 'estado-proceso';
      case 'completada': return 'estado-completada';
      default: return 'estado-default';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'confirmada': return 'Confirmada';
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En Proceso';
      case 'completada': return 'Completada';
      default: return estado;
    }
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  getTiempoRestante(): string {
    if (!this.proximaCita) return '';
    
    const ahora = new Date();
    const [hora, minuto] = this.proximaCita.hora.split(':').map(Number);
    const horaCita = new Date();
    horaCita.setHours(hora, minuto, 0, 0);
    
    const diferencia = horaCita.getTime() - ahora.getTime();
    
    if (diferencia <= 0) return 'Ahora';
    
    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    
    if (horas > 0) {
      return `${horas}h ${mins}min`;
    }
    return `${mins}min`;
  }
}


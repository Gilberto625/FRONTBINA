import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

interface CitaDelDia {
  id: number;
  cliente: string;
  telefono: string;
  barbero: string;
  servicios: string[];
  hora: string;
  duracion: number;
  estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';
  precio: number;
  anticipo_pagado: boolean;
  notas?: string;
}

interface AlertaOperativa {
  id: number;
  tipo: 'stock_bajo' | 'pago_pendiente' | 'cita_sin_confirmar' | 'cliente_esperando';
  mensaje: string;
  prioridad: 'alta' | 'media' | 'baja';
  timestamp: string;
}

interface ResumenOperativo {
  citasHoy: number;
  citasPendientes: number;
  ventasHoy: number;
  pagosValidar: number;
  productosStockBajo: number;
  clientesEspera: number;
}

@Component({
  selector: 'app-secretaria-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class SecretariaDashboardComponent implements OnInit {
  citasHoy: CitaDelDia[] = [];
  alertas: AlertaOperativa[] = [];
  resumen: ResumenOperativo | null = null;
  
  isLoading = true;
  error: string | null = null;
  
  // Filtros
  filtroEstado = 'todas';
  filtroBarbero = 'todos';

  // Mock data
  mockCitas: CitaDelDia[] = [
    {
      id: 1,
      cliente: 'Juan Pérez',
      telefono: '555-0123',
      barbero: 'Carlos Mendoza',
      servicios: ['Corte Clásico', 'Arreglo Barba'],
      hora: '09:00',
      duracion: 45,
      estado: 'confirmada',
      precio: 250,
      anticipo_pagado: true
    },
    {
      id: 2,
      cliente: 'María González',
      telefono: '555-0456',
      barbero: 'Miguel Torres',
      servicios: ['Corte Moderno'],
      hora: '10:30',
      duracion: 30,
      estado: 'pendiente',
      precio: 200,
      anticipo_pagado: false,
      notas: 'Primera cita - no requiere anticipo'
    },
    {
      id: 3,
      cliente: 'Carlos Ruiz',
      telefono: '555-0789',
      barbero: 'Antonio Ruiz',
      servicios: ['Combo Completo'],
      hora: '11:00',
      duracion: 60,
      estado: 'en_proceso',
      precio: 300,
      anticipo_pagado: true
    },
    {
      id: 4,
      cliente: 'Ana López',
      telefono: '555-0321',
      barbero: 'Carlos Mendoza',
      servicios: ['Tratamiento Capilar'],
      hora: '14:00',
      duracion: 40,
      estado: 'pendiente',
      precio: 250,
      anticipo_pagado: false
    },
    {
      id: 5,
      cliente: 'Luis Martín',
      telefono: '555-0654',
      barbero: 'Miguel Torres',
      servicios: ['Corte + Barba'],
      hora: '15:30',
      duracion: 50,
      estado: 'confirmada',
      precio: 280,
      anticipo_pagado: true
    }
  ];

  mockAlertas: AlertaOperativa[] = [
    {
      id: 1,
      tipo: 'pago_pendiente',
      mensaje: 'Validar transferencia de Ana López - $125 MXN',
      prioridad: 'alta',
      timestamp: '2024-01-21T13:45:00'
    },
    {
      id: 2,
      tipo: 'stock_bajo',
      mensaje: 'Pomada Premium - Solo quedan 3 unidades',
      prioridad: 'media',
      timestamp: '2024-01-21T12:30:00'
    },
    {
      id: 3,
      tipo: 'cita_sin_confirmar',
      mensaje: 'Cita de María González sin confirmar (10:30)',
      prioridad: 'alta',
      timestamp: '2024-01-21T09:15:00'
    },
    {
      id: 4,
      tipo: 'cliente_esperando',
      mensaje: 'Roberto Silva esperando - Cita 13:00',
      prioridad: 'alta',
      timestamp: '2024-01-21T13:05:00'
    }
  ];

  mockResumen: ResumenOperativo = {
    citasHoy: 12,
    citasPendientes: 3,
    ventasHoy: 8,
    pagosValidar: 2,
    productosStockBajo: 5,
    clientesEspera: 1
  };

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
      this.alertas = this.mockAlertas;
      this.resumen = this.mockResumen;

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.error = 'Error al cargar los datos del dashboard.';
    } finally {
      this.isLoading = false;
    }
  }

  get citasFiltradas(): CitaDelDia[] {
    let citas = [...this.citasHoy];

    if (this.filtroEstado !== 'todas') {
      citas = citas.filter(cita => cita.estado === this.filtroEstado);
    }

    if (this.filtroBarbero !== 'todos') {
      citas = citas.filter(cita => cita.barbero === this.filtroBarbero);
    }

    return citas.sort((a, b) => a.hora.localeCompare(b.hora));
  }

  get barberos(): string[] {
    const barberos = [...new Set(this.citasHoy.map(cita => cita.barbero))];
    return barberos.sort();
  }

  get alertasPorPrioridad(): AlertaOperativa[] {
    return this.alertas.sort((a, b) => {
      const prioridades = { 'alta': 3, 'media': 2, 'baja': 1 };
      return prioridades[b.prioridad] - prioridades[a.prioridad];
    });
  }

  async confirmarCita(cita: CitaDelDia): Promise<void> {
    try {
      cita.estado = 'confirmada';
      this.showToast(`Cita de ${cita.cliente} confirmada`, 'success');
    } catch (error) {
      console.error('Error confirmando cita:', error);
      this.showToast('Error al confirmar cita', 'error');
    }
  }

  async marcarEnProceso(cita: CitaDelDia): Promise<void> {
    try {
      cita.estado = 'en_proceso';
      this.showToast(`Cita de ${cita.cliente} iniciada`, 'success');
    } catch (error) {
      console.error('Error marcando cita:', error);
      this.showToast('Error al actualizar cita', 'error');
    }
  }

  async completarCita(cita: CitaDelDia): Promise<void> {
    try {
      cita.estado = 'completada';
      this.showToast(`Cita de ${cita.cliente} completada`, 'success');
    } catch (error) {
      console.error('Error completando cita:', error);
      this.showToast('Error al completar cita', 'error');
    }
  }

  async cancelarCita(cita: CitaDelDia): Promise<void> {
    if (!confirm(`¿Cancelar la cita de ${cita.cliente}?`)) return;

    try {
      cita.estado = 'cancelada';
      this.showToast(`Cita de ${cita.cliente} cancelada`, 'success');
    } catch (error) {
      console.error('Error cancelando cita:', error);
      this.showToast('Error al cancelar cita', 'error');
    }
  }

  async resolverAlerta(alerta: AlertaOperativa): Promise<void> {
    try {
      const index = this.alertas.findIndex(a => a.id === alerta.id);
      if (index >= 0) {
        this.alertas.splice(index, 1);
        this.showToast('Alerta resuelta', 'success');
      }
    } catch (error) {
      console.error('Error resolviendo alerta:', error);
      this.showToast('Error al resolver alerta', 'error');
    }
  }

  llamarCliente(telefono: string, nombre: string): void {
    // Simular llamada
    this.showToast(`Llamando a ${nombre}...`, 'success');
  }

  enviarWhatsApp(telefono: string, nombre: string): void {
    const mensaje = `Hola ${nombre}, te recordamos tu cita en Tony Stylo. ¡Te esperamos!`;
    const url = `https://wa.me/52${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
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
      case 'cancelada': return 'estado-cancelada';
      default: return 'estado-default';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'confirmada': return 'Confirmada';
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En Proceso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  }

  getAlertaClass(tipo: string): string {
    switch (tipo) {
      case 'stock_bajo': return 'alerta-warning';
      case 'pago_pendiente': return 'alerta-info';
      case 'cita_sin_confirmar': return 'alerta-warning';
      case 'cliente_esperando': return 'alerta-error';
      default: return 'alerta-default';
    }
  }

  getAlertaIcon(tipo: string): string {
    switch (tipo) {
      case 'stock_bajo': return 'package-x';
      case 'pago_pendiente': return 'credit-card';
      case 'cita_sin_confirmar': return 'calendar-x';
      case 'cliente_esperando': return 'clock';
      default: return 'bell';
    }
  }

  getPrioridadClass(prioridad: string): string {
    switch (prioridad) {
      case 'alta': return 'prioridad-alta';
      case 'media': return 'prioridad-media';
      case 'baja': return 'prioridad-baja';
      default: return 'prioridad-default';
    }
  }
}

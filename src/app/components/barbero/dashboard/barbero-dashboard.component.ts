import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { CitaService } from '../../../services/cita.service';
import { ServicioService } from '../../../services/servicio.service';

@Component({
  selector: 'app-barbero-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './barbero-dashboard.component.html',
  styleUrl: './barbero-dashboard.component.css'
})
export class BarberoDashboardComponent {
  private citaService = inject(CitaService);
  private servicioService = inject(ServicioService);

  // En producción, filtrar por el barbero logueado
  citasDelDia = this.citaService.citasDelDia();
  proximaCita = this.citasDelDia.find(c => c.estado === 'confirmada' || c.estado === 'pendiente');

  get citasHoy(): number {
    return this.citasDelDia.length;
  }

  get citasCompletadas(): number {
    return this.citasDelDia.filter(c => c.estado === 'completada').length;
  }

  get citasPendientes(): number {
    return this.citasDelDia.filter(c => c.estado === 'pendiente' || c.estado === 'confirmada').length;
  }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getServicioNombre(servicioId: string): string {
    return this.servicioService.getServicioById(servicioId)?.nombre || 'Servicio';
  }

  getBadgeClass(estado: string): string {
    const clases: Record<string, string> = {
      'pendiente': 'badge-warning',
      'confirmada': 'badge-outline',
      'en_curso': 'badge-gold',
      'completada': 'badge-success'
    };
    return clases[estado] || 'badge-outline';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'en_curso': 'En espera',
      'completada': 'Completada'
    };
    return labels[estado] || estado;
  }
}

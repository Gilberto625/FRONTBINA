import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { CitaService } from '../../../services/cita.service';
import { ServicioService } from '../../../services/servicio.service';

@Component({
  selector: 'app-secretaria-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './secretaria-dashboard.component.html'
})
export class SecretariaDashboardComponent {
  private citaService = inject(CitaService);
  private servicioService = inject(ServicioService);

  citasDelDia = this.citaService.citasDelDia();
  citasPendientes = this.citasDelDia.filter(c => c.estado === 'pendiente');

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

  getBarberoNombre(barberoId: string): string {
    const barbero = this.citaService.getBarberoById(barberoId);
    return barbero?.usuario?.nombre || 'Barbero';
  }

  getIniciales(clienteId: string): string {
    return clienteId.substring(0, 2).toUpperCase();
  }

  confirmarCita(citaId: string): void {
    this.citaService.actualizarCita(citaId, { estado: 'confirmada' });
  }
}

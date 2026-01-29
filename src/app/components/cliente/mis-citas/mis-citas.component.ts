import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { CitaService } from '../../../services/cita.service';
import { ServicioService } from '../../../services/servicio.service';
import { Cita, EstadoCita } from '../../../models';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, BreadcrumbComponent],
  templateUrl: './mis-citas.component.html'
})
export class MisCitasComponent {
  private citaService = inject(CitaService);
  private servicioService = inject(ServicioService);
  
  tabActivo = signal<'proximas' | 'pendientes' | 'completadas'>('proximas');
  
  get citasProximas(): Cita[] {
    return this.citaService.citasProximas().filter(c => 
      c.estado === 'confirmada' || c.estado === 'en_curso'
    );
  }
  
  get citasPendientes(): Cita[] {
    return this.citaService.citas().filter(c => c.estado === 'pendiente');
  }
  
  get citasCompletadas(): Cita[] {
    return this.citaService.citas().filter(c => c.estado === 'completada');
  }

  citasFiltradas = () => {
    switch (this.tabActivo()) {
      case 'proximas':
        return this.citasProximas;
      case 'pendientes':
        return this.citasPendientes;
      case 'completadas':
        return this.citasCompletadas;
      default:
        return [];
    }
  };

  cambiarTab(tab: 'proximas' | 'pendientes' | 'completadas'): void {
    this.tabActivo.set(tab);
  }

  getServicioNombre(servicioId: string): string {
    const servicio = this.servicioService.getServicioById(servicioId);
    return servicio?.nombre || 'Servicio';
  }

  getBarberoNombre(barberoId: string): string {
    const barbero = this.citaService.getBarberoById(barberoId);
    return barbero?.usuario?.nombre + ' ' + barbero?.usuario?.apellidos || 'Barbero';
  }

  getIniciales(barberoId: string): string {
    const barbero = this.citaService.getBarberoById(barberoId);
    if (barbero?.usuario) {
      return (barbero.usuario.nombre[0] + barbero.usuario.apellidos[0]).toUpperCase();
    }
    return 'BB';
  }

  formatearFecha(fecha: Date): string {
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    };
    return new Date(fecha).toLocaleDateString('es-MX', opciones);
  }

  getColorEstado(estado: EstadoCita): string {
    const colores: Record<EstadoCita, string> = {
      'pendiente': 'var(--color-warning)',
      'confirmada': 'var(--color-accent)',
      'en_curso': 'var(--color-info)',
      'completada': 'var(--color-success)',
      'cancelada': 'var(--color-error)',
      'no_asistio': 'var(--color-error)'
    };
    return colores[estado];
  }

  getBadgeClass(estado: EstadoCita): string {
    const clases: Record<EstadoCita, string> = {
      'pendiente': 'badge-warning',
      'confirmada': 'badge-success',
      'en_curso': 'badge-info',
      'completada': 'badge-success',
      'cancelada': 'badge-error',
      'no_asistio': 'badge-error'
    };
    return clases[estado];
  }

  getEstadoLabel(estado: EstadoCita): string {
    const labels: Record<EstadoCita, string> = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'en_curso': 'En curso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_asistio': 'No asistió'
    };
    return labels[estado];
  }

  cancelarCita(citaId: string): void {
    if (confirm('¿Estás seguro de cancelar esta cita?')) {
      this.citaService.cancelarCita(citaId);
    }
  }
}

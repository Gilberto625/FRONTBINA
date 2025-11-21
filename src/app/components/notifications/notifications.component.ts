import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NotificationsService, Notificacion } from '../../services/notifications.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notificaciones: Notificacion[] = [];
  noLeidas = 0;
  mostrarDropdown = false;
  cargando = false;

  private subscriptions: Subscription[] = [];

  constructor(private notificationsService: NotificationsService) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.notificationsService.notificaciones$.subscribe(notificaciones => {
        this.notificaciones = notificaciones.slice(0, 10); // Mostrar solo las 10 más recientes
      }),
      
      this.notificationsService.noLeidas$.subscribe(count => {
        this.noLeidas = count;
      })
    );

    // Cargar notificaciones iniciales
    this.cargarNotificaciones();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async cargarNotificaciones(): Promise<void> {
    this.cargando = true;
    try {
      await this.notificationsService.cargarNotificaciones();
    } finally {
      this.cargando = false;
    }
  }

  toggleDropdown(): void {
    this.mostrarDropdown = !this.mostrarDropdown;
  }

  cerrarDropdown(): void {
    this.mostrarDropdown = false;
  }

  async marcarComoLeida(notificacion: Notificacion): Promise<void> {
    if (!notificacion.leida) {
      await this.notificationsService.marcarComoLeida(notificacion.id);
    }

    // Si tiene URL de acción, navegar
    if (notificacion.url_accion) {
      window.location.href = notificacion.url_accion;
    }

    this.cerrarDropdown();
  }

  async marcarTodasComoLeidas(): Promise<void> {
    await this.notificationsService.marcarTodasComoLeidas();
  }

  async eliminarNotificacion(notificacion: Notificacion, event: Event): Promise<void> {
    event.stopPropagation();
    await this.notificationsService.eliminarNotificacion(notificacion.id);
  }

  getIconoTipo(tipo: string): string {
    const iconos: { [key: string]: string } = {
      'info': 'fas fa-info-circle',
      'success': 'fas fa-check-circle',
      'warning': 'fas fa-exclamation-triangle',
      'error': 'fas fa-exclamation-circle',
      'cita': 'fas fa-calendar',
      'producto': 'fas fa-shopping-bag',
      'pago': 'fas fa-credit-card'
    };
    return iconos[tipo] || 'fas fa-bell';
  }

  getColorTipo(tipo: string): string {
    const colores: { [key: string]: string } = {
      'info': 'text-info',
      'success': 'text-success',
      'warning': 'text-warning',
      'error': 'text-danger',
      'cita': 'text-primary',
      'producto': 'text-secondary',
      'pago': 'text-success'
    };
    return colores[tipo] || 'text-info';
  }

  formatearTiempo(fecha: string): string {
    const ahora = new Date();
    const fechaNotificacion = new Date(fecha);
    const diferencia = ahora.getTime() - fechaNotificacion.getTime();

    const minutos = Math.floor(diferencia / (1000 * 60));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (minutos < 1) {
      return 'Ahora mismo';
    } else if (minutos < 60) {
      return `Hace ${minutos} min`;
    } else if (horas < 24) {
      return `Hace ${horas}h`;
    } else if (dias < 7) {
      return `Hace ${dias}d`;
    } else {
      return fechaNotificacion.toLocaleDateString('es-ES');
    }
  }

  // Método para testing - agregar notificación de prueba
  agregarNotificacionPrueba(): void {
    this.notificationsService.agregarNotificacionLocal({
      titulo: 'Notificación de Prueba',
      mensaje: 'Esta es una notificación de prueba del sistema',
      tipo: 'info',
      leida: false
    });
  }
}

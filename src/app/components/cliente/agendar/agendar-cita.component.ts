import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { CitaService } from '../../../services/cita.service';
import { ServicioService } from '../../../services/servicio.service';
import { Servicio, Barbero, HorarioDisponible } from '../../../models';

type PasoAgenda = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, BreadcrumbComponent],
  templateUrl: './agendar-cita.component.html'
})
export class AgendarCitaComponent {
  private citaService = inject(CitaService);
  private servicioService = inject(ServicioService);
  private router = inject(Router);

  pasoActual = signal<PasoAgenda>(1);
  servicioSeleccionado = signal<Servicio | null>(null);
  barberoSeleccionado = signal<Barbero | null>(null);
  fechaSeleccionada = signal<Date | null>(null);
  horaSeleccionada = signal<string | null>(null);
  metodoPago = signal<'tarjeta' | 'transferencia' | 'mercado_pago'>('tarjeta');

  servicios = this.servicioService.servicios();
  barberos = this.citaService.barberos();

  // Calendario
  mesActual = new Date().getMonth();
  anioActual = new Date().getFullYear();

  get nombreMes(): string {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[this.mesActual];
  }

  get diasCalendario(): { numero: number | null; fecha: Date | null; disponible: boolean }[] {
    const dias: { numero: number | null; fecha: Date | null; disponible: boolean }[] = [];
    const primerDia = new Date(this.anioActual, this.mesActual, 1);
    const ultimoDia = new Date(this.anioActual, this.mesActual + 1, 0);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Días vacíos antes del primer día
    for (let i = 0; i < primerDia.getDay(); i++) {
      dias.push({ numero: null, fecha: null, disponible: false });
    }

    // Días del mes
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const fecha = new Date(this.anioActual, this.mesActual, d);
      const esPasado = fecha < hoy;
      const esMuyFuturo = fecha > new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      dias.push({
        numero: d,
        fecha,
        disponible: !esPasado && !esMuyFuturo
      });
    }

    return dias;
  }

  get horariosDisponibles(): HorarioDisponible[] {
    if (!this.fechaSeleccionada() || !this.barberoSeleccionado()) {
      return [];
    }
    return this.citaService.getHorariosDisponibles(
      this.fechaSeleccionada()!,
      this.barberoSeleccionado()!.id
    );
  }

  seleccionarServicio(servicio: Servicio): void {
    this.servicioSeleccionado.set(servicio);
  }

  seleccionarBarbero(barbero: Barbero): void {
    this.barberoSeleccionado.set(barbero);
  }

  seleccionarFecha(fecha: Date): void {
    this.fechaSeleccionada.set(fecha);
    this.horaSeleccionada.set(null);
  }

  seleccionarHora(hora: string): void {
    this.horaSeleccionada.set(hora);
  }

  seleccionarMetodoPago(metodo: 'tarjeta' | 'transferencia' | 'mercado_pago'): void {
    this.metodoPago.set(metodo);
  }

  siguientePaso(): void {
    if (this.pasoActual() < 4) {
      this.pasoActual.update(p => (p + 1) as PasoAgenda);
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual() > 1) {
      this.pasoActual.update(p => (p - 1) as PasoAgenda);
    }
  }

  irAPaso(paso: PasoAgenda): void {
    this.pasoActual.set(paso);
  }

  mesAnterior(): void {
    if (this.mesActual === 0) {
      this.mesActual = 11;
      this.anioActual--;
    } else {
      this.mesActual--;
    }
  }

  mesSiguiente(): void {
    if (this.mesActual === 11) {
      this.mesActual = 0;
      this.anioActual++;
    } else {
      this.mesActual++;
    }
  }

  getInicialesBarbero(): string {
    const barbero = this.barberoSeleccionado();
    if (barbero?.usuario) {
      return (barbero.usuario.nombre[0] + barbero.usuario.apellidos[0]).toUpperCase();
    }
    return 'BB';
  }

  formatearFechaCompleta(fecha: Date): string {
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    };
    return fecha.toLocaleDateString('es-MX', opciones);
  }

  calcularAnticipo(): number {
    const precio = this.servicioSeleccionado()?.precio || 0;
    return Math.ceil(precio * 0.3);
  }

  calcularRestante(): number {
    const precio = this.servicioSeleccionado()?.precio || 0;
    return precio - this.calcularAnticipo();
  }

  confirmarCita(): void {
    if (!this.servicioSeleccionado() || !this.barberoSeleccionado() || 
        !this.fechaSeleccionada() || !this.horaSeleccionada()) {
      return;
    }

    const servicio = this.servicioSeleccionado()!;
    const anticipo = this.calcularAnticipo();

    this.citaService.crearCita({
      clienteId: 'c1', // En producción vendría del auth service
      barberoId: this.barberoSeleccionado()!.id,
      servicioId: servicio.id,
      fecha: this.fechaSeleccionada()!,
      hora: this.horaSeleccionada()!,
      duracionMinutos: servicio.duracionMinutos,
      estado: 'pendiente',
      estadoPago: 'pendiente',
      precioTotal: servicio.precio,
      anticipo,
      anticipoPagado: false
    });

    // Navegar a confirmación o mis citas
    alert('¡Cita agendada con éxito! Procede al pago.');
    this.router.navigate(['/cliente/citas']);
  }
}

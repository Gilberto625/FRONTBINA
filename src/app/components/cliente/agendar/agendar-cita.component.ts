import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { CitaService } from '../../../services/cita.service';
import { ServicioService } from '../../../services/servicio.service';
import { Servicio, Barbero, HorarioDisponible } from '../../../models';

type PasoAgenda = 1 | 2 | 3 | 4;

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="layout-sidebar">
      <app-sidebar rol="cliente"></app-sidebar>

      <main class="main-content">
        <h1 class="mb-md">Agendar Cita</h1>

        <!-- Progress Steps -->
        <div class="progress-steps mb-xl">
          <div class="progress-step" [class.active]="pasoActual() === 1" [class.completed]="pasoActual() > 1">
            <div class="progress-step-circle">
              @if (pasoActual() > 1) {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              } @else { 1 }
            </div>
            <span class="progress-step-label">Servicio</span>
          </div>
          <div class="progress-step" [class.active]="pasoActual() === 2" [class.completed]="pasoActual() > 2">
            <div class="progress-step-circle">
              @if (pasoActual() > 2) {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              } @else { 2 }
            </div>
            <span class="progress-step-label">Barbero</span>
          </div>
          <div class="progress-step" [class.active]="pasoActual() === 3" [class.completed]="pasoActual() > 3">
            <div class="progress-step-circle">
              @if (pasoActual() > 3) {
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              } @else { 3 }
            </div>
            <span class="progress-step-label">Fecha/Hora</span>
          </div>
          <div class="progress-step" [class.active]="pasoActual() === 4">
            <div class="progress-step-circle">4</div>
            <span class="progress-step-label">Confirmar</span>
          </div>
        </div>

        <!-- Paso 1: Seleccionar Servicio -->
        @if (pasoActual() === 1) {
          <div class="card">
            <h2 class="mb-md">Selecciona un servicio</h2>
            <p class="text-muted mb-lg">Elige el servicio que deseas agendar</p>

            <div class="grid grid-3">
              @for (servicio of servicios; track servicio.id) {
                <div class="card card-selectable" 
                     [class.selected]="servicioSeleccionado()?.id === servicio.id"
                     (click)="seleccionarServicio(servicio)">
                  <div class="card-image" style="height: 120px;"></div>
                  <h4>{{ servicio.nombre }}</h4>
                  <p class="text-small">{{ servicio.duracionMinutos }} min</p>
                  <p class="text-gold" style="font-weight: 600;">\${{ servicio.precio }} MXN</p>
                  @if (servicioSeleccionado()?.id === servicio.id) {
                    <span class="badge badge-gold">Seleccionado</span>
                  }
                </div>
              }
            </div>

            <div class="flex-between mt-xl">
              <a routerLink="/cliente" class="btn btn-text">Cancelar</a>
              <button class="btn btn-primary" [disabled]="!servicioSeleccionado()" (click)="siguientePaso()">
                Continuar
              </button>
            </div>
          </div>
        }

        <!-- Paso 2: Seleccionar Barbero -->
        @if (pasoActual() === 2) {
          <div class="card">
            <h2 class="mb-md">Selecciona un barbero</h2>
            <p class="text-muted mb-lg">Elige con quién deseas tu cita</p>

            <div class="grid grid-3">
              @for (barbero of barberos; track barbero.id) {
                <div class="card card-selectable"
                     [class.selected]="barberoSeleccionado()?.id === barbero.id"
                     (click)="seleccionarBarbero(barbero)">
                  <div class="flex" style="gap: var(--spacing-md); margin-bottom: var(--spacing-md);">
                    <div class="avatar avatar-lg">
                      {{ barbero.usuario.nombre[0] }}{{ barbero.usuario.apellidos[0] }}
                    </div>
                    <div>
                      <h4>{{ barbero.usuario.nombre }} {{ barbero.usuario.apellidos }}</h4>
                      <div class="flex" style="gap: 4px; color: var(--color-accent);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        {{ barbero.calificacion }}
                      </div>
                    </div>
                  </div>
                  <p class="text-small">Especialidades:</p>
                  <div class="flex" style="gap: var(--spacing-xs); flex-wrap: wrap;">
                    @for (esp of barbero.especialidades; track esp) {
                      <span class="badge badge-outline">{{ esp }}</span>
                    }
                  </div>
                  @if (barberoSeleccionado()?.id === barbero.id) {
                    <span class="badge badge-gold mt-md">Seleccionado</span>
                  }
                </div>
              }
            </div>

            <div class="flex-between mt-xl">
              <button class="btn btn-text" (click)="pasoAnterior()">Atrás</button>
              <button class="btn btn-primary" [disabled]="!barberoSeleccionado()" (click)="siguientePaso()">
                Continuar
              </button>
            </div>
          </div>
        }

        <!-- Paso 3: Seleccionar Fecha y Hora -->
        @if (pasoActual() === 3) {
          <div class="grid" style="grid-template-columns: 1fr 1fr;">
            <div class="card">
              <h2 class="mb-md">Selecciona una fecha</h2>

              <div class="calendar">
                <div class="calendar-header">
                  <button class="btn btn-text btn-sm" (click)="mesAnterior()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </button>
                  <h3>{{ nombreMes }} {{ anioActual }}</h3>
                  <button class="btn btn-text btn-sm" (click)="mesSiguiente()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                </div>
                <div class="calendar-grid">
                  <div class="calendar-day-header">Dom</div>
                  <div class="calendar-day-header">Lun</div>
                  <div class="calendar-day-header">Mar</div>
                  <div class="calendar-day-header">Mié</div>
                  <div class="calendar-day-header">Jue</div>
                  <div class="calendar-day-header">Vie</div>
                  <div class="calendar-day-header">Sáb</div>

                  @for (dia of diasCalendario; track $index) {
                    <div class="calendar-day" 
                         [class.disabled]="!dia.disponible"
                         [class.selected]="dia.fecha && fechaSeleccionada() && dia.fecha.getTime() === fechaSeleccionada()?.getTime()"
                         (click)="dia.disponible && seleccionarFecha(dia.fecha!)">
                      {{ dia.numero || '' }}
                    </div>
                  }
                </div>
              </div>
            </div>

            <div class="card">
              <h2 class="mb-md">Horarios disponibles</h2>
              @if (fechaSeleccionada()) {
                <p class="text-muted mb-lg">{{ formatearFechaCompleta(fechaSeleccionada()!) }}</p>

                <div class="time-slots">
                  @for (horario of horariosDisponibles; track horario.hora) {
                    <div class="time-slot"
                         [class.disabled]="!horario.disponible"
                         [class.selected]="horaSeleccionada() === horario.hora"
                         (click)="horario.disponible && seleccionarHora(horario.hora)">
                      {{ horario.hora }}
                    </div>
                  }
                </div>
              } @else {
                <p class="text-muted">Selecciona una fecha para ver los horarios disponibles</p>
              }
            </div>
          </div>

          <div class="card mt-lg">
            <div class="flex-between">
              <button class="btn btn-text" (click)="pasoAnterior()">Atrás</button>
              <button class="btn btn-primary" [disabled]="!fechaSeleccionada() || !horaSeleccionada()" (click)="siguientePaso()">
                Continuar
              </button>
            </div>
          </div>
        }

        <!-- Paso 4: Confirmar -->
        @if (pasoActual() === 4) {
          <div class="grid" style="grid-template-columns: 2fr 1fr;">
            <div>
              <div class="card mb-lg">
                <h2 class="mb-lg">Resumen de tu cita</h2>

                <div class="list">
                  <div class="list-item" style="padding-left: 0;">
                    <div class="stat-card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="6" cy="6" r="3"/><path d="M6 9v12"/><path d="M13 6l-3 9 7 4"/>
                      </svg>
                    </div>
                    <div style="flex: 1;">
                      <p class="text-caption">Servicio</p>
                      <p style="font-weight: 600;">{{ servicioSeleccionado()?.nombre }}</p>
                    </div>
                    <button class="btn btn-text btn-sm" (click)="irAPaso(1)">Cambiar</button>
                  </div>
                  <div class="list-item" style="padding-left: 0;">
                    <div class="avatar">
                      {{ getInicialesBarbero() }}
                    </div>
                    <div style="flex: 1;">
                      <p class="text-caption">Barbero</p>
                      <p style="font-weight: 600;">{{ barberoSeleccionado()?.usuario?.nombre }} {{ barberoSeleccionado()?.usuario?.apellidos }}</p>
                    </div>
                    <button class="btn btn-text btn-sm" (click)="irAPaso(2)">Cambiar</button>
                  </div>
                  <div class="list-item" style="padding-left: 0;">
                    <div class="stat-card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                      </svg>
                    </div>
                    <div style="flex: 1;">
                      <p class="text-caption">Fecha y hora</p>
                      <p style="font-weight: 600;">{{ formatearFechaCompleta(fechaSeleccionada()!) }}, {{ horaSeleccionada() }}</p>
                    </div>
                    <button class="btn btn-text btn-sm" (click)="irAPaso(3)">Cambiar</button>
                  </div>
                  <div class="list-item" style="padding-left: 0;">
                    <div class="stat-card-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                    </div>
                    <div style="flex: 1;">
                      <p class="text-caption">Duración estimada</p>
                      <p style="font-weight: 600;">{{ servicioSeleccionado()?.duracionMinutos }} minutos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card">
                <h3 class="mb-md">Método de pago</h3>
                <div class="alert alert-warning mb-md">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <span>Se requiere anticipo del 30% para confirmar la cita</span>
                </div>

                <div class="form-group">
                  <label class="card" style="display: flex; gap: var(--spacing-md); cursor: pointer;"
                         [class.card-featured]="metodoPago() === 'tarjeta'">
                    <input type="radio" name="payment" value="tarjeta" 
                           [checked]="metodoPago() === 'tarjeta'"
                           (change)="seleccionarMetodoPago('tarjeta')">
                    <div>
                      <p style="font-weight: 600;">Tarjeta de crédito/débito</p>
                      <p class="text-caption">Visa, Mastercard, AMEX</p>
                    </div>
                  </label>
                </div>
                <div class="form-group">
                  <label class="card" style="display: flex; gap: var(--spacing-md); cursor: pointer;"
                         [class.card-featured]="metodoPago() === 'transferencia'">
                    <input type="radio" name="payment" value="transferencia"
                           [checked]="metodoPago() === 'transferencia'"
                           (change)="seleccionarMetodoPago('transferencia')">
                    <div>
                      <p style="font-weight: 600;">Transferencia bancaria</p>
                      <p class="text-caption">SPEI - Requiere validación</p>
                    </div>
                  </label>
                </div>
                <div class="form-group">
                  <label class="card" style="display: flex; gap: var(--spacing-md); cursor: pointer;"
                         [class.card-featured]="metodoPago() === 'mercado_pago'">
                    <input type="radio" name="payment" value="mercado_pago"
                           [checked]="metodoPago() === 'mercado_pago'"
                           (change)="seleccionarMetodoPago('mercado_pago')">
                    <div>
                      <p style="font-weight: 600;">Mercado Pago</p>
                      <p class="text-caption">Paga con tu cuenta MP</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div class="card" style="position: sticky; top: var(--spacing-lg);">
                <h3 class="mb-md">Detalle de pago</h3>

                <div class="flex-between mb-sm">
                  <span>{{ servicioSeleccionado()?.nombre }}</span>
                  <span>\${{ servicioSeleccionado()?.precio }}.00</span>
                </div>

                <hr style="border: none; border-top: 1px solid var(--divider-color); margin: var(--spacing-md) 0;">

                <div class="flex-between mb-sm">
                  <span style="font-weight: 600;">Subtotal</span>
                  <span style="font-weight: 600;">\${{ servicioSeleccionado()?.precio }}.00</span>
                </div>
                <div class="flex-between mb-md text-gold">
                  <span style="font-weight: 600;">Anticipo (30%)</span>
                  <span style="font-weight: 600;">\${{ calcularAnticipo() }}.00</span>
                </div>
                <p class="text-caption mb-lg">Restante a pagar en sucursal: \${{ calcularRestante() }}.00</p>

                <button class="btn btn-primary btn-block mb-sm" (click)="confirmarCita()">
                  Confirmar y Pagar \${{ calcularAnticipo() }}.00
                </button>
                <button class="btn btn-text btn-block" (click)="pasoAnterior()">Atrás</button>
              </div>
            </div>
          </div>
        }
      </main>
    </div>

    <!-- Mobile Nav -->
    <nav class="navbar-mobile">
      <a routerLink="/cliente" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        Inicio
      </a>
      <a routerLink="/cliente/agendar" routerLinkActive="active" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/></svg>
        Agendar
      </a>
      <a routerLink="/cliente/citas" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
        Citas
      </a>
      <a routerLink="/cliente/carrito" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
        Tienda
      </a>
      <a routerLink="/cliente/perfil" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Perfil
      </a>
    </nav>
  `
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

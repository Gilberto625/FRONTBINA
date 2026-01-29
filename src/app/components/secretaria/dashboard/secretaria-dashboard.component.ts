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
  template: `
    <div class="layout-sidebar">
      <app-sidebar rol="secretaria"></app-sidebar>

      <main class="main-content">
        <div class="flex-between mb-lg">
          <div>
            <h1>Panel de Secretaría</h1>
            <p class="text-muted">Hoy es {{ fechaHoy }}</p>
          </div>
          <div class="avatar avatar-lg">SM</div>
        </div>

        <!-- Stats del día -->
        <div class="stats-grid mb-lg">
          <div class="stat-card">
            <div class="stat-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
              </svg>
            </div>
            <p class="stat-card-value">{{ citasDelDia.length }}</p>
            <p class="stat-card-label">Citas del día</p>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background: var(--color-warning-light);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <p class="stat-card-value">{{ citasPendientes.length }}</p>
            <p class="stat-card-label">Por confirmar</p>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background: var(--color-success-light);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <p class="stat-card-value">\$8,450</p>
            <p class="stat-card-label">Ventas del día</p>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background: var(--color-info-light);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-info)" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <p class="stat-card-value">3</p>
            <p class="stat-card-label">Transferencias pendientes</p>
          </div>
        </div>

        <div class="grid">
          <!-- Citas del día -->
          <div class="card">
            <div class="flex-between mb-md">
              <h3>Citas del Día</h3>
              <a routerLink="/secretaria/agenda" class="btn btn-text btn-sm">Ver todas</a>
            </div>
            <ul class="list">
              @for (cita of citasDelDia.slice(0, 4); track cita.id) {
                <li class="list-item">
                  <div class="avatar">{{ getIniciales(cita.clienteId) }}</div>
                  <div style="flex:1">
                    <p class="mb-0"><strong>Cliente {{ cita.clienteId }}</strong></p>
                    <p class="text-small mb-0">{{ getServicioNombre(cita.servicioId) }} - {{ getBarberoNombre(cita.barberoId) }}</p>
                  </div>
                  <div class="text-right">
                    <span class="badge" [class]="cita.estado === 'confirmada' ? 'badge-success' : 'badge-warning'">
                      {{ cita.estado === 'confirmada' ? 'Confirmada' : 'Pendiente' }}
                    </span>
                    <p class="text-small mb-0">{{ cita.hora }}</p>
                  </div>
                </li>
              }
            </ul>
          </div>

          <!-- Confirmaciones pendientes -->
          <div class="card">
            <div class="flex-between mb-md">
              <h3>Confirmaciones Pendientes</h3>
              <span class="badge badge-warning">{{ citasPendientes.length }}</span>
            </div>
            <ul class="list">
              @for (cita of citasPendientes.slice(0, 3); track cita.id) {
                <li class="list-item">
                  <div style="flex:1">
                    <p class="mb-0"><strong>Cliente {{ cita.clienteId }}</strong> - {{ cita.hora }}</p>
                    <p class="text-small mb-0">{{ getServicioNombre(cita.servicioId) }}</p>
                  </div>
                  <div class="flex flex-gap">
                    <button class="btn btn-primary btn-sm" (click)="confirmarCita(cita.id)">Confirmar</button>
                    <button class="btn btn-text btn-sm">Llamar</button>
                  </div>
                </li>
              } @empty {
                <li class="list-item">
                  <p class="text-muted mb-0">No hay confirmaciones pendientes</p>
                </li>
              }
            </ul>
          </div>
        </div>

        <!-- Ventas del día -->
        <div class="card mt-lg">
          <div class="flex-between mb-md">
            <h3>Ventas del Día</h3>
            <a routerLink="/secretaria/ventas" class="btn btn-primary btn-sm">Nueva Venta</a>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th>Concepto</th>
                  <th>Método</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>09:45</td>
                  <td>Juan Rodríguez</td>
                  <td>Corte + Barba</td>
                  <td><span class="badge badge-info">Tarjeta</span></td>
                  <td class="text-gold"><strong>\$350</strong></td>
                </tr>
                <tr>
                  <td>10:30</td>
                  <td>Carlos Méndez</td>
                  <td>Pomada + Shampoo</td>
                  <td><span class="badge badge-success">Efectivo</span></td>
                  <td class="text-gold"><strong>\$580</strong></td>
                </tr>
                <tr>
                  <td>11:15</td>
                  <td>Pedro Ramírez</td>
                  <td>Degradado + Diseño</td>
                  <td><span class="badge badge-warning">Transferencia</span></td>
                  <td class="text-gold"><strong>\$400</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    <!-- Mobile Nav -->
    <nav class="navbar-mobile">
      <a routerLink="/secretaria" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        Inicio
      </a>
      <a routerLink="/secretaria/agenda" routerLinkActive="active" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
        Agenda
      </a>
      <a routerLink="/secretaria/ventas" routerLinkActive="active" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        Venta
      </a>
      <a routerLink="/secretaria/inventario" routerLinkActive="active" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
        Inventario
      </a>
      <a routerLink="/secretaria/pedidos" routerLinkActive="active" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>
        Pedidos
      </a>
    </nav>
  `
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

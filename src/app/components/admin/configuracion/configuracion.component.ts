import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AdminService, Configuracion } from '../../../services/admin.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent],
  template: `
    <div class="layout-sidebar">
      <app-sidebar rol="admin"></app-sidebar>

      <main class="main-content">
        <div class="mb-lg">
          <h1>Configuración</h1>
          <p class="text-muted">Ajustes generales del negocio</p>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <div class="tab" [class.active]="tabActivo === 'general'" (click)="tabActivo = 'general'">General</div>
          <div class="tab" [class.active]="tabActivo === 'horarios'" (click)="tabActivo = 'horarios'">Horarios</div>
          <div class="tab" [class.active]="tabActivo === 'pagos'" (click)="tabActivo = 'pagos'">Pagos</div>
          <div class="tab" [class.active]="tabActivo === 'politicas'" (click)="tabActivo = 'politicas'">Políticas</div>
        </div>

        <form (ngSubmit)="guardarConfiguracion()">
          <!-- Tab General -->
          @if (tabActivo === 'general') {
            <div class="card mb-lg">
              <h3 class="mb-md">Información del Negocio</h3>
              <div class="grid">
                <div class="form-group">
                  <label class="form-label">Nombre del negocio</label>
                  <input type="text" class="form-input" [(ngModel)]="config.nombre_negocio" name="nombre_negocio">
                </div>
                <div class="form-group">
                  <label class="form-label">Teléfono de contacto</label>
                  <input type="tel" class="form-input" [(ngModel)]="config.telefono" name="telefono">
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Email de contacto</label>
                <input type="email" class="form-input" [(ngModel)]="config.email_contacto" name="email_contacto">
              </div>
              <div class="form-group">
                <label class="form-label">Dirección</label>
                <textarea class="form-input" [(ngModel)]="config.direccion" name="direccion" rows="2"></textarea>
              </div>
            </div>
          }

          <!-- Tab Horarios -->
          @if (tabActivo === 'horarios') {
            <div class="card mb-lg">
              <h3 class="mb-md">Horarios de Atención</h3>
              <p class="text-small mb-lg">Define los horarios de apertura y cierre del establecimiento</p>

              <div class="grid">
                <div class="form-group">
                  <label class="form-label">Hora de apertura</label>
                  <input type="time" class="form-input" [(ngModel)]="config.horario_apertura" name="horario_apertura">
                </div>
                <div class="form-group">
                  <label class="form-label">Hora de cierre</label>
                  <input type="time" class="form-input" [(ngModel)]="config.horario_cierre" name="horario_cierre">
                </div>
              </div>

              <div class="alert alert-info mt-md">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>Los horarios se aplicarán a todos los días laborables. Configuración detallada por día próximamente.</span>
              </div>
            </div>
          }

          <!-- Tab Pagos -->
          @if (tabActivo === 'pagos') {
            <div class="card mb-lg">
              <h3 class="mb-md">Configuración de Pagos</h3>

              <div class="form-group">
                <label class="form-label">Porcentaje de anticipo para reservas</label>
                <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                  <input type="number" class="form-input" [(ngModel)]="config.porcentaje_anticipo" 
                         name="porcentaje_anticipo" min="0" max="100" style="width: 100px;">
                  <span>%</span>
                </div>
                <p class="text-small mt-sm mb-0">El cliente deberá pagar este porcentaje al momento de agendar</p>
              </div>

              <div class="form-group">
                <label class="form-label">Métodos de pago aceptados</label>
                <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                  <label style="display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer;">
                    <input type="checkbox" checked disabled style="width: 18px; height: 18px;">
                    <span>Efectivo</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer;">
                    <input type="checkbox" checked disabled style="width: 18px; height: 18px;">
                    <span>Tarjeta de crédito/débito</span>
                  </label>
                  <label style="display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer;">
                    <input type="checkbox" checked disabled style="width: 18px; height: 18px;">
                    <span>Transferencia bancaria</span>
                  </label>
                </div>
                <p class="text-small mt-sm mb-0 text-muted">La integración con Mercado Pago estará disponible próximamente</p>
              </div>
            </div>
          }

          <!-- Tab Políticas -->
          @if (tabActivo === 'politicas') {
            <div class="card mb-lg">
              <h3 class="mb-md">Políticas de Citas</h3>

              <div class="form-group">
                <label class="form-label">Tiempo máximo de espera (minutos)</label>
                <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                  <input type="number" class="form-input" [(ngModel)]="config.tiempo_espera_maximo" 
                         name="tiempo_espera_maximo" min="5" max="30" style="width: 100px;">
                  <span>minutos</span>
                </div>
                <p class="text-small mt-sm mb-0">Si el cliente no llega en este tiempo, la cita se cancela automáticamente</p>
              </div>

              <div class="form-group">
                <label class="form-label">Citas para liberar penalización</label>
                <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                  <input type="number" class="form-input" [(ngModel)]="config.citas_penalizacion" 
                         name="citas_penalizacion" min="1" max="20" style="width: 100px;">
                  <span>citas</span>
                </div>
                <p class="text-small mt-sm mb-0">Número de citas que el cliente debe completar para liberarse de la penalización por inasistencia</p>
              </div>

              <div class="alert alert-warning mt-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>Estas políticas se aplican según las reglas de negocio establecidas en el documento de requerimientos</span>
              </div>
            </div>
          }

          <!-- Botones -->
          <div class="flex-between">
            <button type="button" class="btn btn-text" (click)="restaurarDefectos()">
              Restaurar valores por defecto
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </main>
    </div>

    <!-- Mobile Nav -->
    <nav class="navbar-mobile">
      <a routerLink="/admin" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        Dashboard
      </a>
      <a routerLink="/admin/empleados" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        </svg>
        Empleados
      </a>
      <a routerLink="/admin/servicios" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
        Servicios
      </a>
      <a routerLink="/admin/productos" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
        Productos
      </a>
      <a routerLink="/admin/configuracion" routerLinkActive="active" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
        </svg>
        Config
      </a>
    </nav>
  `,
  styles: [`
    .tabs {
      display: flex;
      gap: var(--spacing-xs);
      margin-bottom: var(--spacing-lg);
      border-bottom: 1px solid var(--border-color);
      overflow-x: auto;
    }
    .tab {
      padding: var(--spacing-sm) var(--spacing-md);
      cursor: pointer;
      border-bottom: 2px solid transparent;
      white-space: nowrap;
      transition: all 0.2s;
    }
    .tab:hover {
      color: var(--color-accent);
    }
    .tab.active {
      color: var(--color-accent);
      border-bottom-color: var(--color-accent);
    }
  `]
})
export class ConfiguracionComponent implements OnInit {
  private adminService = inject(AdminService);
  private modalService = inject(ModalService);

  tabActivo = 'general';
  guardando = false;
  
  config: Configuracion = {
    nombre_negocio: 'Stylo Barber',
    direccion: '',
    telefono: '',
    email_contacto: '',
    horario_apertura: '09:00',
    horario_cierre: '20:00',
    porcentaje_anticipo: 30,
    tiempo_espera_maximo: 10,
    citas_penalizacion: 10
  };

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    this.adminService.getConfiguracion().subscribe({
      next: (response) => {
        if (response.ok) {
          this.config = { ...this.config, ...response.configuracion };
        }
      },
      error: () => {
        // Si falla, usar valores por defecto
        console.log('Usando configuración por defecto');
      }
    });
  }

  guardarConfiguracion(): void {
    this.guardando = true;
    this.adminService.actualizarConfiguracion(this.config).subscribe({
      next: (response) => {
        this.guardando = false;
        if (response.ok) {
          this.modalService.showSuccess('Configuración guardada exitosamente');
        } else {
          this.modalService.showError(response.error || 'Error al guardar');
        }
      },
      error: (error) => {
        this.guardando = false;
        this.modalService.showError('Error al guardar configuración');
      }
    });
  }

  restaurarDefectos(): void {
    if (confirm('¿Restaurar todos los valores a sus valores por defecto?')) {
      this.config = {
        nombre_negocio: 'Stylo Barber',
        direccion: '',
        telefono: '',
        email_contacto: '',
        horario_apertura: '09:00',
        horario_cierre: '20:00',
        porcentaje_anticipo: 30,
        tiempo_espera_maximo: 10,
        citas_penalizacion: 10
      };
      this.modalService.showInfo('Valores restaurados. No olvides guardar los cambios.');
    }
  }
}

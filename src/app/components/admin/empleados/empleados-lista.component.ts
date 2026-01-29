import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AdminService, Empleado } from '../../../services/admin.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-empleados-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent],
  template: `
    <div class="layout-sidebar">
      <app-sidebar rol="admin"></app-sidebar>

      <main class="main-content">
        <div class="flex-between mb-lg">
          <div>
            <h1>Empleados</h1>
            <p class="text-muted">Gestiona tu equipo de trabajo</p>
          </div>
          <button class="btn btn-primary" (click)="abrirModalCrear()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Empleado
          </button>
        </div>

        <!-- Filtros -->
        <div class="card mb-lg">
          <div class="flex-between" style="flex-wrap: wrap; gap: var(--spacing-md);">
            <div class="form-group mb-0" style="flex: 1; min-width: 200px;">
              <input type="text" class="form-input" placeholder="Buscar por nombre..." 
                     [(ngModel)]="filtro" (input)="filtrarEmpleados()">
            </div>
            <div class="form-group mb-0" style="min-width: 150px;">
              <select class="form-select" [(ngModel)]="filtroRol" (change)="filtrarEmpleados()">
                <option value="">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="cliente">Cliente</option>
              </select>
            </div>
            <div class="form-group mb-0" style="min-width: 150px;">
              <select class="form-select" [(ngModel)]="filtroEstado" (change)="filtrarEmpleados()">
                <option value="">Todos los estados</option>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid mb-lg">
          <div class="stat-card">
            <p class="stat-card-value">{{ empleados.length }}</p>
            <p class="stat-card-label">Total usuarios</p>
          </div>
          <div class="stat-card">
            <p class="stat-card-value text-success">{{ empleadosActivos }}</p>
            <p class="stat-card-label">Activos</p>
          </div>
          <div class="stat-card">
            <p class="stat-card-value text-gold">{{ admins }}</p>
            <p class="stat-card-label">Administradores</p>
          </div>
          <div class="stat-card">
            <p class="stat-card-value">{{ clientes }}</p>
            <p class="stat-card-label">Clientes</p>
          </div>
        </div>

        <!-- Tabla de empleados -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (empleado of empleadosFiltrados; track empleado.id) {
                <tr [style.opacity]="empleado.activo ? 1 : 0.6">
                  <td>
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                      <div class="avatar">{{ getIniciales(empleado) }}</div>
                      <div>
                        <p class="mb-0" style="font-weight: 600;">{{ empleado.nombre }} {{ empleado.apellido }}</p>
                        <p class="text-small mb-0">{{ empleado.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge" [class.badge-gold]="empleado.rol === 'admin'" 
                          [class.badge-info]="empleado.rol === 'cliente'">
                      {{ empleado.rol === 'admin' ? 'Administrador' : 'Cliente' }}
                    </span>
                  </td>
                  <td>{{ empleado.telefono || '-' }}</td>
                  <td>
                    <span class="badge" [class.badge-success]="empleado.activo" [class.badge-error]="!empleado.activo">
                      {{ empleado.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; gap: var(--spacing-xs);">
                      <button class="btn btn-text btn-sm" (click)="editarEmpleado(empleado)">Editar</button>
                      @if (empleado.activo) {
                        <button class="btn btn-text btn-sm text-error" (click)="desactivarEmpleado(empleado)">Desactivar</button>
                      } @else {
                        <button class="btn btn-text btn-sm text-success" (click)="activarEmpleado(empleado)">Activar</button>
                      }
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" style="text-align: center; padding: var(--spacing-xl);">
                    <p class="text-muted">{{ loading ? 'Cargando...' : 'No hay empleados registrados' }}</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </main>
    </div>

    <!-- Modal Crear/Editar -->
    @if (mostrarModal) {
      <div class="modal-overlay" (click)="cerrarModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ empleadoEditar ? 'Editar' : 'Nuevo' }} Usuario</h3>
            <button class="modal-close" (click)="cerrarModal()">&times;</button>
          </div>
          <form (ngSubmit)="guardarEmpleado()">
            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input type="text" class="form-input" [(ngModel)]="formulario.nombre" name="nombre" required>
            </div>
            <div class="form-group">
              <label class="form-label">Apellido</label>
              <input type="text" class="form-input" [(ngModel)]="formulario.apellido" name="apellido">
            </div>
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input type="email" class="form-input" [(ngModel)]="formulario.email" name="email" required
                     [disabled]="empleadoEditar !== null">
            </div>
            @if (!empleadoEditar) {
              <div class="form-group">
                <label class="form-label">Contraseña *</label>
                <input type="password" class="form-input" [(ngModel)]="formulario.password" name="password" required>
              </div>
            }
            <div class="form-group">
              <label class="form-label">Teléfono</label>
              <input type="tel" class="form-input" [(ngModel)]="formulario.telefono" name="telefono">
            </div>
            <div class="form-group">
              <label class="form-label">Rol *</label>
              <select class="form-select" [(ngModel)]="formulario.rol" name="rol" required>
                <option value="cliente">Cliente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="guardando">
                {{ guardando ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Mobile Nav -->
    <nav class="navbar-mobile">
      <a routerLink="/admin" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        Dashboard
      </a>
      <a routerLink="/admin/empleados" routerLinkActive="active" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        </svg>
        Empleados
      </a>
      <a routerLink="/admin/servicios" routerLinkActive="active" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
        Servicios
      </a>
      <a routerLink="/admin/productos" routerLinkActive="active" class="navbar-mobile-item">
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
  `
})
export class EmpleadosListaComponent implements OnInit {
  private adminService = inject(AdminService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  empleados: Empleado[] = [];
  empleadosFiltrados: Empleado[] = [];
  loading = true;
  
  // Filtros
  filtro = '';
  filtroRol = '';
  filtroEstado = '';

  // Modal
  mostrarModal = false;
  empleadoEditar: Empleado | null = null;
  guardando = false;
  formulario = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'cliente'
  };

  get empleadosActivos(): number {
    return this.empleados.filter(e => e.activo).length;
  }

  get admins(): number {
    return this.empleados.filter(e => e.rol === 'admin').length;
  }

  get clientes(): number {
    return this.empleados.filter(e => e.rol === 'cliente').length;
  }

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.loading = true;
    this.adminService.getEmpleados().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          this.empleados = response.empleados;
          this.filtrarEmpleados();
        }
      },
      error: (error) => {
        this.loading = false;
        this.modalService.showError('Error al cargar empleados');
        console.error(error);
      }
    });
  }

  filtrarEmpleados(): void {
    this.empleadosFiltrados = this.empleados.filter(e => {
      const matchNombre = !this.filtro || 
        `${e.nombre} ${e.apellido} ${e.email}`.toLowerCase().includes(this.filtro.toLowerCase());
      const matchRol = !this.filtroRol || e.rol === this.filtroRol;
      const matchEstado = !this.filtroEstado || 
        (this.filtroEstado === 'activo' ? e.activo : !e.activo);
      return matchNombre && matchRol && matchEstado;
    });
  }

  getIniciales(empleado: Empleado): string {
    const nombre = empleado.nombre || empleado.email.split('@')[0];
    const apellido = empleado.apellido || '';
    return `${nombre[0] || ''}${apellido[0] || nombre[1] || ''}`.toUpperCase();
  }

  abrirModalCrear(): void {
    this.empleadoEditar = null;
    this.formulario = {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      telefono: '',
      rol: 'cliente'
    };
    this.mostrarModal = true;
  }

  editarEmpleado(empleado: Empleado): void {
    this.empleadoEditar = empleado;
    this.formulario = {
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      email: empleado.email,
      password: '',
      telefono: empleado.telefono,
      rol: empleado.rol
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.empleadoEditar = null;
  }

  guardarEmpleado(): void {
    if (!this.formulario.nombre || !this.formulario.email) {
      this.modalService.showError('Nombre y email son requeridos');
      return;
    }

    if (!this.empleadoEditar && !this.formulario.password) {
      this.modalService.showError('La contraseña es requerida');
      return;
    }

    this.guardando = true;

    const observable = this.empleadoEditar
      ? this.adminService.actualizarEmpleado(this.empleadoEditar.id, this.formulario)
      : this.adminService.crearEmpleado(this.formulario);

    observable.subscribe({
      next: (response) => {
        this.guardando = false;
        if (response.ok) {
          this.modalService.showSuccess(
            this.empleadoEditar ? 'Usuario actualizado' : 'Usuario creado exitosamente'
          );
          this.cerrarModal();
          this.cargarEmpleados();
        } else {
          this.modalService.showError(response.error || 'Error al guardar');
        }
      },
      error: (error) => {
        this.guardando = false;
        this.modalService.showError(error.error?.error || 'Error al guardar usuario');
      }
    });
  }

  desactivarEmpleado(empleado: Empleado): void {
    if (confirm(`¿Desactivar a ${empleado.nombre}?`)) {
      this.adminService.actualizarEmpleado(empleado.id, { activo: false }).subscribe({
        next: () => {
          this.modalService.showSuccess('Usuario desactivado');
          this.cargarEmpleados();
        },
        error: () => this.modalService.showError('Error al desactivar')
      });
    }
  }

  activarEmpleado(empleado: Empleado): void {
    this.adminService.actualizarEmpleado(empleado.id, { activo: true }).subscribe({
      next: () => {
        this.modalService.showSuccess('Usuario activado');
        this.cargarEmpleados();
      },
      error: () => this.modalService.showError('Error al activar')
    });
  }
}

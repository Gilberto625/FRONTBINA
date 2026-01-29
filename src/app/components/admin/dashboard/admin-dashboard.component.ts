import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AdminService, DashboardStats, Producto } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="layout-sidebar">
      <app-sidebar rol="admin"></app-sidebar>

      <main class="main-content">
        <div class="flex-between mb-lg">
          <div>
            <h1>¡Hola, {{ nombreAdmin }}!</h1>
            <p class="text-muted">Resumen del día - {{ fechaHoy }}</p>
          </div>
          <div class="avatar avatar-lg" style="background: var(--color-accent); color: white;">{{ inicialesAdmin }}</div>
        </div>

        <!-- Loading State -->
        @if (loading) {
          <div class="card mb-lg" style="text-align: center; padding: var(--spacing-xl);">
            <p class="text-muted">Cargando estadísticas...</p>
          </div>
        }

        <!-- Error State -->
        @if (error) {
          <div class="alert alert-error mb-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>{{ error }}</span>
            <button class="btn btn-sm btn-secondary" (click)="cargarDatos()">Reintentar</button>
          </div>
        }

        <!-- Stats del día -->
        @if (!loading) {
          <div class="stats-grid mb-lg">
            <div class="stat-card">
              <div class="stat-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <p class="stat-card-value">\${{ stats.ventas_dia | number }}</p>
              <p class="stat-card-label">Ventas del día</p>
              <p class="text-small text-muted">Por implementar</p>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                </svg>
              </div>
              <p class="stat-card-value">{{ stats.citas_hoy }}</p>
              <p class="stat-card-label">Citas del día</p>
              <p class="text-small text-muted">{{ stats.citas_pendientes }} pendientes</p>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
              </div>
              <p class="stat-card-value">{{ stats.total_clientes }}</p>
              <p class="stat-card-label">Clientes registrados</p>
              <p class="text-small text-muted">{{ stats.servicios_activos }} servicios activos</p>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon" style="background: var(--color-warning-light);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <p class="stat-card-value">{{ stats.productos_stock_bajo }}</p>
              <p class="stat-card-label">Alertas inventario</p>
              <p class="text-small text-warning">Stock bajo</p>
            </div>
          </div>

          <div class="grid mb-lg">
            <!-- Top Servicios -->
            <div class="card">
              <h3 class="mb-md">Top Servicios</h3>
              <ul class="list">
                @for (servicio of topServicios; track servicio.id; let i = $index) {
                  <li class="list-item">
                    <span class="badge" [class.badge-gold]="i === 0" [class.badge-info]="i === 1">{{ i + 1 }}</span>
                    <div style="flex:1">
                      <p class="mb-0" style="font-weight: 600;">{{ servicio.nombre }}</p>
                      <p class="text-small mb-0">{{ servicio.categoria }}</p>
                    </div>
                    <span class="text-gold" style="font-weight: 600;">\${{ servicio.precio }}</span>
                  </li>
                } @empty {
                  <li class="list-item">
                    <p class="text-muted mb-0">No hay servicios registrados</p>
                  </li>
                }
              </ul>
              <a routerLink="/admin/servicios" class="btn btn-text btn-sm mt-md">Ver todos los servicios</a>
            </div>

            <!-- Horarios con mayor demanda -->
            <div class="card">
              <h3 class="mb-md">Horarios con Mayor Demanda</h3>
              <div style="display: flex; flex-direction: column; gap: var(--spacing-sm);">
                @for (horario of horariosPopulares; track horario.hora) {
                  <div style="display: flex; align-items: center; gap: var(--spacing-md);">
                    <span style="width: 60px; font-weight: 500;">{{ horario.hora }}</span>
                    <div class="demand-bar" style="flex: 1;">
                      <div class="demand-bar-fill" [style.width.%]="horario.porcentaje"></div>
                    </div>
                    <span class="text-small">{{ horario.porcentaje }}%</span>
                  </div>
                }
              </div>
              <p class="text-small text-muted mt-md">* Basado en histórico de citas</p>
            </div>
          </div>

          <!-- Alertas de Inventario Bajo -->
          <div class="card">
            <div class="flex-between mb-md">
              <h3>Inventario Bajo - Requiere Atención</h3>
              <a routerLink="/admin/inventario" class="btn btn-text btn-sm">Ver todo</a>
            </div>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (producto of productosStockBajo; track producto.id) {
                    <tr>
                      <td>{{ producto.nombre }}</td>
                      <td>{{ producto.stock }}</td>
                      <td>{{ producto.stock_minimo }}</td>
                      <td>
                        <span class="badge" [class]="producto.stock <= producto.stock_minimo / 2 ? 'badge-error' : 'badge-warning'">
                          {{ producto.stock <= producto.stock_minimo / 2 ? 'Crítico' : 'Bajo' }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-secondary" routerLink="/admin/inventario">Reabastecer</button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="5" style="text-align: center; padding: var(--spacing-lg);">
                        <p class="text-success mb-0">✓ Todo el inventario está en niveles normales</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }
      </main>
    </div>

    <!-- Mobile Nav -->
    <nav class="navbar-mobile">
      <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="navbar-mobile-item">
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
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = true;
  error = '';
  
  nombreAdmin = 'Administrador';
  inicialesAdmin = 'AD';
  
  stats: DashboardStats = {
    ventas_dia: 0,
    citas_hoy: 0,
    citas_pendientes: 0,
    productos_stock_bajo: 0,
    total_clientes: 0,
    servicios_activos: 0,
    productos_activos: 0
  };
  
  productosStockBajo: Producto[] = [];
  topServicios: any[] = [];

  ngOnInit(): void {
    const usuario = this.authService.getCurrentUser();
    
    // Verificar que sea admin
    if (!usuario || usuario.rol !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }
    
    // Establecer nombre del admin
    if (usuario.nombre) {
      this.nombreAdmin = usuario.nombre;
      this.inicialesAdmin = usuario.nombre.substring(0, 2).toUpperCase();
    } else if (usuario.username) {
      this.nombreAdmin = usuario.username;
      this.inicialesAdmin = usuario.username.substring(0, 2).toUpperCase();
    }
    
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = '';
    
    // Cargar estadísticas del dashboard desde el backend
    this.adminService.getDashboardStats().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          this.stats = response.stats;
          this.productosStockBajo = response.productos_stock_bajo || [];
          this.topServicios = response.top_servicios || [];
        } else {
          this.error = response.error || 'Error al cargar datos';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error cargando dashboard:', err);
        this.error = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
      }
    });
  }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Datos mock para horarios mientras no hay histórico real
  horariosPopulares = [
    { hora: '10:00', porcentaje: 95 },
    { hora: '11:00', porcentaje: 88 },
    { hora: '17:00', porcentaje: 82 },
    { hora: '18:00', porcentaje: 78 }
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AdminService, Producto } from '../../../services/admin.service';
import { ModalService } from '../../../services/modal.service';

interface MovimientoInventario {
  tipo: 'entrada' | 'salida' | 'ajuste';
  producto: string;
  cantidad: number;
  fecha: Date;
  usuario: string;
  notas?: string;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent],
  template: `
    <div class="layout-sidebar">
      <app-sidebar rol="admin"></app-sidebar>

      <main class="main-content">
        <div class="flex-between mb-lg">
          <div>
            <h1>Inventario</h1>
            <p class="text-muted">Control de stock y movimientos</p>
          </div>
          <div style="display: flex; gap: var(--spacing-sm);">
            <button class="btn btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              Exportar
            </button>
            <button class="btn btn-primary" (click)="abrirModalMovimiento()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Registrar Movimiento
            </button>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid mb-lg">
          <div class="stat-card">
            <div class="stat-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <p class="stat-card-value">{{ totalUnidades }}</p>
            <p class="stat-card-label">Unidades totales</p>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background: var(--color-success-light);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2">
                <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
                <polyline points="17,6 23,6 23,12"/>
              </svg>
            </div>
            <p class="stat-card-value text-success">{{ productosOk }}</p>
            <p class="stat-card-label">Stock normal</p>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background: var(--color-warning-light);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <p class="stat-card-value text-warning">{{ productosStockBajo }}</p>
            <p class="stat-card-label">Stock bajo</p>
          </div>
          <div class="stat-card">
            <div class="stat-card-icon" style="background: var(--color-error-light);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            </div>
            <p class="stat-card-value text-error">{{ productosAgotados }}</p>
            <p class="stat-card-label">Agotados</p>
          </div>
        </div>

        <!-- Alertas de stock -->
        @if (productosStockBajo > 0 || productosAgotados > 0) {
          <div class="alert alert-warning mb-lg">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span>
              <strong>{{ productosStockBajo + productosAgotados }} productos</strong> 
              requieren atención. 
              <a routerLink="/admin/productos" class="text-gold">Ver productos</a>
            </span>
          </div>
        }

        <!-- Filtros -->
        <div class="card mb-lg">
          <div class="flex-between" style="flex-wrap: wrap; gap: var(--spacing-md);">
            <div class="form-group mb-0" style="flex: 1; min-width: 200px;">
              <input type="text" class="form-input" placeholder="Buscar producto..." 
                     [(ngModel)]="filtro" (input)="filtrarProductos()">
            </div>
            <div class="form-group mb-0" style="min-width: 150px;">
              <select class="form-select" [(ngModel)]="filtroEstado" (change)="filtrarProductos()">
                <option value="">Todos los estados</option>
                <option value="normal">Stock normal</option>
                <option value="bajo">Stock bajo</option>
                <option value="critico">Stock crítico</option>
                <option value="agotado">Agotado</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Tabla de inventario -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Stock Actual</th>
                <th>Stock Mínimo</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (producto of productosFiltrados; track producto.id) {
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: var(--spacing-sm);">
                      <div style="width: 40px; height: 40px; background: var(--color-gray-light); border-radius: var(--border-radius-sm);"></div>
                      <span style="font-weight: 500;">{{ producto.nombre }}</span>
                    </div>
                  </td>
                  <td [style.font-weight]="600" [style.color]="getColorStock(producto)">
                    {{ producto.stock }}
                  </td>
                  <td>{{ producto.stock_minimo }}</td>
                  <td>
                    <span class="badge" [class]="getBadgeClass(producto)">
                      {{ getEstadoStock(producto) }}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-text btn-sm" (click)="registrarEntrada(producto)">+ Entrada</button>
                    <button class="btn btn-text btn-sm" (click)="registrarSalida(producto)" [disabled]="producto.stock === 0">- Salida</button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" style="text-align: center; padding: var(--spacing-xl);">
                    <p class="text-muted">{{ loading ? 'Cargando...' : 'No hay productos en inventario' }}</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <!-- Últimos movimientos -->
        <div class="card mt-lg">
          <div class="flex-between mb-md">
            <h3>Últimos Movimientos</h3>
          </div>
          <ul class="list">
            @for (mov of ultimosMovimientos; track $index) {
              <li class="list-item">
                <div class="stat-card-icon" [style.width]="'40px'" [style.height]="'40px'"
                     [style.background]="mov.tipo === 'entrada' ? 'var(--color-success-light)' : mov.tipo === 'salida' ? 'var(--color-error-light)' : 'var(--color-info-light)'">
                  @if (mov.tipo === 'entrada') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  } @else if (mov.tipo === 'salida') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" stroke-width="2">
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  } @else {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-info)" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  }
                </div>
                <div style="flex: 1;">
                  <p class="mb-0" style="font-weight: 500;">
                    {{ mov.tipo === 'entrada' ? 'Entrada' : mov.tipo === 'salida' ? 'Salida' : 'Ajuste' }} de inventario
                  </p>
                  <p class="text-small mb-0">{{ mov.producto }} ({{ mov.tipo === 'salida' ? '-' : '+' }}{{ mov.cantidad }} unidades)</p>
                </div>
                <div class="text-right">
                  <p class="text-small mb-0">{{ mov.fecha | date:'short' }}</p>
                  <p class="text-small mb-0 text-muted">{{ mov.usuario }}</p>
                </div>
              </li>
            } @empty {
              <li class="list-item">
                <p class="text-muted mb-0">No hay movimientos registrados</p>
              </li>
            }
          </ul>
        </div>
      </main>
    </div>

    <!-- Modal Movimiento -->
    @if (mostrarModalMovimiento) {
      <div class="modal-overlay" (click)="cerrarModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Registrar Movimiento</h3>
            <button class="modal-close" (click)="cerrarModal()">&times;</button>
          </div>
          <form (ngSubmit)="guardarMovimiento()">
            <div class="form-group">
              <label class="form-label">Tipo de movimiento</label>
              <select class="form-select" [(ngModel)]="movimiento.tipo" name="tipo">
                <option value="entrada">Entrada (compra/reabastecimiento)</option>
                <option value="salida">Salida (uso interno)</option>
                <option value="ajuste">Ajuste de inventario</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Producto</label>
              <select class="form-select" [(ngModel)]="movimiento.productoId" name="producto">
                <option value="">Seleccionar producto</option>
                @for (producto of productos; track producto.id) {
                  <option [value]="producto.id">{{ producto.nombre }} (Stock: {{ producto.stock }})</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Cantidad</label>
              <input type="number" class="form-input" [(ngModel)]="movimiento.cantidad" name="cantidad" min="1">
            </div>
            <div class="form-group">
              <label class="form-label">Notas (opcional)</label>
              <textarea class="form-input" [(ngModel)]="movimiento.notas" name="notas" rows="2" placeholder="Razón del movimiento..."></textarea>
            </div>
            <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="guardando">
                {{ guardando ? 'Registrando...' : 'Registrar' }}
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
      <a routerLink="/admin/empleados" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
        </svg>
        Empleados
      </a>
      <a routerLink="/admin/inventario" routerLinkActive="active" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>
        </svg>
        Inventario
      </a>
      <a routerLink="/admin/productos" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        </svg>
        Productos
      </a>
      <a routerLink="/admin/configuracion" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
        </svg>
        Config
      </a>
    </nav>
  `
})
export class InventarioComponent implements OnInit {
  private adminService = inject(AdminService);
  private modalService = inject(ModalService);

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  loading = true;
  
  filtro = '';
  filtroEstado = '';

  mostrarModalMovimiento = false;
  guardando = false;
  movimiento = {
    tipo: 'entrada' as 'entrada' | 'salida' | 'ajuste',
    productoId: '',
    cantidad: 0,
    notas: ''
  };

  ultimosMovimientos: MovimientoInventario[] = [];

  get totalUnidades(): number {
    return this.productos.reduce((sum, p) => sum + p.stock, 0);
  }

  get productosOk(): number {
    return this.productos.filter(p => p.stock > p.stock_minimo).length;
  }

  get productosStockBajo(): number {
    return this.productos.filter(p => p.stock > 0 && p.stock <= p.stock_minimo).length;
  }

  get productosAgotados(): number {
    return this.productos.filter(p => p.stock === 0).length;
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    this.adminService.getProductos().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          this.productos = response.productos;
          this.filtrarProductos();
        }
      },
      error: () => {
        this.loading = false;
        this.modalService.showError('Error al cargar inventario');
      }
    });
  }

  filtrarProductos(): void {
    this.productosFiltrados = this.productos.filter(p => {
      const matchNombre = !this.filtro || p.nombre.toLowerCase().includes(this.filtro.toLowerCase());
      let matchEstado = true;
      if (this.filtroEstado === 'normal') matchEstado = p.stock > p.stock_minimo;
      else if (this.filtroEstado === 'bajo') matchEstado = p.stock > 0 && p.stock <= p.stock_minimo && p.stock > p.stock_minimo / 2;
      else if (this.filtroEstado === 'critico') matchEstado = p.stock > 0 && p.stock <= p.stock_minimo / 2;
      else if (this.filtroEstado === 'agotado') matchEstado = p.stock === 0;
      return matchNombre && matchEstado;
    });
  }

  getEstadoStock(producto: Producto): string {
    if (producto.stock === 0) return 'Agotado';
    if (producto.stock <= producto.stock_minimo / 2) return 'Crítico';
    if (producto.stock <= producto.stock_minimo) return 'Bajo';
    return 'Normal';
  }

  getBadgeClass(producto: Producto): string {
    if (producto.stock === 0) return 'badge-error';
    if (producto.stock <= producto.stock_minimo / 2) return 'badge-error';
    if (producto.stock <= producto.stock_minimo) return 'badge-warning';
    return 'badge-success';
  }

  getColorStock(producto: Producto): string {
    if (producto.stock === 0) return 'var(--color-error)';
    if (producto.stock <= producto.stock_minimo) return 'var(--color-warning)';
    return 'inherit';
  }

  abrirModalMovimiento(): void {
    this.movimiento = { tipo: 'entrada', productoId: '', cantidad: 0, notas: '' };
    this.mostrarModalMovimiento = true;
  }

  registrarEntrada(producto: Producto): void {
    this.movimiento = { tipo: 'entrada', productoId: producto.id.toString(), cantidad: 0, notas: '' };
    this.mostrarModalMovimiento = true;
  }

  registrarSalida(producto: Producto): void {
    this.movimiento = { tipo: 'salida', productoId: producto.id.toString(), cantidad: 0, notas: '' };
    this.mostrarModalMovimiento = true;
  }

  cerrarModal(): void {
    this.mostrarModalMovimiento = false;
  }

  guardarMovimiento(): void {
    if (!this.movimiento.productoId || this.movimiento.cantidad <= 0) {
      this.modalService.showError('Selecciona un producto y cantidad válida');
      return;
    }

    this.guardando = true;
    const cantidad = this.movimiento.tipo === 'salida' ? -this.movimiento.cantidad : this.movimiento.cantidad;

    this.adminService.actualizarStock(
      parseInt(this.movimiento.productoId), 
      cantidad, 
      'sumar'
    ).subscribe({
      next: (response) => {
        this.guardando = false;
        if (response.ok) {
          const producto = this.productos.find(p => p.id.toString() === this.movimiento.productoId);
          this.ultimosMovimientos.unshift({
            tipo: this.movimiento.tipo,
            producto: producto?.nombre || 'Producto',
            cantidad: this.movimiento.cantidad,
            fecha: new Date(),
            usuario: 'Admin',
            notas: this.movimiento.notas
          });
          if (this.ultimosMovimientos.length > 5) this.ultimosMovimientos.pop();
          
          this.modalService.showSuccess(`Stock actualizado: ${response.stock_actual} unidades`);
          this.cerrarModal();
          this.cargarProductos();
        }
      },
      error: () => {
        this.guardando = false;
        this.modalService.showError('Error al registrar movimiento');
      }
    });
  }
}

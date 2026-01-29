import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AdminService, Producto } from '../../../services/admin.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent],
  template: `
    <div class="layout-sidebar">
      <app-sidebar rol="admin"></app-sidebar>

      <main class="main-content">
        <div class="flex-between mb-lg">
          <div>
            <h1>Productos</h1>
            <p class="text-muted">Catálogo de productos para venta</p>
          </div>
          <button class="btn btn-primary" (click)="abrirModalCrear()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nuevo Producto
          </button>
        </div>

        <!-- Filtros -->
        <div class="card mb-lg">
          <div class="flex-between" style="flex-wrap: wrap; gap: var(--spacing-md);">
            <div class="form-group mb-0" style="flex: 1; min-width: 200px;">
              <input type="text" class="form-input" placeholder="Buscar producto..." 
                     [(ngModel)]="filtro" (input)="filtrarProductos()">
            </div>
            <div class="form-group mb-0" style="min-width: 150px;">
              <select class="form-select" [(ngModel)]="filtroCategoria" (change)="filtrarProductos()">
                <option value="">Todas las categorías</option>
                <option value="cabello">Cabello</option>
                <option value="barba">Barba</option>
                <option value="accesorios">Accesorios</option>
                <option value="kit">Kits</option>
              </select>
            </div>
            <div class="form-group mb-0" style="min-width: 150px;">
              <select class="form-select" [(ngModel)]="filtroEstado" (change)="filtrarProductos()">
                <option value="">Todos los estados</option>
                <option value="disponible">Disponible</option>
                <option value="bajo">Stock bajo</option>
                <option value="agotado">Agotado</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="stats-grid mb-lg">
          <div class="stat-card">
            <p class="stat-card-value">{{ productos.length }}</p>
            <p class="stat-card-label">Total productos</p>
          </div>
          <div class="stat-card">
            <p class="stat-card-value text-success">{{ productosDisponibles }}</p>
            <p class="stat-card-label">Disponibles</p>
          </div>
          <div class="stat-card">
            <p class="stat-card-value text-warning">{{ productosStockBajo }}</p>
            <p class="stat-card-label">Stock bajo</p>
          </div>
          <div class="stat-card">
            <p class="stat-card-value text-error">{{ productosAgotados }}</p>
            <p class="stat-card-label">Agotados</p>
          </div>
        </div>

        <!-- Grid de productos -->
        <div class="grid grid-3">
          @for (producto of productosFiltrados; track producto.id) {
            <div class="card product-card">
              @if (producto.imagen_url) {
                <img [src]="producto.imagen_url" [alt]="producto.nombre" class="product-image">
              } @else {
                <div class="product-image-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              }
              <div class="flex-between mb-sm">
                <span class="badge badge-gold">{{ getCategoriaLabel(producto.categoria) }}</span>
                <span class="badge" [class.badge-success]="producto.stock > producto.stock_minimo"
                      [class.badge-warning]="producto.stock > 0 && producto.stock <= producto.stock_minimo"
                      [class.badge-error]="producto.stock === 0">
                  {{ getEstadoStock(producto) }}
                </span>
              </div>
              <h4 class="mb-xs">{{ producto.nombre }}</h4>
              <p class="text-small mb-sm">{{ producto.descripcion | slice:0:50 }}{{ producto.descripcion && producto.descripcion.length > 50 ? '...' : '' }}</p>
              <div class="flex-between">
                <span class="text-gold" style="font-weight: 600; font-size: 18px;">\${{ producto.precio }}</span>
                <span class="text-small" [class.text-warning]="producto.stock <= producto.stock_minimo"
                      [class.text-error]="producto.stock === 0">
                  Stock: {{ producto.stock }}
                </span>
              </div>
              <div style="display: flex; gap: var(--spacing-xs); margin-top: var(--spacing-md);">
                <button class="btn btn-secondary btn-sm" style="flex: 1;" (click)="editarProducto(producto)">Editar</button>
                @if (producto.stock === 0) {
                  <button class="btn btn-primary btn-sm" (click)="abrirModalStock(producto)">Reabastecer</button>
                } @else {
                  <button class="btn btn-text btn-sm text-error" (click)="toggleEstado(producto)">
                    {{ producto.activo ? 'Desactivar' : 'Activar' }}
                  </button>
                }
              </div>
            </div>
          } @empty {
            <div class="card" style="grid-column: 1 / -1; text-align: center; padding: var(--spacing-xl);">
              <p class="text-muted">{{ loading ? 'Cargando...' : 'No hay productos registrados' }}</p>
            </div>
          }
        </div>
      </main>
    </div>

    <!-- Modal Crear/Editar -->
    @if (mostrarModal) {
      <div class="modal-overlay" (click)="cerrarModal()">
        <div class="modal" style="max-width: 550px;" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ productoEditar ? 'Editar' : 'Nuevo' }} Producto</h3>
            <button class="modal-close" (click)="cerrarModal()">&times;</button>
          </div>
          <form (ngSubmit)="guardarProducto()">
            <!-- Imagen del producto -->
            <div class="form-group">
              <label class="form-label">Imagen del producto</label>
              <div class="image-upload-container">
                @if (imagenPreview || formulario.imagen_url) {
                  <div class="image-preview">
                    <img [src]="imagenPreview || formulario.imagen_url" alt="Preview">
                    <button type="button" class="btn-remove-image" (click)="eliminarImagen()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                } @else {
                  <label class="image-upload-box" for="imagen-producto">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>Click para subir imagen</span>
                    <span class="text-small">JPG, PNG (máx. 2MB)</span>
                  </label>
                }
                <input type="file" id="imagen-producto" accept="image/*" 
                       style="display: none;" (change)="onImagenSeleccionada($event)">
              </div>
              @if (subiendoImagen) {
                <p class="text-small text-info mt-sm">Subiendo imagen...</p>
              }
            </div>

            <div class="form-group">
              <label class="form-label">Nombre *</label>
              <input type="text" class="form-input" [(ngModel)]="formulario.nombre" name="nombre" required>
            </div>
            <div class="form-group">
              <label class="form-label">Descripción</label>
              <textarea class="form-input" [(ngModel)]="formulario.descripcion" name="descripcion" rows="2"></textarea>
            </div>
            <div class="grid">
              <div class="form-group">
                <label class="form-label">Precio *</label>
                <input type="number" class="form-input" [(ngModel)]="formulario.precio" name="precio" min="0" required>
              </div>
              <div class="form-group">
                <label class="form-label">Categoría *</label>
                <select class="form-select" [(ngModel)]="formulario.categoria" name="categoria" required>
                  <option value="cabello">Cabello</option>
                  <option value="barba">Barba</option>
                  <option value="accesorios">Accesorios</option>
                  <option value="kit">Kit</option>
                </select>
              </div>
            </div>
            <div class="grid">
              <div class="form-group">
                <label class="form-label">Stock inicial</label>
                <input type="number" class="form-input" [(ngModel)]="formulario.stock" name="stock" min="0">
              </div>
              <div class="form-group">
                <label class="form-label">Stock mínimo</label>
                <input type="number" class="form-input" [(ngModel)]="formulario.stock_minimo" name="stock_minimo" min="0">
              </div>
            </div>
            <div class="form-group">
              <label style="display: flex; align-items: center; gap: var(--spacing-sm); cursor: pointer;">
                <input type="checkbox" [(ngModel)]="formulario.destacado" name="destacado" style="width: 18px; height: 18px;">
                <span>Marcar como destacado</span>
              </label>
            </div>
            <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" (click)="cerrarModal()">Cancelar</button>
              <button type="submit" class="btn btn-primary" [disabled]="guardando || subiendoImagen">
                {{ guardando ? 'Guardando...' : (subiendoImagen ? 'Subiendo imagen...' : 'Guardar') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Modal Stock -->
    @if (mostrarModalStock) {
      <div class="modal-overlay" (click)="cerrarModalStock()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Actualizar Stock</h3>
            <button class="modal-close" (click)="cerrarModalStock()">&times;</button>
          </div>
          <form (ngSubmit)="guardarStock()">
            <p class="mb-md">Producto: <strong>{{ productoStock?.nombre }}</strong></p>
            <p class="mb-md">Stock actual: <strong>{{ productoStock?.stock }}</strong></p>
            <div class="form-group">
              <label class="form-label">Cantidad a agregar</label>
              <input type="number" class="form-input" [(ngModel)]="cantidadStock" name="cantidad" min="1" required>
            </div>
            <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" (click)="cerrarModalStock()">Cancelar</button>
              <button type="submit" class="btn btn-primary">Agregar Stock</button>
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
      <a routerLink="/admin/servicios" class="navbar-mobile-item">
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
      <a routerLink="/admin/configuracion" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
        </svg>
        Config
      </a>
    </nav>
  `,
  styles: [`
    .product-card {
      display: flex;
      flex-direction: column;
    }
    .product-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-md);
    }
    .product-image-placeholder {
      width: 100%;
      height: 150px;
      background: var(--color-gray-light);
      border-radius: var(--border-radius-md);
      margin-bottom: var(--spacing-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-gray);
    }
    .image-upload-container {
      margin-bottom: var(--spacing-sm);
    }
    .image-upload-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-sm);
      padding: var(--spacing-xl);
      border: 2px dashed var(--border-color);
      border-radius: var(--border-radius-md);
      cursor: pointer;
      transition: all 0.2s;
      color: var(--color-gray);
    }
    .image-upload-box:hover {
      border-color: var(--color-accent);
      background: rgba(var(--color-accent-rgb), 0.05);
    }
    .image-preview {
      position: relative;
      display: inline-block;
    }
    .image-preview img {
      max-width: 200px;
      max-height: 150px;
      object-fit: cover;
      border-radius: var(--border-radius-md);
    }
    .btn-remove-image {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--color-error);
      color: white;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-remove-image:hover {
      background: #c0392b;
    }
  `]
})
export class ProductosListaComponent implements OnInit {
  private adminService = inject(AdminService);
  private modalService = inject(ModalService);

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  loading = true;
  
  filtro = '';
  filtroCategoria = '';
  filtroEstado = '';

  mostrarModal = false;
  productoEditar: Producto | null = null;
  guardando = false;
  subiendoImagen = false;
  imagenPreview: string | null = null;
  imagenFile: File | null = null;

  formulario = {
    nombre: '',
    descripcion: '',
    precio: 0,
    categoria: 'cabello',
    stock: 0,
    stock_minimo: 10,
    imagen_url: '',
    destacado: false
  };

  mostrarModalStock = false;
  productoStock: Producto | null = null;
  cantidadStock = 0;

  get productosDisponibles(): number {
    return this.productos.filter(p => p.activo && p.stock > 0).length;
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
        this.modalService.showError('Error al cargar productos');
      }
    });
  }

  filtrarProductos(): void {
    this.productosFiltrados = this.productos.filter(p => {
      const matchNombre = !this.filtro || p.nombre.toLowerCase().includes(this.filtro.toLowerCase());
      const matchCategoria = !this.filtroCategoria || p.categoria === this.filtroCategoria;
      let matchEstado = true;
      if (this.filtroEstado === 'disponible') matchEstado = p.stock > p.stock_minimo;
      else if (this.filtroEstado === 'bajo') matchEstado = p.stock > 0 && p.stock <= p.stock_minimo;
      else if (this.filtroEstado === 'agotado') matchEstado = p.stock === 0;
      return matchNombre && matchCategoria && matchEstado;
    });
  }

  getCategoriaLabel(categoria: string): string {
    const labels: Record<string, string> = {
      'cabello': 'Cabello',
      'barba': 'Barba',
      'accesorios': 'Accesorios',
      'kit': 'Kits'
    };
    return labels[categoria] || categoria;
  }

  getEstadoStock(producto: Producto): string {
    if (producto.stock === 0) return 'Agotado';
    if (producto.stock <= producto.stock_minimo) return 'Stock bajo';
    return 'Disponible';
  }

  abrirModalCrear(): void {
    this.productoEditar = null;
    this.imagenPreview = null;
    this.imagenFile = null;
    this.formulario = {
      nombre: '',
      descripcion: '',
      precio: 0,
      categoria: 'cabello',
      stock: 0,
      stock_minimo: 10,
      imagen_url: '',
      destacado: false
    };
    this.mostrarModal = true;
  }

  editarProducto(producto: Producto): void {
    this.productoEditar = producto;
    this.imagenPreview = null;
    this.imagenFile = null;
    this.formulario = {
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: Number(producto.precio),
      categoria: producto.categoria,
      stock: producto.stock,
      stock_minimo: producto.stock_minimo,
      imagen_url: producto.imagen_url || '',
      destacado: producto.destacado
    };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.productoEditar = null;
    this.imagenPreview = null;
    this.imagenFile = null;
  }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    
    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.modalService.showError('La imagen no debe superar 2MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      this.modalService.showError('Solo se permiten archivos de imagen');
      return;
    }

    this.imagenFile = file;

    // Preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagenPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  eliminarImagen(): void {
    this.imagenPreview = null;
    this.imagenFile = null;
    this.formulario.imagen_url = '';
  }

  async guardarProducto(): Promise<void> {
    if (!this.formulario.nombre || !this.formulario.precio) {
      this.modalService.showError('Nombre y precio son requeridos');
      return;
    }

    this.guardando = true;

    try {
      // Si hay una imagen nueva para subir
      if (this.imagenFile) {
        this.subiendoImagen = true;
        
        const uploadResponse = await this.adminService.uploadImage(
          this.imagenFile, 
          'productos'
        ).toPromise();
        
        this.subiendoImagen = false;
        
        if (uploadResponse?.ok) {
          this.formulario.imagen_url = uploadResponse.url;
        } else {
          throw new Error('Error al subir imagen');
        }
      }

      // Guardar el producto
      const observable = this.productoEditar
        ? this.adminService.actualizarProducto(this.productoEditar.id, this.formulario)
        : this.adminService.crearProducto(this.formulario);

      observable.subscribe({
        next: (response) => {
          this.guardando = false;
          if (response.ok) {
            this.modalService.showSuccess(
              this.productoEditar ? 'Producto actualizado' : 'Producto creado exitosamente'
            );
            this.cerrarModal();
            this.cargarProductos();
          } else {
            this.modalService.showError(response.error || 'Error al guardar');
          }
        },
        error: (error) => {
          this.guardando = false;
          this.modalService.showError(error.error?.error || 'Error al guardar producto');
        }
      });
    } catch (error: any) {
      this.guardando = false;
      this.subiendoImagen = false;
      this.modalService.showError(error.message || 'Error al subir imagen');
    }
  }

  toggleEstado(producto: Producto): void {
    const nuevoEstado = !producto.activo;
    this.adminService.actualizarProducto(producto.id, { activo: nuevoEstado }).subscribe({
      next: () => {
        this.modalService.showSuccess(nuevoEstado ? 'Producto activado' : 'Producto desactivado');
        this.cargarProductos();
      },
      error: () => this.modalService.showError('Error al cambiar estado')
    });
  }

  abrirModalStock(producto: Producto): void {
    this.productoStock = producto;
    this.cantidadStock = 0;
    this.mostrarModalStock = true;
  }

  cerrarModalStock(): void {
    this.mostrarModalStock = false;
    this.productoStock = null;
  }

  guardarStock(): void {
    if (!this.productoStock || this.cantidadStock <= 0) return;

    this.adminService.actualizarStock(this.productoStock.id, this.cantidadStock, 'sumar').subscribe({
      next: (response) => {
        if (response.ok) {
          this.modalService.showSuccess(`Stock actualizado: ${response.stock_actual} unidades`);
          this.cerrarModalStock();
          this.cargarProductos();
        }
      },
      error: () => this.modalService.showError('Error al actualizar stock')
    });
  }
}

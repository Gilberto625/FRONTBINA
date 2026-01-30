import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { AdminService, Producto } from '../../../services/admin.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent, BreadcrumbComponent],
  templateUrl: './productos-lista.component.html',
  styleUrl: './productos-lista.component.css'
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
    // Prevenir propagación del evento
    event?.stopPropagation();
    event?.preventDefault();
    
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
    
    // Usar setTimeout para asegurar que el modal se muestre después del ciclo de detección de cambios
    setTimeout(() => {
      this.mostrarModal = true;
    }, 0);
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
    
    if (file.size > 2 * 1024 * 1024) {
      this.modalService.showError('La imagen no debe superar 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.modalService.showError('Solo se permiten archivos de imagen');
      return;
    }

    this.imagenFile = file;

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

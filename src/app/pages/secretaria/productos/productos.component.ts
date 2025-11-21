import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { ProductosService } from '../../../services/productos.service';

interface ProductoGestion {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  marca: string;
  precio: number;
  precio_compra: number;
  stock: number;
  stock_minimo: number;
  codigo_barras?: string;
  imagen_principal?: string;
  activo: boolean;
  destacado: boolean;
  created_at: string;
  updated_at: string;
}

interface CategoriaProducto {
  id: number;
  nombre: string;
  descripcion?: string;
  activa: boolean;
}

@Component({
  selector: 'app-productos-gestion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosGestionComponent implements OnInit {
  productos: ProductoGestion[] = [];
  categorias: CategoriaProducto[] = [];
  productosFiltrados: ProductoGestion[] = [];
  
  isLoading = true;
  error: string | null = null;
  
  // Filtros
  filtroCategoria = 'todas';
  filtroStock = 'todos';
  busqueda = '';
  
  // Paginación
  paginaActual = 1;
  productosPorPagina = 15;
  totalPaginas = 0;
  
  // Modal producto
  mostrarModalProducto = false;
  modoModal: 'crear' | 'editar' = 'crear';
  productoActual: Partial<ProductoGestion> = {};
  
  // Modal stock
  mostrarModalStock = false;
  productoStock: ProductoGestion | null = null;
  nuevoStock = 0;
  motivoAjuste = '';

  // Mock data
  mockCategorias: CategoriaProducto[] = [
    { id: 1, nombre: 'Cuidado Capilar', descripcion: 'Productos para el cabello', activa: true },
    { id: 2, nombre: 'Cuidado de Barba', descripcion: 'Productos para barba', activa: true },
    { id: 3, nombre: 'Tratamientos', descripcion: 'Tratamientos especializados', activa: true },
    { id: 4, nombre: 'Accesorios', descripcion: 'Accesorios y herramientas', activa: true },
    { id: 5, nombre: 'Kits', descripcion: 'Kits y combos', activa: true }
  ];

  mockProductos: ProductoGestion[] = [
    {
      id: 1,
      nombre: 'Pomada para Cabello Premium',
      descripcion: 'Pomada de alta fijación para peinados modernos',
      categoria: 'Cuidado Capilar',
      marca: 'Tony Stylo',
      precio: 350,
      precio_compra: 200,
      stock: 25,
      stock_minimo: 10,
      codigo_barras: '7501234567890',
      imagen_principal: 'assets/images/pomada-premium.jpg',
      activo: true,
      destacado: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-15'
    },
    {
      id: 2,
      nombre: 'Aceite para Barba Nutritivo',
      descripcion: 'Aceite natural para el cuidado y nutrición de la barba',
      categoria: 'Cuidado de Barba',
      marca: 'Tony Stylo',
      precio: 280,
      precio_compra: 160,
      stock: 8,
      stock_minimo: 15,
      codigo_barras: '7501234567891',
      imagen_principal: 'assets/images/aceite-barba.jpg',
      activo: true,
      destacado: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-10'
    },
    {
      id: 3,
      nombre: 'Shampoo Anticaspa',
      descripcion: 'Shampoo especializado para eliminar la caspa',
      categoria: 'Cuidado Capilar',
      marca: 'Tony Stylo',
      precio: 220,
      precio_compra: 130,
      stock: 30,
      stock_minimo: 20,
      codigo_barras: '7501234567892',
      activo: true,
      destacado: false,
      created_at: '2024-01-01',
      updated_at: '2024-01-12'
    },
    {
      id: 4,
      nombre: 'Cera Moldeadora',
      descripcion: 'Cera flexible para peinados con movimiento',
      categoria: 'Cuidado Capilar',
      marca: 'Tony Stylo',
      precio: 320,
      precio_compra: 190,
      stock: 3,
      stock_minimo: 8,
      codigo_barras: '7501234567893',
      activo: true,
      destacado: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-08'
    },
    {
      id: 5,
      nombre: 'Kit Completo de Barba',
      descripcion: 'Kit con todo lo necesario para el cuidado de la barba',
      categoria: 'Kits',
      marca: 'Tony Stylo',
      precio: 650,
      precio_compra: 400,
      stock: 12,
      stock_minimo: 5,
      codigo_barras: '7501234567894',
      activo: true,
      destacado: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-16'
    }
  ];

  constructor(
    private authService: AuthService,
    private productosService: ProductosService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      // Usar datos mock
      this.categorias = this.mockCategorias;
      this.productos = this.mockProductos;
      
      this.aplicarFiltros();

    } catch (error) {
      console.error('Error loading data:', error);
      this.error = 'Error al cargar los datos de productos.';
    } finally {
      this.isLoading = false;
    }
  }

  aplicarFiltros(): void {
    let filtrados = [...this.productos];

    // Filtro por categoría
    if (this.filtroCategoria !== 'todas') {
      filtrados = filtrados.filter(p => p.categoria === this.filtroCategoria);
    }

    // Filtro por stock
    switch (this.filtroStock) {
      case 'bajo':
        filtrados = filtrados.filter(p => p.stock <= p.stock_minimo);
        break;
      case 'agotado':
        filtrados = filtrados.filter(p => p.stock === 0);
        break;
      case 'disponible':
        filtrados = filtrados.filter(p => p.stock > p.stock_minimo);
        break;
    }

    // Filtro por búsqueda
    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase().trim();
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino) ||
        p.marca.toLowerCase().includes(termino) ||
        p.codigo_barras?.includes(termino)
      );
    }

    this.productosFiltrados = filtrados;
    this.calcularPaginacion();
  }

  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.productosFiltrados.length / this.productosPorPagina);
    this.paginaActual = Math.min(this.paginaActual, this.totalPaginas || 1);
  }

  get productosPaginados(): ProductoGestion[] {
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;
    return this.productosFiltrados.slice(inicio, fin);
  }

  get productosStockBajo(): ProductoGestion[] {
    return this.productos.filter(p => p.stock <= p.stock_minimo && p.stock > 0);
  }

  get productosAgotados(): ProductoGestion[] {
    return this.productos.filter(p => p.stock === 0);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Gestión de productos
  abrirModalNuevoProducto(): void {
    this.modoModal = 'crear';
    this.productoActual = {
      nombre: '',
      descripcion: '',
      categoria: '',
      marca: 'Tony Stylo',
      precio: 0,
      precio_compra: 0,
      stock: 0,
      stock_minimo: 5,
      activo: true,
      destacado: false
    };
    this.mostrarModalProducto = true;
  }

  abrirModalEditarProducto(producto: ProductoGestion): void {
    this.modoModal = 'editar';
    this.productoActual = { ...producto };
    this.mostrarModalProducto = true;
  }

  cerrarModalProducto(): void {
    this.mostrarModalProducto = false;
    this.productoActual = {};
  }

  async guardarProducto(): Promise<void> {
    if (!this.validarProducto()) return;

    try {
      if (this.modoModal === 'crear') {
        const nuevoProducto: ProductoGestion = {
          ...this.productoActual as ProductoGestion,
          id: Date.now(), // Mock ID
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        this.productos.push(nuevoProducto);
        this.showToast('Producto creado exitosamente', 'success');
      } else {
        const index = this.productos.findIndex(p => p.id === this.productoActual.id);
        if (index >= 0) {
          this.productos[index] = {
            ...this.productoActual as ProductoGestion,
            updated_at: new Date().toISOString()
          };
          this.showToast('Producto actualizado exitosamente', 'success');
        }
      }

      this.aplicarFiltros();
      this.cerrarModalProducto();

    } catch (error) {
      console.error('Error guardando producto:', error);
      this.showToast('Error al guardar el producto', 'error');
    }
  }

  private validarProducto(): boolean {
    if (!this.productoActual.nombre?.trim()) {
      this.showToast('Ingresa el nombre del producto', 'error');
      return false;
    }
    if (!this.productoActual.categoria?.trim()) {
      this.showToast('Selecciona una categoría', 'error');
      return false;
    }
    if (!this.productoActual.precio || this.productoActual.precio <= 0) {
      this.showToast('Ingresa un precio válido', 'error');
      return false;
    }
    if (!this.productoActual.precio_compra || this.productoActual.precio_compra <= 0) {
      this.showToast('Ingresa un precio de compra válido', 'error');
      return false;
    }
    return true;
  }

  async eliminarProducto(producto: ProductoGestion): Promise<void> {
    if (!confirm(`¿Eliminar el producto "${producto.nombre}"?`)) return;

    try {
      const index = this.productos.findIndex(p => p.id === producto.id);
      if (index >= 0) {
        this.productos.splice(index, 1);
        this.aplicarFiltros();
        this.showToast('Producto eliminado', 'success');
      }
    } catch (error) {
      console.error('Error eliminando producto:', error);
      this.showToast('Error al eliminar el producto', 'error');
    }
  }

  async toggleActivo(producto: ProductoGestion): Promise<void> {
    try {
      producto.activo = !producto.activo;
      producto.updated_at = new Date().toISOString();
      this.showToast(`Producto ${producto.activo ? 'activado' : 'desactivado'}`, 'success');
    } catch (error) {
      console.error('Error cambiando estado:', error);
      this.showToast('Error al cambiar el estado', 'error');
    }
  }

  async toggleDestacado(producto: ProductoGestion): Promise<void> {
    try {
      producto.destacado = !producto.destacado;
      producto.updated_at = new Date().toISOString();
      this.showToast(`Producto ${producto.destacado ? 'destacado' : 'no destacado'}`, 'success');
    } catch (error) {
      console.error('Error cambiando destacado:', error);
      this.showToast('Error al cambiar destacado', 'error');
    }
  }

  // Gestión de stock
  abrirModalStock(producto: ProductoGestion): void {
    this.productoStock = producto;
    this.nuevoStock = producto.stock;
    this.motivoAjuste = '';
    this.mostrarModalStock = true;
  }

  cerrarModalStock(): void {
    this.mostrarModalStock = false;
    this.productoStock = null;
    this.nuevoStock = 0;
    this.motivoAjuste = '';
  }

  async actualizarStock(): Promise<void> {
    if (!this.productoStock || this.nuevoStock < 0) return;
    if (!this.motivoAjuste.trim()) {
      this.showToast('Ingresa el motivo del ajuste', 'error');
      return;
    }

    try {
      const diferencia = this.nuevoStock - this.productoStock.stock;
      this.productoStock.stock = this.nuevoStock;
      this.productoStock.updated_at = new Date().toISOString();
      
      this.cerrarModalStock();
      this.showToast(`Stock actualizado (${diferencia >= 0 ? '+' : ''}${diferencia})`, 'success');

    } catch (error) {
      console.error('Error actualizando stock:', error);
      this.showToast('Error al actualizar el stock', 'error');
    }
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 8px;
      color: white;
      background: ${type === 'success' ? '#4CAF50' : '#F44336'};
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Utilidades
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  getStockClass(producto: ProductoGestion): string {
    if (producto.stock === 0) return 'stock-agotado';
    if (producto.stock <= producto.stock_minimo) return 'stock-bajo';
    return 'stock-normal';
  }

  getStockText(producto: ProductoGestion): string {
    if (producto.stock === 0) return 'Agotado';
    if (producto.stock <= producto.stock_minimo) return 'Stock Bajo';
    return 'Disponible';
  }

  getMargenGanancia(producto: ProductoGestion): number {
    if (producto.precio_compra === 0) return 0;
    return ((producto.precio - producto.precio_compra) / producto.precio_compra) * 100;
  }

  limpiarFiltros(): void {
    this.filtroCategoria = 'todas';
    this.filtroStock = 'todos';
    this.busqueda = '';
    this.aplicarFiltros();
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductosService, Producto } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  categorias: string[] = [];
  
  // Filtros
  categoriaSeleccionada = 'Todas';
  busqueda = '';
  ordenPor = 'nombre';
  precioMin = 0;
  precioMax = 1000;
  
  // Estados
  isLoading = true;
  error: string | null = null;
  
  // Paginación
  paginaActual = 1;
  productosPorPagina = 12;
  totalPaginas = 0;

  constructor(
    private productosService: ProductosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadProductos();
  }

  private async loadProductos(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      const productos = await this.productosService.getProductos().toPromise();
      this.productos = productos || [];
      this.productosFiltrados = [...this.productos];
      
      // Extraer categorías únicas
      this.categorias = ['Todas', ...new Set(this.productos.map(p => p.categoria))];
      
      this.aplicarFiltros();
      this.calcularPaginacion();

    } catch (error) {
      console.error('Error loading productos:', error);
      this.error = 'Error al cargar los productos. Por favor, intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  aplicarFiltros(): void {
    let filtrados = [...this.productos];

    // Filtro por categoría
    if (this.categoriaSeleccionada !== 'Todas') {
      filtrados = filtrados.filter(p => p.categoria === this.categoriaSeleccionada);
    }

    // Filtro por búsqueda
    if (this.busqueda.trim()) {
      const termino = this.busqueda.toLowerCase().trim();
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        p.descripcion.toLowerCase().includes(termino) ||
        p.marca?.toLowerCase().includes(termino)
      );
    }

    // Filtro por precio
    filtrados = filtrados.filter(p => 
      p.precio >= this.precioMin && p.precio <= this.precioMax
    );

    // Ordenamiento
    filtrados.sort((a, b) => {
      switch (this.ordenPor) {
        case 'precio-asc':
          return a.precio - b.precio;
        case 'precio-desc':
          return b.precio - a.precio;
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'categoria':
          return a.categoria.localeCompare(b.categoria);
        default:
          return 0;
      }
    });

    this.productosFiltrados = filtrados;
    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.productosFiltrados.length / this.productosPorPagina);
  }

  get productosPaginados(): Producto[] {
    const inicio = (this.paginaActual - 1) * this.productosPorPagina;
    const fin = inicio + this.productosPorPagina;
    return this.productosFiltrados.slice(inicio, fin);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async agregarAlCarrito(producto: Producto): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      // Redirigir al login si no está autenticado
      this.authService.redirectToLogin();
      return;
    }

    try {
      await this.productosService.agregarAlCarrito(producto.id, 1).toPromise();
      
      // Mostrar mensaje de éxito
      this.showToast(`${producto.nombre} agregado al carrito`, 'success');
      
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      this.showToast('Error al agregar al carrito', 'error');
    }
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    // Implementación simple de toast
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

  limpiarFiltros(): void {
    this.categoriaSeleccionada = 'Todas';
    this.busqueda = '';
    this.ordenPor = 'nombre';
    this.precioMin = 0;
    this.precioMax = 1000;
    this.aplicarFiltros();
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get totalProductos(): number {
    return this.productosFiltrados.length;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'sin-stock';
    if (stock <= 5) return 'stock-bajo';
    return 'stock-normal';
  }

  getStockText(stock: number): string {
    if (stock === 0) return 'Agotado';
    if (stock <= 5) return `Quedan ${stock}`;
    return 'Disponible';
  }
}


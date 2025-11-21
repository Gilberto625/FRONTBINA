import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductosService, Producto } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './producto-detalle.component.html',
  styleUrls: ['./producto-detalle.component.css']
})
export class ProductoDetalleComponent implements OnInit {
  producto: Producto | null = null;
  productosRelacionados: Producto[] = [];
  
  // Estados
  isLoading = true;
  error: string | null = null;
  isAddingToCart = false;
  
  // Galería de imágenes
  imagenSeleccionada = 0;
  
  // Cantidad
  cantidad = 1;
  
  // Reviews (mock data por ahora)
  reviews = [
    {
      id: 1,
      usuario: 'Carlos M.',
      rating: 5,
      comentario: 'Excelente producto, muy buena calidad. Lo recomiendo ampliamente.',
      fecha: '2024-01-15'
    },
    {
      id: 2,
      usuario: 'Ana L.',
      rating: 4,
      comentario: 'Buen producto, llegó rápido y en perfectas condiciones.',
      fecha: '2024-01-10'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosService: ProductosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProducto(id);
      }
    });
  }

  private async loadProducto(id: string): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      const producto = await this.productosService.getProducto(parseInt(id)).toPromise();
      this.producto = producto;
      
      if (this.producto) {
        // Cargar productos relacionados
        await this.loadProductosRelacionados();
      }

    } catch (error) {
      console.error('Error loading producto:', error);
      this.error = 'Error al cargar el producto. Por favor, intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  private async loadProductosRelacionados(): Promise<void> {
    if (!this.producto) return;

    try {
      const productos = await this.productosService.getProductosPorCategoria(this.producto.categoria).toPromise();
      this.productosRelacionados = (productos || [])
        .filter(p => p.id !== this.producto!.id)
        .slice(0, 4);
    } catch (error) {
      console.error('Error loading productos relacionados:', error);
    }
  }

  seleccionarImagen(index: number): void {
    this.imagenSeleccionada = index;
  }

  incrementarCantidad(): void {
    if (this.producto && this.cantidad < this.producto.stock) {
      this.cantidad++;
    }
  }

  decrementarCantidad(): void {
    if (this.cantidad > 1) {
      this.cantidad--;
    }
  }

  async agregarAlCarrito(): Promise<void> {
    if (!this.producto) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
      return;
    }

    try {
      this.isAddingToCart = true;
      
      await this.productosService.agregarAlCarrito(this.producto.id, this.cantidad).toPromise();
      
      this.showToast(`${this.producto.nombre} agregado al carrito (${this.cantidad} unidades)`, 'success');
      
      // Reset cantidad
      this.cantidad = 1;
      
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      this.showToast('Error al agregar al carrito', 'error');
    } finally {
      this.isAddingToCart = false;
    }
  }

  async comprarAhora(): Promise<void> {
    if (!this.producto) return;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: this.router.url } 
      });
      return;
    }

    try {
      // Agregar al carrito y redirigir al checkout
      await this.productosService.agregarAlCarrito(this.producto.id, this.cantidad).toPromise();
      this.router.navigate(['/cliente/carrito']);
    } catch (error) {
      console.error('Error en compra directa:', error);
      this.showToast('Error al procesar la compra', 'error');
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

  volverAProductos(): void {
    this.router.navigate(['/productos']);
  }

  get imagenes(): string[] {
    if (!this.producto) return [];
    
    const imagenes = [this.producto.imagen_principal];
    if (this.producto.imagenes_adicionales) {
      imagenes.push(...this.producto.imagenes_adicionales);
    }
    
    return imagenes.filter(img => img);
  }

  get imagenActual(): string {
    const imagenes = this.imagenes;
    return imagenes[this.imagenSeleccionada] || 'assets/images/producto-placeholder.jpg';
  }

  get precioConDescuento(): number {
    if (!this.producto) return 0;
    return this.producto.descuento > 0 
      ? this.producto.precio * (1 - this.producto.descuento / 100)
      : this.producto.precio;
  }

  get precioOriginal(): number {
    if (!this.producto) return 0;
    return this.producto.precio;
  }

  get totalPrice(): number {
    return this.precioConDescuento * this.cantidad;
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get stockDisponible(): boolean {
    return this.producto ? this.producto.stock > 0 : false;
  }

  get stockClass(): string {
    if (!this.producto) return '';
    
    if (this.producto.stock === 0) return 'sin-stock';
    if (this.producto.stock <= 5) return 'stock-bajo';
    return 'stock-normal';
  }

  get stockText(): string {
    if (!this.producto) return '';
    
    if (this.producto.stock === 0) return 'Agotado';
    if (this.producto.stock <= 5) return `Solo quedan ${this.producto.stock}`;
    return `${this.producto.stock} disponibles`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  async agregarProductoRelacionado(producto: Producto): Promise<void> {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      await this.productosService.agregarAlCarrito(producto.id, 1).toPromise();
      this.showToast(`${producto.nombre} agregado al carrito`, 'success');
    } catch (error) {
      console.error('Error agregando producto relacionado:', error);
      this.showToast('Error al agregar al carrito', 'error');
    }
  }
}

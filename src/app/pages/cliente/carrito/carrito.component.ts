import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductosService, Carrito, ItemCarrito } from '../../../services/productos.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css']
})
export class CarritoComponent implements OnInit {
  carrito: Carrito | null = null;
  isLoading = true;
  error: string | null = null;
  isUpdating = false;
  isProcessingCheckout = false;
  
  // Checkout data
  tipoEntrega = 'recoger';
  direccionEntrega = '';
  metodoPago = 'banorte';
  costoEnvio = 0;
  cuponDescuento = '';
  descuentoAplicado = 0;
  
  // Mock data hasta que el backend esté listo
  mockCarrito: Carrito = {
    id: 1,
    items: [
      {
        id: 1,
        producto: {
          id: 1,
          nombre: 'Pomada para Cabello Premium',
          descripcion: 'Pomada de alta fijación para peinados modernos',
          precio: 350,
          descuento: 10,
          stock: 25,
          categoria: 'Cuidado Capilar',
          marca: 'Tony Stylo',
          imagen_principal: 'assets/images/pomada-premium.jpg',
          activo: true,
          destacado: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-15'
        },
        cantidad: 2,
        precio_unitario: 315, // Con descuento
        subtotal: 630,
        notas: 'Para cabello rizado'
      },
      {
        id: 2,
        producto: {
          id: 2,
          nombre: 'Aceite para Barba Nutritivo',
          descripcion: 'Aceite natural para el cuidado y nutrición de la barba',
          precio: 280,
          descuento: 0,
          stock: 18,
          categoria: 'Cuidado de Barba',
          marca: 'Tony Stylo',
          imagen_principal: 'assets/images/aceite-barba.jpg',
          activo: true,
          destacado: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-10'
        },
        cantidad: 1,
        precio_unitario: 280,
        subtotal: 280
      }
    ],
    total_items: 3,
    subtotal: 910,
    descuentos: 0,
    impuestos: 145.6, // 16% IVA
    total: 1055.6,
    created_at: '2024-01-20',
    updated_at: '2024-01-20'
  };

  constructor(
    private productosService: ProductosService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCarrito();
  }

  private async loadCarrito(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      // Por ahora usamos datos mock
      this.carrito = this.mockCarrito;
      this.calcularCostoEnvio();

    } catch (error) {
      console.error('Error loading carrito:', error);
      this.error = 'Error al cargar el carrito.';
    } finally {
      this.isLoading = false;
    }
  }

  async actualizarCantidad(item: ItemCarrito, nuevaCantidad: number): Promise<void> {
    if (nuevaCantidad < 1 || nuevaCantidad > item.producto.stock) return;

    try {
      this.isUpdating = true;
      
      // Actualizar localmente por ahora
      item.cantidad = nuevaCantidad;
      item.subtotal = item.precio_unitario * nuevaCantidad;
      this.recalcularTotales();
      
      this.showToast('Cantidad actualizada', 'success');

    } catch (error) {
      console.error('Error updating quantity:', error);
      this.showToast('Error al actualizar cantidad', 'error');
    } finally {
      this.isUpdating = false;
    }
  }

  async eliminarItem(item: ItemCarrito): Promise<void> {
    if (!confirm(`¿Eliminar ${item.producto.nombre} del carrito?`)) return;

    try {
      this.isUpdating = true;
      
      // Eliminar localmente por ahora
      if (this.carrito) {
        this.carrito.items = this.carrito.items.filter(i => i.id !== item.id);
        this.recalcularTotales();
      }
      
      this.showToast('Producto eliminado del carrito', 'success');

    } catch (error) {
      console.error('Error removing item:', error);
      this.showToast('Error al eliminar producto', 'error');
    } finally {
      this.isUpdating = false;
    }
  }

  async limpiarCarrito(): Promise<void> {
    if (!confirm('¿Estás seguro de que deseas vaciar el carrito?')) return;

    try {
      this.isUpdating = true;
      
      if (this.carrito) {
        this.carrito.items = [];
        this.recalcularTotales();
      }
      
      this.showToast('Carrito vaciado', 'success');

    } catch (error) {
      console.error('Error clearing cart:', error);
      this.showToast('Error al vaciar carrito', 'error');
    } finally {
      this.isUpdating = false;
    }
  }

  async aplicarCupon(): Promise<void> {
    if (!this.cuponDescuento.trim()) return;

    try {
      // Mock de validación de cupón
      const cuponesValidos = ['DESCUENTO10', 'CLIENTE20', 'PRIMERA15'];
      const descuentos = { 'DESCUENTO10': 10, 'CLIENTE20': 20, 'PRIMERA15': 15 };
      
      if (cuponesValidos.includes(this.cuponDescuento.toUpperCase())) {
        this.descuentoAplicado = descuentos[this.cuponDescuento.toUpperCase() as keyof typeof descuentos];
        this.recalcularTotales();
        this.showToast(`Cupón aplicado: ${this.descuentoAplicado}% de descuento`, 'success');
      } else {
        this.showToast('Cupón no válido', 'error');
      }

    } catch (error) {
      console.error('Error applying coupon:', error);
      this.showToast('Error al aplicar cupón', 'error');
    }
  }

  private calcularCostoEnvio(): void {
    switch (this.tipoEntrega) {
      case 'moto':
        this.costoEnvio = 45;
        break;
      case 'domicilio':
        this.costoEnvio = 80;
        break;
      default:
        this.costoEnvio = 0;
    }
    this.recalcularTotales();
  }

  private recalcularTotales(): void {
    if (!this.carrito) return;

    // Recalcular subtotal
    this.carrito.subtotal = this.carrito.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Aplicar descuento
    this.carrito.descuentos = (this.carrito.subtotal * this.descuentoAplicado) / 100;
    
    // Calcular impuestos (16% IVA)
    const subtotalConDescuento = this.carrito.subtotal - this.carrito.descuentos;
    this.carrito.impuestos = subtotalConDescuento * 0.16;
    
    // Total final
    this.carrito.total = subtotalConDescuento + this.carrito.impuestos + this.costoEnvio;
    
    // Total de items
    this.carrito.total_items = this.carrito.items.reduce((sum, item) => sum + item.cantidad, 0);
  }

  async procederAlCheckout(): Promise<void> {
    if (!this.carrito || this.carrito.items.length === 0) {
      this.showToast('El carrito está vacío', 'error');
      return;
    }

    if (this.tipoEntrega === 'moto' && !this.direccionEntrega.trim()) {
      this.showToast('Ingresa la dirección de entrega', 'error');
      return;
    }

    try {
      this.isProcessingCheckout = true;
      
      // Mock del proceso de checkout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.showToast('Pedido procesado exitosamente', 'success');
      
      // Redirigir a confirmación
      this.router.navigate(['/cliente/mis-pedidos']);

    } catch (error) {
      console.error('Error processing checkout:', error);
      this.showToast('Error al procesar el pedido', 'error');
    } finally {
      this.isProcessingCheckout = false;
    }
  }

  continuarComprando(): void {
    this.router.navigate(['/productos']);
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

  get carritoVacio(): boolean {
    return !this.carrito || this.carrito.items.length === 0;
  }

  get totalConEnvio(): number {
    return this.carrito ? this.carrito.total + this.costoEnvio : 0;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  getPrecioConDescuento(item: ItemCarrito): number {
    const descuento = item.producto.descuento || 0;
    return item.producto.precio * (1 - descuento / 100);
  }

  getAhorroItem(item: ItemCarrito): number {
    const descuento = item.producto.descuento || 0;
    return descuento > 0 ? (item.producto.precio - this.getPrecioConDescuento(item)) * item.cantidad : 0;
  }
}


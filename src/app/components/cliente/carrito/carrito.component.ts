import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { CarritoService } from '../../../services/carrito.service';
import { ItemCarrito } from '../../../models';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent],
  templateUrl: './carrito.component.html'
})
export class CarritoComponent {
  carritoService = inject(CarritoService);
  
  codigoDescuento = '';
  mensajeDescuento = '';
  descuentoValido = false;

  incrementarCantidad(item: ItemCarrito): void {
    this.carritoService.actualizarCantidad(item.productoId, item.cantidad + 1);
  }

  decrementarCantidad(item: ItemCarrito): void {
    if (item.cantidad > 1) {
      this.carritoService.actualizarCantidad(item.productoId, item.cantidad - 1);
    }
  }

  eliminarItem(productoId: string): void {
    this.carritoService.removerItem(productoId);
  }

  vaciarCarrito(): void {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      this.carritoService.vaciarCarrito();
    }
  }

  aplicarDescuento(): void {
    if (!this.codigoDescuento.trim()) {
      this.mensajeDescuento = 'Ingresa un código de descuento';
      this.descuentoValido = false;
      return;
    }

    const aplicado = this.carritoService.aplicarCodigoDescuento(this.codigoDescuento);
    
    if (aplicado) {
      this.mensajeDescuento = '¡Código aplicado correctamente!';
      this.descuentoValido = true;
    } else {
      this.mensajeDescuento = 'Código inválido o expirado';
      this.descuentoValido = false;
    }
  }
}

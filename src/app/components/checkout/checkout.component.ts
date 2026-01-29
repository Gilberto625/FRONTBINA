import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ProductService, CartItem } from '../../services/product.service';
import { CompraService } from '../../services/compra.service';
import { ModalService } from '../../services/modal.service';

type MetodoEntrega = 'local' | 'moto_mandado' | 'paqueteria';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  items: CartItem[] = [];
  procesando = false;

  metodoEntrega: MetodoEntrega = 'local';
  direccionEntrega = '';
  notas = '';

  constructor(
    private productService: ProductService,
    private compraService: CompraService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.items = this.productService.getCart();
    this.productService.cart$.subscribe(cart => {
      this.items = cart;
    });
  }

  total(): number {
    return this.productService.getCartTotal();
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio);
  }

  requiereDireccion(): boolean {
    return this.metodoEntrega !== 'local';
  }

  async confirmarCompra(): Promise<void> {
    if (this.items.length === 0) {
      await this.modalService.mostrarExito('Carrito vacío', 'Agrega productos antes de continuar.');
      this.router.navigate(['/productos']);
      return;
    }

    if (this.requiereDireccion() && !this.direccionEntrega.trim()) {
      this.modalService.mostrarError('Error', 'La dirección de entrega es requerida para envíos.');
      return;
    }

    const ok = await this.modalService.mostrarConfirmacion(
      'Confirmar compra',
      'Se creará una compra por carrito (una sola orden con varios productos). ¿Deseas continuar?',
      'Continuar',
      'Cancelar'
    );
    if (!ok) return;

    this.procesando = true;
    try {
      const productos = this.items.map(it => ({
        producto_id: it.product.id,
        cantidad: it.quantity
      }));

      await firstValueFrom(
        this.compraService.crearCompra({
          productos,
          metodo_entrega: this.metodoEntrega,
          direccion_entrega: this.requiereDireccion() ? this.direccionEntrega.trim() : undefined,
          notas: this.notas?.trim() || undefined
        })
      );

      this.productService.clearCart();
      await this.modalService.mostrarExito('Compra creada', 'Tus compras fueron registradas. Revisa tu historial.');
      this.router.navigate(['/mis-compras']);
    } catch (error: any) {
      const msg = error?.error?.mensaje || error?.error?.error || 'No se pudo completar la compra. Intenta de nuevo.';
      this.modalService.mostrarError('Error', msg);
    } finally {
      this.procesando = false;
    }
  }
}


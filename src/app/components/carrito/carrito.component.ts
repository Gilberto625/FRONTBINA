import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ProductService, CartItem } from '../../services/product.service';

@Component({
  selector: 'app-carrito',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carrito.component.html',
  styleUrl: './carrito.component.css'
})
export class CarritoComponent implements OnInit {
  items: CartItem[] = [];

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.items = this.productService.getCart();
    this.productService.cart$.subscribe(cart => {
      this.items = cart;
    });
  }

  aumentar(id: number): void {
    const item = this.items.find(i => i.product.id === id);
    if (!item) return;
    this.productService.updateQuantity(id, item.quantity + 1);
  }

  disminuir(id: number): void {
    const item = this.items.find(i => i.product.id === id);
    if (!item) return;
    this.productService.updateQuantity(id, item.quantity - 1);
  }

  eliminar(id: number): void {
    this.productService.removeFromCart(id);
  }

  total(): number {
    return this.productService.getCartTotal();
  }

  totalItems(): number {
    return this.productService.getCartItemsCount();
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio);
  }

  irCheckout(): void {
    this.router.navigate(['/checkout']);
  }
}


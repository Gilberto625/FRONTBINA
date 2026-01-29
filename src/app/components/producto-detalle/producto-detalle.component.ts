import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-producto-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './producto-detalle.component.html',
  styleUrl: './producto-detalle.component.css'
})
export class ProductoDetalleComponent implements OnInit {
  cargando = false;
  producto: Product | null = null;
  cantidad = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    const idStr = this.route.snapshot.paramMap.get('id');
    const id = idStr ? Number(idStr) : NaN;
    if (!id || Number.isNaN(id)) {
      this.modalService.mostrarError('Error', 'Producto inválido.');
      this.router.navigate(['/productos']);
      return;
    }
    this.cargarProducto(id);
  }

  cargarProducto(id: number): void {
    this.cargando = true;
    this.productService.fetchProductById(id).subscribe({
      next: (resp: any) => {
        this.cargando = false;
        if (resp?.exito) {
          this.producto = resp.datos?.producto || null;
        } else {
          this.producto = null;
        }
      },
      error: () => {
        this.cargando = false;
        this.producto = null;
        this.modalService.mostrarError('Error', 'No se pudo cargar el producto.');
      }
    });
  }

  agregarAlCarrito(): void {
    if (!this.producto) return;
    if (this.producto.disponible === false) {
      this.modalService.mostrarError('No disponible', 'Este producto no tiene stock en este momento.');
      return;
    }
    const qty = Math.max(1, Math.floor(this.cantidad || 1));
    this.productService.addToCart(this.producto, qty);
    this.modalService.showSuccess('Producto agregado al carrito');
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio);
  }
}


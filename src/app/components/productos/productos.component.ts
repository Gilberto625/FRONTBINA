import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.css'
})
export class ProductosComponent implements OnInit {
  cargando = false;
  productos: Product[] = [];
  productosFiltrados: Product[] = [];

  filtroCategoria = '';
  soloDisponibles = true;
  busqueda = '';

  categoriasDisponibles: Array<{ valor: string; label: string }> = [
    { valor: '', label: 'Todas' },
    // Nota: las categorías exactas vienen del backend; esto solo sirve como selector "rápido"
    { valor: 'cabello', label: 'Cabello' },
    { valor: 'barba', label: 'Barba' },
    { valor: 'cuidado', label: 'Cuidado' },
    { valor: 'accesorios', label: 'Accesorios' }
  ];

  constructor(
    private productService: ProductService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.cargando = true;
    this.productService.fetchProducts({
      categoria: this.filtroCategoria || undefined,
      solo_disponibles: this.soloDisponibles
    }).subscribe({
      next: (resp: any) => {
        this.cargando = false;
        if (resp?.exito) {
          this.productos = resp.datos?.productos || [];
          this.aplicarFiltrosLocales();
        } else {
          this.productos = [];
          this.productosFiltrados = [];
        }
      },
      error: () => {
        this.cargando = false;
        this.productos = [];
        this.productosFiltrados = [];
        this.modalService.mostrarError('Error', 'No se pudieron cargar los productos.');
      }
    });
  }

  onFiltrosChange(): void {
    this.cargarProductos();
  }

  onBusquedaChange(): void {
    this.aplicarFiltrosLocales();
  }

  aplicarFiltrosLocales(): void {
    const q = (this.busqueda || '').trim().toLowerCase();
    if (!q) {
      this.productosFiltrados = this.productos;
      return;
    }
    this.productosFiltrados = this.productos.filter(p =>
      (p.nombre || '').toLowerCase().includes(q) ||
      (p.descripcion || '').toLowerCase().includes(q) ||
      (p.categoria_display || p.categoria || '').toLowerCase().includes(q)
    );
  }

  agregarAlCarrito(producto: Product): void {
    if (producto.disponible === false) {
      this.modalService.mostrarError('No disponible', 'Este producto no tiene stock en este momento.');
      return;
    }
    this.productService.addToCart(producto, 1);
    this.modalService.showSuccess('Producto agregado al carrito');
  }

  irDetalle(id: number): void {
    this.router.navigate(['/productos', id]);
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio);
  }
}


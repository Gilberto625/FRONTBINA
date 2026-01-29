import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ProductoService } from '../../../services/producto.service';
import { CarritoService } from '../../../services/carrito.service';
import { AuthService } from '../../../services/auth.service';
import { Producto } from '../../../models';

type CategoriaFiltro = 'todos' | 'cabello' | 'barba' | 'accesorios' | 'kit';

@Component({
  selector: 'app-productos-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './productos-lista.component.html',
  styleUrl: './productos-lista.component.css'
})
export class ProductosListaComponent implements OnInit {
  private productoService = inject(ProductoService);
  carritoService = inject(CarritoService);
  private authService = inject(AuthService);
  
  categoriaActiva = signal<CategoriaFiltro>('todos');
  ordenActivo = signal<'popularidad' | 'precio_asc' | 'precio_desc'>('popularidad');
  isLoggedIn = false;

  ngOnInit(): void {
    const usuario = this.authService.getCurrentUser();
    this.isLoggedIn = !!usuario;
  }

  productosFiltrados = () => {
    let productos = [...this.productoService.productos()];
    
    // Filtrar por categoría
    if (this.categoriaActiva() !== 'todos') {
      productos = productos.filter(p => p.categoria === this.categoriaActiva());
    }
    
    // Ordenar
    switch (this.ordenActivo()) {
      case 'precio_asc':
        productos.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio_desc':
        productos.sort((a, b) => b.precio - a.precio);
        break;
      case 'popularidad':
      default:
        productos.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
        break;
    }
    
    return productos;
  };

  filtrarCategoria(categoria: CategoriaFiltro): void {
    this.categoriaActiva.set(categoria);
  }

  ordenar(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.ordenActivo.set(select.value as 'popularidad' | 'precio_asc' | 'precio_desc');
  }

  agregarAlCarrito(producto: Producto): void {
    this.carritoService.agregarItem(producto);
  }
}

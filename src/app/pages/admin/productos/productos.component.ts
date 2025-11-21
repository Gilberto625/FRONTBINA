import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
  categoria: string;
  imagen?: string;
  activo: boolean;
}

@Component({
  selector: 'app-admin-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class AdminProductosComponent implements OnInit {
  productos: Producto[] = [];
  isLoading = true;
  mostrarModal = false;
  editando = false;

  productoActual: Producto = {
    id: 0, nombre: '', descripcion: '', precio: 0, stock: 0, categoria: 'Cuidado Capilar', activo: true
  };

  categorias = ['Cuidado Capilar', 'Barba', 'Styling', 'Accesorios'];

  mockProductos: Producto[] = [
    { id: 1, nombre: 'Cera para cabello', descripcion: 'Fijacion fuerte', precio: 180, stock: 25, categoria: 'Styling', activo: true },
    { id: 2, nombre: 'Aceite para barba', descripcion: 'Hidratacion profunda', precio: 220, stock: 15, categoria: 'Barba', activo: true },
    { id: 3, nombre: 'Shampoo profesional', descripcion: 'Para todo tipo de cabello', precio: 150, stock: 30, categoria: 'Cuidado Capilar', activo: true }
  ];

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.productos = [...this.mockProductos];
      this.isLoading = false;
    }, 300);
  }

  abrirModal(producto?: Producto): void {
    if (producto) {
      this.productoActual = { ...producto };
      this.editando = true;
    } else {
      this.productoActual = { id: 0, nombre: '', descripcion: '', precio: 0, stock: 0, categoria: 'Cuidado Capilar', activo: true };
      this.editando = false;
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarProducto(): void {
    if (this.editando) {
      const index = this.productos.findIndex(p => p.id === this.productoActual.id);
      if (index >= 0) this.productos[index] = { ...this.productoActual };
    } else {
      this.productoActual.id = Date.now();
      this.productos.push({ ...this.productoActual });
    }
    this.cerrarModal();
  }

  eliminarProducto(id: number): void {
    if (confirm('Eliminar este producto?')) {
      this.productos = this.productos.filter(p => p.id !== id);
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { AdminService, Producto } from '../../../services/admin.service';
import { ModalService } from '../../../services/modal.service';

interface MovimientoInventario {
  tipo: 'entrada' | 'salida' | 'ajuste';
  producto: string;
  cantidad: number;
  fecha: Date;
  usuario: string;
  notas?: string;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent],
  templateUrl: './inventario.component.html'
})
export class InventarioComponent implements OnInit {
  private adminService = inject(AdminService);
  private modalService = inject(ModalService);

  productos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  loading = true;
  
  filtro = '';
  filtroEstado = '';

  mostrarModalMovimiento = false;
  guardando = false;
  movimiento = {
    tipo: 'entrada' as 'entrada' | 'salida' | 'ajuste',
    productoId: '',
    cantidad: 0,
    notas: ''
  };

  ultimosMovimientos: MovimientoInventario[] = [];

  get totalUnidades(): number {
    return this.productos.reduce((sum, p) => sum + p.stock, 0);
  }

  get productosOk(): number {
    return this.productos.filter(p => p.stock > p.stock_minimo).length;
  }

  get productosStockBajo(): number {
    return this.productos.filter(p => p.stock > 0 && p.stock <= p.stock_minimo).length;
  }

  get productosAgotados(): number {
    return this.productos.filter(p => p.stock === 0).length;
  }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.loading = true;
    this.adminService.getProductos().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          this.productos = response.productos;
          this.filtrarProductos();
        }
      },
      error: () => {
        this.loading = false;
        this.modalService.showError('Error al cargar inventario');
      }
    });
  }

  filtrarProductos(): void {
    this.productosFiltrados = this.productos.filter(p => {
      const matchNombre = !this.filtro || p.nombre.toLowerCase().includes(this.filtro.toLowerCase());
      let matchEstado = true;
      if (this.filtroEstado === 'normal') matchEstado = p.stock > p.stock_minimo;
      else if (this.filtroEstado === 'bajo') matchEstado = p.stock > 0 && p.stock <= p.stock_minimo && p.stock > p.stock_minimo / 2;
      else if (this.filtroEstado === 'critico') matchEstado = p.stock > 0 && p.stock <= p.stock_minimo / 2;
      else if (this.filtroEstado === 'agotado') matchEstado = p.stock === 0;
      return matchNombre && matchEstado;
    });
  }

  getEstadoStock(producto: Producto): string {
    if (producto.stock === 0) return 'Agotado';
    if (producto.stock <= producto.stock_minimo / 2) return 'Crítico';
    if (producto.stock <= producto.stock_minimo) return 'Bajo';
    return 'Normal';
  }

  getBadgeClass(producto: Producto): string {
    if (producto.stock === 0) return 'badge-error';
    if (producto.stock <= producto.stock_minimo / 2) return 'badge-error';
    if (producto.stock <= producto.stock_minimo) return 'badge-warning';
    return 'badge-success';
  }

  getColorStock(producto: Producto): string {
    if (producto.stock === 0) return 'var(--color-error)';
    if (producto.stock <= producto.stock_minimo) return 'var(--color-warning)';
    return 'inherit';
  }

  abrirModalMovimiento(): void {
    this.movimiento = { tipo: 'entrada', productoId: '', cantidad: 0, notas: '' };
    this.mostrarModalMovimiento = true;
  }

  registrarEntrada(producto: Producto): void {
    this.movimiento = { tipo: 'entrada', productoId: producto.id.toString(), cantidad: 0, notas: '' };
    this.mostrarModalMovimiento = true;
  }

  registrarSalida(producto: Producto): void {
    this.movimiento = { tipo: 'salida', productoId: producto.id.toString(), cantidad: 0, notas: '' };
    this.mostrarModalMovimiento = true;
  }

  cerrarModal(): void {
    this.mostrarModalMovimiento = false;
  }

  guardarMovimiento(): void {
    if (!this.movimiento.productoId || this.movimiento.cantidad <= 0) {
      this.modalService.showError('Selecciona un producto y cantidad válida');
      return;
    }

    this.guardando = true;
    const cantidad = this.movimiento.tipo === 'salida' ? -this.movimiento.cantidad : this.movimiento.cantidad;

    this.adminService.actualizarStock(
      parseInt(this.movimiento.productoId), 
      cantidad, 
      'sumar'
    ).subscribe({
      next: (response) => {
        this.guardando = false;
        if (response.ok) {
          const producto = this.productos.find(p => p.id.toString() === this.movimiento.productoId);
          this.ultimosMovimientos.unshift({
            tipo: this.movimiento.tipo,
            producto: producto?.nombre || 'Producto',
            cantidad: this.movimiento.cantidad,
            fecha: new Date(),
            usuario: 'Admin',
            notas: this.movimiento.notas
          });
          if (this.ultimosMovimientos.length > 5) this.ultimosMovimientos.pop();
          
          this.modalService.showSuccess(`Stock actualizado: ${response.stock_actual} unidades`);
          this.cerrarModal();
          this.cargarProductos();
        }
      },
      error: () => {
        this.guardando = false;
        this.modalService.showError('Error al registrar movimiento');
      }
    });
  }
}

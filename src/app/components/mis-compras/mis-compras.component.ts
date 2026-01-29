import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompraService, Compra } from '../../services/compra.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-compras.component.html',
  styleUrl: './mis-compras.component.css'
})
export class MisComprasComponent implements OnInit {
  compras: Compra[] = [];
  comprasFiltradas: Compra[] = [];
  cargando: boolean = false;
  filtroEstado: string = 'todas';
  
  estadosDisponibles = [
    { valor: 'todas', label: 'Todas' },
    // Backend usa estados tipo 'apartado', 'cancelado', etc.
    { valor: 'apartado', label: 'Apartadas' },
    { valor: 'pagado', label: 'Pagadas' },
    { valor: 'cancelado', label: 'Canceladas' }
  ];

  constructor(
    private compraService: CompraService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCompras();
  }

  cargarCompras(): void {
    this.cargando = true;
    this.compraService.obtenerMisCompras().subscribe({
      next: (response) => {
        if (response.exito) {
          this.compras = response.datos.compras || [];
          this.aplicarFiltro();
        } else {
          this.modalService.mostrarError('Error', response.mensaje || 'No se pudieron cargar las compras');
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar compras:', error);
        this.modalService.mostrarError('Error', 'No se pudieron cargar las compras. Por favor, intenta nuevamente.');
        this.cargando = false;
      }
    });
  }

  aplicarFiltro(): void {
    if (this.filtroEstado === 'todas') {
      this.comprasFiltradas = this.compras;
    } else {
      this.comprasFiltradas = this.compras.filter(compra => compra.estado === this.filtroEstado);
    }
  }

  onFiltroChange(): void {
    this.aplicarFiltro();
  }

  cancelarCompra(compra: Compra): void {
    this.modalService.mostrarConfirmacion(
      'Cancelar Compra',
      '¿Estás seguro de que deseas cancelar esta compra?',
      'Cancelar',
      'Confirmar'
    ).then((confirmado) => {
      if (confirmado) {
        this.procesarCancelacion(compra);
      }
    });
  }

  private procesarCancelacion(compra: Compra): void {
    this.compraService.cancelarCompra(compra.id).subscribe({
      next: (response) => {
        if (response.exito) {
          this.modalService.mostrarExito('Compra Cancelada', 'Tu compra ha sido cancelada exitosamente.')
            .then(() => {
              this.cargarCompras();
            });
        } else {
          this.modalService.mostrarError('Error', response.mensaje || 'No se pudo cancelar la compra');
        }
      },
      error: (error) => {
        console.error('Error al cancelar compra:', error);
        const mensaje = error.error?.mensaje || 'No se pudo cancelar la compra. Por favor, intenta nuevamente.';
        this.modalService.mostrarError('Error', mensaje);
      }
    });
  }

  verDetalle(compra: Compra): void {
    // Detalle pendiente (por ahora solo historial)
    this.modalService.showInfo(`Compra #${compra.id}`);
  }

  pagarCompra(compra: Compra): void {
    this.router.navigate(['/pagar-compra', compra.id]);
  }

  formatearFecha(fecha: string): string {
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  }

  obtenerEstadoLabel(estado: string): string {
    const estados: { [key: string]: string } = {
      'apartado': 'Apartado',
      'pagado': 'Pagado',
      'cancelado': 'Cancelado',
    };
    return estados[estado] || estado;
  }

  obtenerEstadoClass(estado: string): string {
    return `estado-${estado}`;
  }

  puedeCancelar(compra: Compra): boolean {
    return compra.estado === 'apartado';
  }

  puedePagar(compra: Compra): boolean {
    return compra.estado === 'apartado' && !compra.pagado;
  }

  obtenerNombreProducto(producto: any): string {
    if (typeof producto === 'object' && producto.nombre) {
      return producto.nombre;
    }
    return 'Producto';
  }

  obtenerPrecioTotal(compra: Compra): number {
    if (typeof compra.total === 'number') return compra.total;
    return 0;
  }
}

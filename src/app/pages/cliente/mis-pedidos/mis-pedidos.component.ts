import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';

interface Pedido {
  id: number;
  numero_pedido: string;
  fecha_pedido: string;
  estado: string;
  total: number;
  metodo_pago: string;
  metodo_entrega: string;
  direccion_entrega?: string;
  fecha_entrega_estimada?: string;
  fecha_entrega_real?: string;
  items: ItemPedido[];
  seguimiento?: SeguimientoPedido[];
}

interface ItemPedido {
  id: number;
  producto: {
    id: number;
    nombre: string;
    imagen: string;
    precio: number;
  };
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface SeguimientoPedido {
  id: number;
  estado: string;
  fecha: string;
  descripcion: string;
  ubicacion?: string;
}

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.css']
})
export class MisPedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  cargando = false;
  
  // Filtros
  filtros = {
    estado: '',
    fecha_inicio: '',
    fecha_fin: '',
    buscar: ''
  };

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalPaginas = 1;

  // Modal de detalles
  mostrarModalDetalles = false;
  pedidoSeleccionado: Pedido | null = null;

  // Estados disponibles
  estadosDisponibles = [
    { valor: '', texto: 'Todos los estados' },
    { valor: 'pendiente', texto: 'Pendiente' },
    { valor: 'confirmado', texto: 'Confirmado' },
    { valor: 'preparando', texto: 'Preparando' },
    { valor: 'enviado', texto: 'Enviado' },
    { valor: 'entregado', texto: 'Entregado' },
    { valor: 'cancelado', texto: 'Cancelado' }
  ];

  constructor(private productosService: ProductosService) {
    // Establecer fechas por defecto (últimos 3 meses)
    const hoy = new Date();
    const hace3Meses = new Date();
    hace3Meses.setMonth(hoy.getMonth() - 3);
    
    this.filtros.fecha_fin = hoy.toISOString().split('T')[0];
    this.filtros.fecha_inicio = hace3Meses.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cargarPedidos();
  }

  async cargarPedidos(): Promise<void> {
    this.cargando = true;
    try {
      const response = await this.productosService.getMisPedidos({
        page: this.paginaActual,
        page_size: this.elementosPorPagina,
        ...this.filtros
      }).toPromise();
      
      this.pedidos = response?.results || [];
      this.pedidosFiltrados = [...this.pedidos];
      this.totalPaginas = Math.ceil((response?.count || 0) / this.elementosPorPagina);
    } catch (error) {
      console.error('Error cargando pedidos:', error);
    } finally {
      this.cargando = false;
    }
  }

  filtrarPedidos(): void {
    let filtrados = [...this.pedidos];

    if (this.filtros.buscar) {
      const buscar = this.filtros.buscar.toLowerCase();
      filtrados = filtrados.filter(pedido => 
        pedido.numero_pedido.toLowerCase().includes(buscar) ||
        pedido.items.some(item => item.producto.nombre.toLowerCase().includes(buscar))
      );
    }

    if (this.filtros.estado) {
      filtrados = filtrados.filter(pedido => pedido.estado === this.filtros.estado);
    }

    this.pedidosFiltrados = filtrados;
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.cargarPedidos();
  }

  limpiarFiltros(): void {
    this.filtros = {
      estado: '',
      fecha_inicio: '',
      fecha_fin: '',
      buscar: ''
    };
    this.aplicarFiltros();
  }

  verDetalles(pedido: Pedido): void {
    this.pedidoSeleccionado = pedido;
    this.mostrarModalDetalles = true;
  }

  cerrarModalDetalles(): void {
    this.mostrarModalDetalles = false;
    this.pedidoSeleccionado = null;
  }

  async cancelarPedido(pedido: Pedido): Promise<void> {
    if (!confirm(`¿Estás seguro de que deseas cancelar el pedido ${pedido.numero_pedido}?`)) {
      return;
    }

    try {
      await this.productosService.cancelarPedido(pedido.id).toPromise();
      pedido.estado = 'cancelado';
      alert('Pedido cancelado exitosamente');
    } catch (error) {
      console.error('Error cancelando pedido:', error);
      alert('Error al cancelar el pedido');
    }
  }

  async reordenar(pedido: Pedido): Promise<void> {
    try {
      // Agregar todos los productos del pedido al carrito
      for (const item of pedido.items) {
        await this.productosService.agregarAlCarrito(
          item.producto.id, 
          item.cantidad
        ).toPromise();
      }
      
      alert('Productos agregados al carrito exitosamente');
    } catch (error) {
      console.error('Error reordenando:', error);
      alert('Error al agregar productos al carrito');
    }
  }

  async descargarFactura(pedido: Pedido): Promise<void> {
    try {
      const blob = await this.productosService.descargarFactura(pedido.id).toPromise();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `factura_${pedido.numero_pedido}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error descargando factura:', error);
      alert('Error al descargar la factura');
    }
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarPedidos();
    }
  }

  getEstadoTexto(estado: string): string {
    const estadoObj = this.estadosDisponibles.find(e => e.valor === estado);
    return estadoObj ? estadoObj.texto : estado;
  }

  getEstadoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'pendiente': 'warning',
      'confirmado': 'info',
      'preparando': 'primary',
      'enviado': 'secondary',
      'entregado': 'success',
      'cancelado': 'danger'
    };
    return colores[estado] || 'secondary';
  }

  puedeSerCancelado(pedido: Pedido): boolean {
    return ['pendiente', 'confirmado'].includes(pedido.estado);
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearFechaCorta(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/producto-default.jpg';
  }

  calcularTotalItems(pedido: Pedido): number {
    return pedido.items.reduce((total, item) => total + item.cantidad, 0);
  }

  getMetodoEntregaTexto(metodo: string): string {
    const metodos: { [key: string]: string } = {
      'local': 'Recoger en Local',
      'motomandado': 'Motomandado Regional',
      'paqueteria': 'Envío Nacional'
    };
    return metodos[metodo] || metodo;
  }

  getMetodoPagoTexto(metodo: string): string {
    const metodos: { [key: string]: string } = {
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia',
      'banorte': 'Tarjeta (Banorte)'
    };
    return metodos[metodo] || metodo;
  }
}

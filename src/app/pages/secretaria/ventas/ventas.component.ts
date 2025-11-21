import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';

interface Venta {
  id: number;
  numero_venta: string;
  fecha: string;
  cliente: {
    id: number;
    nombre: string;
    email: string;
    telefono: string;
  };
  items: ItemVenta[];
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  metodo_pago: string;
  estado: string;
  notas?: string;
  vendedor: {
    id: number;
    nombre: string;
  };
}

interface ItemVenta {
  id: number;
  producto: {
    id: number;
    nombre: string;
    precio: number;
    imagen: string;
  };
  cantidad: number;
  precio_unitario: number;
  descuento_item: number;
  subtotal: number;
}

interface NuevaVenta {
  cliente_id?: number;
  cliente_temporal?: {
    nombre: string;
    telefono: string;
    email?: string;
  };
  items: {
    producto_id: number;
    cantidad: number;
    precio_unitario?: number;
    descuento?: number;
  }[];
  metodo_pago: string;
  descuento_general: number;
  notas?: string;
}

@Component({
  selector: 'app-gestion-ventas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.css']
})
export class GestionVentasComponent implements OnInit {
  ventas: Venta[] = [];
  ventasFiltradas: Venta[] = [];
  productos: any[] = [];
  clientes: any[] = [];
  
  // Estados
  cargando = false;
  procesandoVenta = false;
  
  // Filtros
  filtros = {
    fecha_inicio: '',
    fecha_fin: '',
    cliente: '',
    metodo_pago: '',
    estado: '',
    buscar: ''
  };
  
  // Nueva venta
  mostrarModalNuevaVenta = false;
  nuevaVenta: NuevaVenta = {
    items: [],
    metodo_pago: 'efectivo',
    descuento_general: 0
  };
  
  // Búsqueda de productos
  busquedaProducto = '';
  productosFiltrados: any[] = [];
  
  // Búsqueda de clientes
  busquedaCliente = '';
  clientesFiltrados: any[] = [];
  clienteSeleccionado: any = null;
  
  // Paginación
  paginaActual = 1;
  elementosPorPagina = 20;
  totalPaginas = 1;
  
  // Estadísticas del día
  estadisticasHoy = {
    total_ventas: 0,
    numero_ventas: 0,
    ticket_promedio: 0,
    productos_vendidos: 0
  };

  metodosPago = [
    { valor: 'efectivo', texto: 'Efectivo' },
    { valor: 'transferencia', texto: 'Transferencia' },
    { valor: 'banorte', texto: 'Tarjeta (Banorte)' }
  ];

  constructor(private productosService: ProductosService) {
    // Establecer fechas por defecto (hoy)
    const hoy = new Date().toISOString().split('T')[0];
    this.filtros.fecha_inicio = hoy;
    this.filtros.fecha_fin = hoy;
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    this.cargando = true;
    try {
      await Promise.all([
        this.cargarVentas(),
        this.cargarProductos(),
        this.cargarClientes(),
        this.cargarEstadisticasHoy()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this.cargando = false;
    }
  }

  async cargarVentas(): Promise<void> {
    try {
      const response = await this.productosService.getVentas({
        page: this.paginaActual,
        page_size: this.elementosPorPagina,
        ...this.filtros
      }).toPromise();
      
      this.ventas = response?.results || [];
      this.ventasFiltradas = [...this.ventas];
      this.totalPaginas = Math.ceil((response?.count || 0) / this.elementosPorPagina);
    } catch (error) {
      console.error('Error cargando ventas:', error);
    }
  }

  async cargarProductos(): Promise<void> {
    try {
      const response = await this.productosService.getProductos({ activos: true }).toPromise();
      this.productos = response?.results || [];
      this.productosFiltrados = [...this.productos];
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  }

  async cargarClientes(): Promise<void> {
    try {
      this.clientes = await this.productosService.getClientes().toPromise() || [];
      this.clientesFiltrados = [...this.clientes];
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  }

  async cargarEstadisticasHoy(): Promise<void> {
    try {
      this.estadisticasHoy = await this.productosService.getEstadisticasVentasHoy().toPromise() || this.estadisticasHoy;
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  filtrarVentas(): void {
    let filtradas = [...this.ventas];

    if (this.filtros.buscar) {
      const buscar = this.filtros.buscar.toLowerCase();
      filtradas = filtradas.filter(venta => 
        venta.numero_venta.toLowerCase().includes(buscar) ||
        venta.cliente.nombre.toLowerCase().includes(buscar) ||
        venta.cliente.telefono.includes(buscar)
      );
    }

    if (this.filtros.metodo_pago) {
      filtradas = filtradas.filter(venta => venta.metodo_pago === this.filtros.metodo_pago);
    }

    if (this.filtros.estado) {
      filtradas = filtradas.filter(venta => venta.estado === this.filtros.estado);
    }

    this.ventasFiltradas = filtradas;
  }

  aplicarFiltros(): void {
    this.paginaActual = 1;
    this.cargarVentas();
  }

  // Nueva venta
  abrirModalNuevaVenta(): void {
    this.nuevaVenta = {
      items: [],
      metodo_pago: 'efectivo',
      descuento_general: 0
    };
    this.clienteSeleccionado = null;
    this.busquedaProducto = '';
    this.busquedaCliente = '';
    this.mostrarModalNuevaVenta = true;
  }

  cerrarModalNuevaVenta(): void {
    this.mostrarModalNuevaVenta = false;
  }

  // Búsqueda de productos
  buscarProductos(): void {
    if (!this.busquedaProducto.trim()) {
      this.productosFiltrados = [...this.productos];
      return;
    }

    const buscar = this.busquedaProducto.toLowerCase();
    this.productosFiltrados = this.productos.filter(producto =>
      producto.nombre.toLowerCase().includes(buscar) ||
      producto.sku.toLowerCase().includes(buscar)
    );
  }

  agregarProductoAVenta(producto: any): void {
    const itemExistente = this.nuevaVenta.items.find(item => item.producto_id === producto.id);
    
    if (itemExistente) {
      itemExistente.cantidad++;
    } else {
      this.nuevaVenta.items.push({
        producto_id: producto.id,
        cantidad: 1,
        precio_unitario: producto.precio,
        descuento: 0
      });
    }
    
    this.busquedaProducto = '';
    this.productosFiltrados = [...this.productos];
  }

  eliminarItemVenta(index: number): void {
    this.nuevaVenta.items.splice(index, 1);
  }

  // Búsqueda de clientes
  buscarClientes(): void {
    if (!this.busquedaCliente.trim()) {
      this.clientesFiltrados = [...this.clientes];
      return;
    }

    const buscar = this.busquedaCliente.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(cliente =>
      cliente.nombre.toLowerCase().includes(buscar) ||
      cliente.telefono.includes(buscar) ||
      cliente.email.toLowerCase().includes(buscar)
    );
  }

  seleccionarCliente(cliente: any): void {
    this.clienteSeleccionado = cliente;
    this.nuevaVenta.cliente_id = cliente.id;
    this.busquedaCliente = '';
    this.clientesFiltrados = [...this.clientes];
  }

  limpiarClienteSeleccionado(): void {
    this.clienteSeleccionado = null;
    this.nuevaVenta.cliente_id = undefined;
    this.nuevaVenta.cliente_temporal = undefined;
  }

  // Cálculos
  calcularSubtotalVenta(): number {
    return this.nuevaVenta.items.reduce((total, item) => {
      const subtotal = (item.precio_unitario || 0) * item.cantidad;
      const descuento = (item.descuento || 0) * item.cantidad;
      return total + subtotal - descuento;
    }, 0);
  }

  calcularTotalVenta(): number {
    const subtotal = this.calcularSubtotalVenta();
    const descuentoGeneral = this.nuevaVenta.descuento_general || 0;
    return subtotal - descuentoGeneral;
  }

  getProductoPorId(id: number): any {
    return this.productos.find(p => p.id === id);
  }

  // Procesar venta
  async procesarVenta(): Promise<void> {
    if (!this.validarVenta()) {
      return;
    }

    this.procesandoVenta = true;
    try {
      const ventaData = { ...this.nuevaVenta };
      
      // Si no hay cliente seleccionado, usar datos temporales
      if (!this.clienteSeleccionado && this.nuevaVenta.cliente_temporal) {
        ventaData.cliente_temporal = this.nuevaVenta.cliente_temporal;
      }

      await this.productosService.crearVenta(ventaData).toPromise();
      
      alert('Venta procesada exitosamente');
      this.cerrarModalNuevaVenta();
      await this.cargarDatos();
    } catch (error) {
      console.error('Error procesando venta:', error);
      alert('Error al procesar la venta');
    } finally {
      this.procesandoVenta = false;
    }
  }

  validarVenta(): boolean {
    if (this.nuevaVenta.items.length === 0) {
      alert('Debe agregar al menos un producto');
      return false;
    }

    if (!this.clienteSeleccionado && !this.nuevaVenta.cliente_temporal?.nombre) {
      alert('Debe seleccionar un cliente o ingresar datos del cliente');
      return false;
    }

    if (!this.clienteSeleccionado && !this.nuevaVenta.cliente_temporal?.telefono) {
      alert('Debe ingresar el teléfono del cliente');
      return false;
    }

    return true;
  }

  // Acciones de venta
  async anularVenta(venta: Venta): Promise<void> {
    if (!confirm(`¿Está seguro de anular la venta ${venta.numero_venta}?`)) {
      return;
    }

    try {
      await this.productosService.anularVenta(venta.id).toPromise();
      await this.cargarVentas();
      alert('Venta anulada exitosamente');
    } catch (error) {
      console.error('Error anulando venta:', error);
      alert('Error al anular la venta');
    }
  }

  async imprimirTicket(venta: Venta): Promise<void> {
    try {
      const blob = await this.productosService.imprimirTicket(venta.id).toPromise();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ticket_${venta.numero_venta}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error imprimiendo ticket:', error);
      alert('Error al imprimir el ticket');
    }
  }

  // Utilidades
  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getMetodoPagoTexto(metodo: string): string {
    const metodoPago = this.metodosPago.find(m => m.valor === metodo);
    return metodoPago ? metodoPago.texto : metodo;
  }

  getEstadoColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'completada': 'success',
      'pendiente': 'warning',
      'anulada': 'danger'
    };
    return colores[estado] || 'secondary';
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarVentas();
    }
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/producto-default.jpg';
  }
}

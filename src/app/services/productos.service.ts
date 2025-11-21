import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  descripcion_larga?: string;
  precio: number;
  precio_descuento?: number;
  descuento: number;
  stock: number;
  categoria: string;
  marca?: string;
  codigo_barras?: string;
  imagen_principal?: string;
  imagenes_adicionales?: string[];
  activo: boolean;
  destacado: boolean;
  peso?: string;
  dimensiones?: string;
  ingredientes?: string;
  modo_uso?: string;
  caracteristicas?: string[];
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CategoriaProducto {
  id: number;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  activa: boolean;
  productos_count: number;
}

export interface ItemCarrito {
  id?: number;
  producto: Producto;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  notas?: string;
}

export interface Carrito {
  id: number;
  items: ItemCarrito[];
  total_items: number;
  subtotal: number;
  descuentos: number;
  impuestos: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface Pedido {
  id: number;
  numero_pedido: string;
  cliente: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
  };
  items: ItemCarrito[];
  subtotal: number;
  descuentos: number;
  impuestos: number;
  total: number;
  estado: 'pendiente' | 'confirmado' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
  tipo_entrega: 'recoger' | 'domicilio' | 'moto';
  direccion_entrega?: string;
  costo_envio: number;
  fecha_pedido: string;
  fecha_entrega_estimada?: string;
  fecha_entrega_real?: string;
  metodo_pago: string;
  estado_pago: 'pendiente' | 'pagado' | 'fallido' | 'reembolsado';
  notas?: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  constructor(private api: ApiService) {}

  /**
   * Obtener todos los productos
   */
  getProductos(params?: {
    categoria?: string;
    buscar?: string;
    destacados?: boolean;
    activos?: boolean;
    page?: number;
    page_size?: number;
  }): Observable<{results: Producto[], count: number, next?: string, previous?: string}> {
    return this.api.get('/productos/', params);
  }

  /**
   * Obtener producto por ID
   */
  getProducto(id: number): Observable<Producto> {
    return this.api.get<Producto>(`/productos/${id}/`);
  }

  /**
   * Obtener productos destacados
   */
  getProductosDestacados(): Observable<Producto[]> {
    return this.api.get<Producto[]>('/productos/destacados/');
  }

  /**
   * Obtener productos relacionados
   */
  getProductosRelacionados(id: number): Observable<Producto[]> {
    return this.api.get<Producto[]>(`/productos/${id}/relacionados/`);
  }

  /**
   * Buscar productos
   */
  buscarProductos(query: string): Observable<Producto[]> {
    return this.api.get<Producto[]>('/productos/buscar/', { q: query });
  }

  /**
   * Obtener categorías de productos
   */
  getCategorias(): Observable<CategoriaProducto[]> {
    return this.api.get<CategoriaProducto[]>('/productos/categorias/');
  }

  /**
   * Obtener productos por categoría
   */
  getProductosPorCategoria(categoria: string): Observable<Producto[]> {
    return this.api.get<Producto[]>('/productos/', { categoria });
  }

  /**
   * Verificar stock de un producto
   */
  verificarStock(productoId: number, cantidad: number): Observable<{disponible: boolean, stock_actual: number}> {
    return this.api.get(`/productos/${productoId}/verificar-stock/`, { cantidad });
  }

  // ===== CARRITO =====

  /**
   * Obtener carrito actual del usuario
   */
  getCarrito(): Observable<Carrito> {
    return this.api.get<Carrito>('/ventas/carrito/');
  }

  /**
   * Agregar producto al carrito
   */
  agregarAlCarrito(productoId: number, cantidad: number, notas?: string): Observable<ItemCarrito> {
    return this.api.post<ItemCarrito>('/ventas/carrito/agregar/', {
      producto_id: productoId,
      cantidad,
      notas
    });
  }

  /**
   * Actualizar cantidad de un item en el carrito
   */
  actualizarItemCarrito(itemId: number, cantidad: number): Observable<ItemCarrito> {
    return this.api.patch<ItemCarrito>(`/ventas/carrito/items/${itemId}/`, {
      cantidad
    });
  }

  /**
   * Eliminar item del carrito
   */
  eliminarDelCarrito(itemId: number): Observable<any> {
    return this.api.delete(`/ventas/carrito/items/${itemId}/`);
  }

  /**
   * Limpiar carrito completo
   */
  limpiarCarrito(): Observable<any> {
    return this.api.delete('/ventas/carrito/limpiar/');
  }

  /**
   * Aplicar cupón de descuento
   */
  aplicarCupon(codigo: string): Observable<{descuento: number, mensaje: string}> {
    return this.api.post('/ventas/carrito/aplicar-cupon/', { codigo });
  }

  /**
   * Calcular costo de envío
   */
  calcularEnvio(tipoEntrega: string, direccion?: string): Observable<{costo: number, tiempo_estimado?: string}> {
    return this.api.post('/ventas/calcular-envio/', {
      tipo_entrega: tipoEntrega,
      direccion
    });
  }

  // ===== PEDIDOS =====

  /**
   * Crear pedido desde carrito
   */
  crearPedido(datosPedido: {
    tipo_entrega: string;
    direccion_entrega?: string;
    metodo_pago: string;
    datos_pago?: any;
    notas?: string;
  }): Observable<Pedido> {
    return this.api.post<Pedido>('/ventas/pedidos/crear/', datosPedido);
  }

  /**
   * Obtener pedidos del usuario
   */
  getMisPedidos(params?: any): Observable<any> {
    return this.api.get<any>('/ventas/mis-pedidos/', params);
  }

  /**
   * Obtener pedido por ID
   */
  getPedido(id: number): Observable<Pedido> {
    return this.api.get<Pedido>(`/ventas/pedidos/${id}/`);
  }

  /**
   * Cancelar pedido
   */
  cancelarPedido(id: number, motivo?: string): Observable<any> {
    return this.api.post(`/ventas/pedidos/${id}/cancelar/`, { motivo });
  }

  /**
   * Confirmar recepción del pedido
   */
  confirmarRecepcion(id: number): Observable<any> {
    return this.api.post(`/ventas/pedidos/${id}/confirmar-recepcion/`, {});
  }

  /**
   * Calificar pedido
   */
  calificarPedido(id: number, calificacion: number, comentario?: string): Observable<any> {
    return this.api.post(`/ventas/pedidos/${id}/calificar/`, {
      calificacion,
      comentario
    });
  }

  /**
   * Rastrear pedido
   */
  rastrearPedido(id: number): Observable<{
    estado_actual: string;
    historial: {
      estado: string;
      fecha: string;
      descripcion: string;
    }[];
    ubicacion_actual?: string;
    tiempo_estimado?: string;
  }> {
    return this.api.get(`/ventas/pedidos/${id}/rastrear/`);
  }

  // ===== APARTADOS =====

  /**
   * Apartar producto
   */
  apartarProducto(productoId: number, cantidad: number, tiempoApartado: number): Observable<any> {
    return this.api.post('/ventas/apartar/', {
      producto_id: productoId,
      cantidad,
      tiempo_apartado: tiempoApartado
    });
  }

  /**
   * Obtener productos apartados
   */
  getProductosApartados(): Observable<any[]> {
    return this.api.get('/ventas/apartados/');
  }

  /**
   * Confirmar compra de producto apartado
   */
  confirmarApartado(apartadoId: number, metodoPago: string, datosPago?: any): Observable<any> {
    return this.api.post(`/ventas/apartados/${apartadoId}/confirmar/`, {
      metodo_pago: metodoPago,
      datos_pago: datosPago
    });
  }

  /**
   * Cancelar apartado
   */
  cancelarApartado(apartadoId: number): Observable<any> {
    return this.api.delete(`/ventas/apartados/${apartadoId}/`);
  }

  // ===== PAGOS =====

  /**
   * Procesar pago con Banorte
   */
  procesarPagoBanorte(datosPago: {
    numero_tarjeta: string;
    mes_expiracion: string;
    ano_expiracion: string;
    cvv: string;
    nombre_titular: string;
    monto: number;
    concepto: string;
  }): Observable<any> {
    return this.api.post('/ventas/procesar-pago-banorte/', datosPago);
  }

  /**
   * Verificar estado de pago
   */
  verificarPago(transaccionId: string): Observable<any> {
    return this.api.get(`/ventas/verificar-pago/${transaccionId}/`);
  }

  // ===== UTILIDADES =====

  /**
   * Obtener métodos de pago disponibles
   */
  getMetodosPago(): Observable<{
    id: string;
    nombre: string;
    descripcion: string;
    activo: boolean;
    icono?: string;
  }[]> {
    return this.api.get('/ventas/metodos-pago/');
  }

  /**
   * Obtener opciones de entrega
   */
  getOpcionesEntrega(): Observable<{
    id: string;
    nombre: string;
    descripcion: string;
    costo_base: number;
    tiempo_estimado: string;
    activo: boolean;
  }[]> {
    return this.api.get('/ventas/opciones-entrega/');
  }

  /**
   * Validar cupón de descuento
   */
  validarCupon(codigo: string): Observable<{
    valido: boolean;
    descuento: number;
    tipo_descuento: 'porcentaje' | 'fijo';
    mensaje: string;
  }> {
    return this.api.get(`/ventas/validar-cupon/${codigo}/`);
  }

  // Métodos para Mis Pedidos - ya definidos arriba

  descargarFactura(pedidoId: number): Observable<Blob> {
    return this.api.getBlob(`/ventas/pedidos/${pedidoId}/factura/`);
  }

  // Métodos para Gestión de Ventas (Secretaria)
  getVentas(params?: any): Observable<any> {
    return this.api.get('/ventas/', params);
  }

  getClientes(): Observable<any[]> {
    return this.api.get<any[]>('/accounts/clientes/');
  }

  getEstadisticasVentasHoy(): Observable<any> {
    return this.api.get('/ventas/estadisticas/hoy/');
  }

  crearVenta(ventaData: any): Observable<any> {
    return this.api.post('/ventas/', ventaData);
  }

  anularVenta(ventaId: number): Observable<any> {
    return this.api.post(`/ventas/${ventaId}/anular/`, {});
  }

  imprimirTicket(ventaId: number): Observable<Blob> {
    return this.api.getBlob(`/ventas/${ventaId}/ticket/`);
  }

  // Métodos adicionales para productos
  actualizarStock(productoId: number, cantidad: number, motivo: string, observaciones?: string): Observable<any> {
    return this.api.post(`/productos/${productoId}/stock/`, {
      cantidad,
      motivo,
      observaciones
    });
  }

  getMovimientosStock(productoId: number): Observable<any[]> {
    return this.api.get<any[]>(`/productos/${productoId}/movimientos/`);
  }

  // Métodos para wishlist
  getWishlist(): Observable<any[]> {
    return this.api.get<any[]>('/productos/wishlist/');
  }

  agregarAWishlist(productoId: number): Observable<any> {
    return this.api.post('/productos/wishlist/', { producto_id: productoId });
  }

  eliminarDeWishlist(productoId: number): Observable<any> {
    return this.api.delete(`/productos/wishlist/${productoId}/`);
  }
}

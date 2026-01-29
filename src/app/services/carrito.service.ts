import { Injectable, signal, computed } from '@angular/core';
import { ItemCarrito, Carrito, Producto, MetodoEntrega } from '../models';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CarritoService {
  
  private itemsCarrito = signal<ItemCarrito[]>([]);
  private codigoDescuento = signal<string | null>(null);
  private metodoEntrega = signal<MetodoEntrega>('recoger_local');

  // Costos de envío
  private costosEnvio: Record<MetodoEntrega, number> = {
    'recoger_local': 0,
    'moto_mandado': 45,
    'paqueteria': 150
  };

  items = computed(() => this.itemsCarrito());
  
  cantidadItems = computed(() => 
    this.itemsCarrito().reduce((total, item) => total + item.cantidad, 0)
  );

  subtotal = computed(() =>
    this.itemsCarrito().reduce((total, item) => total + (item.precioUnitario * item.cantidad), 0)
  );

  descuento = computed(() => {
    const codigo = this.codigoDescuento();
    if (!codigo) return 0;
    
    // Códigos de descuento mock
    const descuentos: Record<string, number> = {
      'BIENVENIDO10': 0.10,
      'STYLO20': 0.20,
      'VIP15': 0.15
    };
    
    const porcentaje = descuentos[codigo.toUpperCase()] || 0;
    return this.subtotal() * porcentaje;
  });

  costoEnvio = computed(() => this.costosEnvio[this.metodoEntrega()]);

  total = computed(() => this.subtotal() - this.descuento() + this.costoEnvio());

  carrito = computed<Carrito>(() => ({
    items: this.itemsCarrito(),
    subtotal: this.subtotal(),
    descuento: this.descuento(),
    costoEnvio: this.costoEnvio(),
    total: this.total()
  }));

  agregarItem(producto: Producto, cantidad: number = 1): void {
    this.itemsCarrito.update(items => {
      const existente = items.find(i => i.productoId === producto.id);
      
      if (existente) {
        return items.map(i => 
          i.productoId === producto.id
            ? { ...i, cantidad: i.cantidad + cantidad }
            : i
        );
      }
      
      return [...items, {
        productoId: producto.id,
        producto,
        cantidad,
        precioUnitario: producto.precio
      }];
    });
  }

  actualizarCantidad(productoId: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.removerItem(productoId);
      return;
    }
    
    this.itemsCarrito.update(items =>
      items.map(i => 
        i.productoId === productoId ? { ...i, cantidad } : i
      )
    );
  }

  removerItem(productoId: string): void {
    this.itemsCarrito.update(items => 
      items.filter(i => i.productoId !== productoId)
    );
  }

  vaciarCarrito(): void {
    this.itemsCarrito.set([]);
    this.codigoDescuento.set(null);
  }

  aplicarCodigoDescuento(codigo: string): boolean {
    const codigosValidos = ['BIENVENIDO10', 'STYLO20', 'VIP15'];
    
    if (codigosValidos.includes(codigo.toUpperCase())) {
      this.codigoDescuento.set(codigo.toUpperCase());
      return true;
    }
    
    return false;
  }

  removerCodigoDescuento(): void {
    this.codigoDescuento.set(null);
  }

  setMetodoEntrega(metodo: MetodoEntrega): void {
    this.metodoEntrega.set(metodo);
  }

  getMetodoEntrega(): MetodoEntrega {
    return this.metodoEntrega();
  }
}

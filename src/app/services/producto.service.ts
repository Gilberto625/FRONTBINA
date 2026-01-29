import { Injectable, signal, computed } from '@angular/core';
import { Producto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  
  private productosData = signal<Producto[]>([
    {
      id: '1',
      nombre: 'Pomada Mate',
      descripcion: 'Fijación fuerte, acabado natural mate para un look moderno.',
      precio: 280,
      categoria: 'cabello',
      stock: 25,
      stockMinimo: 10,
      activo: true,
      destacado: true
    },
    {
      id: '2',
      nombre: 'Aceite para Barba',
      descripcion: 'Hidratación y brillo natural para tu barba.',
      precio: 350,
      categoria: 'barba',
      stock: 5,
      stockMinimo: 8,
      activo: true
    },
    {
      id: '3',
      nombre: 'Cera Modeladora',
      descripcion: 'Control total y flexibilidad durante todo el día.',
      precio: 250,
      categoria: 'cabello',
      stock: 18,
      stockMinimo: 10,
      activo: true
    },
    {
      id: '4',
      nombre: 'Shampoo Premium',
      descripcion: 'Limpieza profunda sin resecar, fortalece el cabello.',
      precio: 320,
      categoria: 'cabello',
      stock: 4,
      stockMinimo: 10,
      activo: true,
      nuevo: true
    },
    {
      id: '5',
      nombre: 'Bálsamo Barba',
      descripcion: 'Suaviza, da forma y nutre tu barba.',
      precio: 290,
      categoria: 'barba',
      stock: 15,
      stockMinimo: 8,
      activo: true
    },
    {
      id: '6',
      nombre: 'Gel Fijador',
      descripcion: 'Máxima fijación todo el día sin residuos.',
      precio: 180,
      categoria: 'cabello',
      stock: 30,
      stockMinimo: 10,
      activo: true
    },
    {
      id: '7',
      nombre: 'Peine de Madera',
      descripcion: 'Antiestático, ideal para barba y cabello.',
      precio: 150,
      categoria: 'accesorios',
      stock: 20,
      stockMinimo: 5,
      activo: true
    },
    {
      id: '8',
      nombre: 'Kit Barbero Premium',
      descripcion: 'Todo lo que necesitas: pomada, aceite, peine y tijeras.',
      precio: 890,
      categoria: 'kit',
      stock: 8,
      stockMinimo: 3,
      activo: true,
      destacado: true
    },
    {
      id: '9',
      nombre: 'Shampoo Anticaspa',
      descripcion: 'Elimina la caspa y previene su reaparición.',
      precio: 280,
      categoria: 'cabello',
      stock: 4,
      stockMinimo: 10,
      activo: true
    },
    {
      id: '10',
      nombre: 'Pomada Fijadora Premium',
      descripcion: 'Fijación extrema con acabado brillante.',
      precio: 320,
      categoria: 'cabello',
      stock: 3,
      stockMinimo: 10,
      activo: true
    },
    {
      id: '11',
      nombre: 'Toallas Desechables',
      descripcion: 'Pack de 100 toallas profesionales.',
      precio: 180,
      categoria: 'accesorios',
      stock: 15,
      stockMinimo: 50,
      activo: true
    }
  ]);

  productos = computed(() => this.productosData().filter(p => p.activo));
  
  productosPorCategoria = computed(() => {
    const productos = this.productos();
    return {
      todos: productos,
      cabello: productos.filter(p => p.categoria === 'cabello'),
      barba: productos.filter(p => p.categoria === 'barba'),
      accesorios: productos.filter(p => p.categoria === 'accesorios'),
      kits: productos.filter(p => p.categoria === 'kit')
    };
  });

  productosDestacados = computed(() => 
    this.productos().filter(p => p.destacado || p.nuevo)
  );

  productosStockBajo = computed(() =>
    this.productos().filter(p => p.stock <= p.stockMinimo)
  );

  getProductoById(id: string): Producto | undefined {
    return this.productosData().find(p => p.id === id);
  }

  agregarProducto(producto: Omit<Producto, 'id'>): Producto {
    const nuevoProducto: Producto = {
      ...producto,
      id: Date.now().toString()
    };
    this.productosData.update(productos => [...productos, nuevoProducto]);
    return nuevoProducto;
  }

  actualizarProducto(id: string, datos: Partial<Producto>): void {
    this.productosData.update(productos =>
      productos.map(p => p.id === id ? { ...p, ...datos } : p)
    );
  }

  actualizarStock(id: string, cantidad: number): void {
    this.productosData.update(productos =>
      productos.map(p => p.id === id ? { ...p, stock: p.stock + cantidad } : p)
    );
  }

  eliminarProducto(id: string): void {
    this.productosData.update(productos =>
      productos.map(p => p.id === id ? { ...p, activo: false } : p)
    );
  }
}

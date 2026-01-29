import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Product {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: string;
  categoria_display?: string;
  imagen_url?: string;
  stock_actual?: number;
  disponible?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = environment.apiUrl + '/productos';

  private cartSubject = new BehaviorSubject<CartItem[]>(this.loadCartFromStorage());
  public cart$ = this.cartSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar carrito del localStorage al iniciar
    this.loadCartFromStorage();
  }

  /**
   * Obtener productos desde backend (público)
   */
  fetchProducts(filters?: { categoria?: string; solo_disponibles?: boolean }): Observable<any> {
    const params: string[] = [];
    if (filters?.categoria) params.push(`categoria=${encodeURIComponent(filters.categoria)}`);
    if (typeof filters?.solo_disponibles === 'boolean') params.push(`solo_disponibles=${filters.solo_disponibles ? 'true' : 'false'}`);
    const url = params.length ? `${this.apiUrl}/?${params.join('&')}` : `${this.apiUrl}/`;
    return this.http.get(url);
  }

  /**
   * Obtener detalle de producto desde backend (público)
   */
  fetchProductById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/`);
  }

  /**
   * Agregar producto al carrito
   */
  addToCart(product: Product, quantity: number = 1): void {
    const cart = this.cartSubject.value;
    const existingItem = cart.find(item => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ product, quantity });
    }

    this.updateCart(cart);
  }

  /**
   * Remover producto del carrito
   */
  removeFromCart(productId: number): void {
    const cart = this.cartSubject.value.filter(item => item.product.id !== productId);
    this.updateCart(cart);
  }

  /**
   * Actualizar cantidad de un producto en el carrito
   */
  updateQuantity(productId: number, quantity: number): void {
    const cart = this.cartSubject.value;
    const item = cart.find(item => item.product.id === productId);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
        this.updateCart(cart);
      }
    }
  }

  /**
   * Obtener carrito actual
   */
  getCart(): CartItem[] {
    return this.cartSubject.value;
  }

  /**
   * Obtener total del carrito
   */
  getCartTotal(): number {
    return this.cartSubject.value.reduce((total, item) => {
      return total + (item.product.precio * item.quantity);
    }, 0);
  }

  /**
   * Obtener cantidad total de items en el carrito
   */
  getCartItemsCount(): number {
    return this.cartSubject.value.reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Limpiar carrito
   */
  clearCart(): void {
    this.updateCart([]);
  }

  /**
   * Actualizar carrito y guardar en localStorage
   */
  private updateCart(cart: CartItem[]): void {
    this.cartSubject.next(cart);
    this.saveCartToStorage(cart);
  }

  /**
   * Guardar carrito en localStorage
   */
  private saveCartToStorage(cart: CartItem[]): void {
    try {
      localStorage.setItem('barber_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error guardando carrito:', error);
    }
  }

  /**
   * Cargar carrito desde localStorage
   */
  private loadCartFromStorage(): CartItem[] {
    try {
      const cartData = localStorage.getItem('barber_cart');
      if (cartData) {
        return JSON.parse(cartData);
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
    }
    return [];
  }
}


import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductService, Product, CartItem } from './product.service';
import { environment } from '../../environments/environment';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const apiUrl = environment.apiUrl + '/productos';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ProductService]
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
    // Limpiar localStorage antes de cada test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('fetchProducts', () => {
    it('should fetch products without filters', (done) => {
      const mockProducts: Product[] = [
        {
          id: 1,
          nombre: 'Producto 1',
          descripcion: 'Descripción 1',
          precio: 100,
          categoria: 'categoria1',
          stock_actual: 10,
          disponible: true
        }
      ];

      service.fetchProducts().subscribe({
        next: (products) => {
          expect(products).toEqual(mockProducts);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${apiUrl}/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });

    it('should fetch products with filters', (done) => {
      const filters = { categoria: 'categoria1', solo_disponibles: true };
      const mockProducts: Product[] = [];

      service.fetchProducts(filters).subscribe({
        next: (products) => {
          expect(products).toEqual(mockProducts);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${apiUrl}/?categoria=categoria1&solo_disponibles=true`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProducts);
    });
  });

  describe('fetchProductById', () => {
    it('should fetch a single product by id', (done) => {
      const mockProduct: Product = {
        id: 1,
        nombre: 'Producto 1',
        descripcion: 'Descripción 1',
        precio: 100,
        categoria: 'categoria1',
        stock_actual: 10,
        disponible: true
      };

      service.fetchProductById(1).subscribe({
        next: (product) => {
          expect(product).toEqual(mockProduct);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${apiUrl}/1/`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);
    });
  });

  describe('Cart Management', () => {
    const mockProduct: Product = {
      id: 1,
      nombre: 'Producto 1',
      descripcion: 'Descripción 1',
      precio: 100,
      categoria: 'categoria1',
      stock_actual: 10,
      disponible: true
    };

    it('should add product to cart', (done) => {
      service.cart$.subscribe({
        next: (cart) => {
          if (cart.length > 0) {
            expect(cart[0].product).toEqual(mockProduct);
            expect(cart[0].quantity).toBe(1);
            done();
          }
        }
      });

      service.addToCart(mockProduct, 1);
    });

    it('should update quantity when adding same product', (done) => {
      let callCount = 0;
      service.cart$.subscribe({
        next: (cart) => {
          callCount++;
          if (callCount === 2) {
            const item = cart.find(item => item.product.id === mockProduct.id);
            expect(item?.quantity).toBe(3);
            done();
          }
        }
      });

      service.addToCart(mockProduct, 1);
      service.addToCart(mockProduct, 2);
    });

    it('should remove product from cart', (done) => {
      service.addToCart(mockProduct, 1);
      
      service.cart$.subscribe({
        next: (cart) => {
          if (cart.length === 0) {
            expect(cart.find(item => item.product.id === mockProduct.id)).toBeUndefined();
            done();
          }
        }
      });

      service.removeFromCart(mockProduct.id);
    });

    it('should update cart item quantity', (done) => {
      service.addToCart(mockProduct, 1);
      
      let callCount = 0;
      service.cart$.subscribe({
        next: (cart) => {
          callCount++;
          if (callCount === 2) {
            const item = cart.find(item => item.product.id === mockProduct.id);
            expect(item?.quantity).toBe(5);
            done();
          }
        }
      });

      service.updateCartItemQuantity(mockProduct.id, 5);
    });

    it('should clear cart', (done) => {
      service.addToCart(mockProduct, 1);
      
      service.cart$.subscribe({
        next: (cart) => {
          if (cart.length === 0) {
            done();
          }
        }
      });

      service.clearCart();
    });

    it('should calculate total price', (done) => {
      const product2: Product = {
        id: 2,
        nombre: 'Producto 2',
        descripcion: 'Descripción 2',
        precio: 50,
        categoria: 'categoria2',
        stock_actual: 5,
        disponible: true
      };

      service.addToCart(mockProduct, 2); // 100 * 2 = 200
      service.addToCart(product2, 3);    // 50 * 3 = 150
      
      service.cart$.subscribe({
        next: (cart) => {
          if (cart.length === 2) {
            const total = service.getCartTotal();
            expect(total).toBe(350); // 200 + 150
            done();
          }
        }
      });
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';

import { Cart } from './cart';
import { Product } from '../models/product.interface';

describe('Cart', () => {
  let service: Cart;

  // Productos de prueba
  const mockProduct1: Product = {
    id: 1,
    name: 'Juego 1',
    description: 'Descripción del juego 1',
    price: 10000,
    image: 'imagen1.jpg',
    categoryId: 1,
  };

  const mockProduct2: Product = {
    id: 2,
    name: 'Juego 2',
    description: 'Descripción del juego 2',
    price: 15000,
    image: 'imagen2.jpg',
    categoryId: 1,
  };

  const mockProduct3: Product = {
    id: 3,
    name: 'Juego 3',
    description: 'Descripción del juego 3',
    price: 25000,
    image: 'imagen3.jpg',
    categoryId: 2,
  };

  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
    });
    service = TestBed.inject(Cart);
  });

  afterEach(() => {
    // Limpiar el carrito después de cada test
    service.clearCart();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ===============================================
  // PRUEBAS: Cálculo del total cuando cambia la cantidad
  // ===============================================

  describe('Cálculo del total del carrito cuando cambia la cantidad de un producto', () => {
    describe('Subtotal de cada producto', () => {
      it('debería calcular correctamente el subtotal cuando se agrega un producto con cantidad 1', () => {
        service.addToCart(mockProduct1, 1);

        const items = service.items();
        const itemSubtotal = items[0].product.price * items[0].quantity;

        expect(itemSubtotal).toBe(10000);
        expect(service.subtotal()).toBe(10000);
      });

      it('debería calcular correctamente el subtotal cuando se agrega un producto con cantidad mayor a 1', () => {
        service.addToCart(mockProduct1, 3);

        const items = service.items();
        const itemSubtotal = items[0].product.price * items[0].quantity;

        expect(items[0].quantity).toBe(3);
        expect(itemSubtotal).toBe(30000); // 10000 * 3
        expect(service.subtotal()).toBe(30000);
      });

      it('debería actualizar el subtotal del producto cuando aumenta la cantidad', () => {
        service.addToCart(mockProduct1, 2);

        // Verificar estado inicial
        expect(service.subtotal()).toBe(20000); // 10000 * 2

        // Aumentar cantidad a 3
        service.updateQuantity(mockProduct1.id, 3);

        const items = service.items();
        const itemSubtotal = items[0].product.price * items[0].quantity;

        expect(items[0].quantity).toBe(3);
        expect(itemSubtotal).toBe(30000); // 10000 * 3
      });

      it('debería actualizar el subtotal del producto cuando disminuye la cantidad', () => {
        service.addToCart(mockProduct1, 5);

        // Verificar estado inicial
        expect(service.subtotal()).toBe(50000); // 10000 * 5

        // Disminuir cantidad a 2
        service.updateQuantity(mockProduct1.id, 2);

        const items = service.items();
        const itemSubtotal = items[0].product.price * items[0].quantity;

        expect(items[0].quantity).toBe(2);
        expect(itemSubtotal).toBe(20000); // 10000 * 2
      });
    });

    describe('Total general del carrito', () => {
      it('debería recalcular el total general cuando se aumenta la cantidad de un producto', () => {
        // Agregar dos productos
        service.addToCart(mockProduct1, 2); // 10000 * 2 = 20000
        service.addToCart(mockProduct2, 1); // 15000 * 1 = 15000

        // Total inicial: 35000
        expect(service.subtotal()).toBe(35000);

        // Aumentar cantidad del primer producto a 3
        service.updateQuantity(mockProduct1.id, 3);

        // Nuevo total: (10000 * 3) + (15000 * 1) = 30000 + 15000 = 45000
        expect(service.subtotal()).toBe(45000);
        expect(service.total()).toBe(45000);
      });

      it('debería recalcular el total general cuando se disminuye la cantidad de un producto', () => {
        // Agregar productos
        service.addToCart(mockProduct1, 4); // 10000 * 4 = 40000
        service.addToCart(mockProduct2, 2); // 15000 * 2 = 30000

        // Total inicial: 70000
        expect(service.subtotal()).toBe(70000);

        // Disminuir cantidad del primer producto a 1
        service.updateQuantity(mockProduct1.id, 1);

        // Nuevo total: (10000 * 1) + (15000 * 2) = 10000 + 30000 = 40000
        expect(service.subtotal()).toBe(40000);
        expect(service.total()).toBe(40000);
      });

      it('debería recalcular el total correctamente con múltiples productos', () => {
        // Agregar tres productos
        service.addToCart(mockProduct1, 1); // 10000 * 1 = 10000
        service.addToCart(mockProduct2, 2); // 15000 * 2 = 30000
        service.addToCart(mockProduct3, 1); // 25000 * 1 = 25000

        // Total inicial: 65000
        expect(service.subtotal()).toBe(65000);

        // Actualizar cantidades
        service.updateQuantity(mockProduct1.id, 2); // 10000 * 2 = 20000
        service.updateQuantity(mockProduct2.id, 3); // 15000 * 3 = 45000
        service.updateQuantity(mockProduct3.id, 2); // 25000 * 2 = 50000

        // Nuevo total: 20000 + 45000 + 50000 = 115000
        expect(service.subtotal()).toBe(115000);
        expect(service.total()).toBe(115000);
      });

      it('debería eliminar el producto y recalcular el total cuando la cantidad llega a 0', () => {
        service.addToCart(mockProduct1, 2); // 20000
        service.addToCart(mockProduct2, 1); // 15000

        expect(service.subtotal()).toBe(35000);
        expect(service.items().length).toBe(2);

        // Reducir cantidad a 0 (debería eliminar el producto)
        service.updateQuantity(mockProduct1.id, 0);

        expect(service.items().length).toBe(1);
        expect(service.subtotal()).toBe(15000);
      });
    });

    describe('Consistencia de datos', () => {
      it('debería mantener consistencia entre cantidad de items y total de items', () => {
        service.addToCart(mockProduct1, 2);
        service.addToCart(mockProduct2, 3);

        // totalItems debería ser la suma de todas las cantidades
        expect(service.totalItems()).toBe(5);

        // Actualizar cantidad
        service.updateQuantity(mockProduct1.id, 4);

        // Nuevo totalItems: 4 + 3 = 7
        expect(service.totalItems()).toBe(7);
      });

      it('debería mantener consistencia entre subtotal y total después de múltiples cambios', () => {
        service.addToCart(mockProduct1, 1);
        expect(service.subtotal()).toBe(service.total());

        service.updateQuantity(mockProduct1.id, 5);
        expect(service.subtotal()).toBe(service.total());

        service.addToCart(mockProduct2, 2);
        expect(service.subtotal()).toBe(service.total());

        service.updateQuantity(mockProduct2.id, 1);
        expect(service.subtotal()).toBe(service.total());
      });

      it('no debería tener inconsistencias al realizar cambios rápidos de cantidad', () => {
        service.addToCart(mockProduct1, 1);

        // Simular múltiples cambios rápidos
        for (let i = 2; i <= 10; i++) {
          service.updateQuantity(mockProduct1.id, i);

          const items = service.items();
          const calculatedSubtotal = items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          // El subtotal calculado manualmente debe coincidir con el del servicio
          expect(service.subtotal()).toBe(calculatedSubtotal);
          expect(items[0].quantity).toBe(i);
        }
      });

      it('debería mantener consistencia después de agregar y eliminar productos', () => {
        service.addToCart(mockProduct1, 2); // 20000
        service.addToCart(mockProduct2, 1); // 15000
        service.addToCart(mockProduct3, 3); // 75000

        expect(service.subtotal()).toBe(110000);

        // Eliminar producto del medio
        service.removeFromCart(mockProduct2.id);

        expect(service.items().length).toBe(2);
        expect(service.subtotal()).toBe(95000); // 20000 + 75000

        // Cambiar cantidad del producto restante
        service.updateQuantity(mockProduct1.id, 5);

        // Nuevo total: (10000 * 5) + (25000 * 3) = 50000 + 75000 = 125000
        expect(service.subtotal()).toBe(125000);
      });
    });

    describe('Casos límite', () => {
      it('debería manejar correctamente cuando se aumenta la cantidad de un producto existente', () => {
        service.addToCart(mockProduct1, 2);
        service.addToCart(mockProduct1, 3); // Agregar más del mismo producto

        const items = service.items();
        expect(items.length).toBe(1);
        expect(items[0].quantity).toBe(5);
        expect(service.subtotal()).toBe(50000); // 10000 * 5
      });

      it('debería calcular correctamente con precios que tienen decimales', () => {
        const productWithDecimals: Product = {
          id: 99,
          name: 'Producto decimal',
          description: 'Test',
          price: 9990,
          image: 'test.jpg',
          categoryId: 1,
        };

        service.addToCart(productWithDecimals, 3);
        expect(service.subtotal()).toBe(29970); // 9990 * 3
      });

      it('debería retornar 0 cuando el carrito está vacío', () => {
        expect(service.subtotal()).toBe(0);
        expect(service.total()).toBe(0);
        expect(service.totalItems()).toBe(0);
      });
    });
  });
});

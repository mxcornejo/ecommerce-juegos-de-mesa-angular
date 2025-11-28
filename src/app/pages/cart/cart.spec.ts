import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { Cart } from './cart';
import { Cart as CartService } from '../../services/cart';
import { Product } from '../../models/product.interface';

describe('Cart', () => {
  let component: Cart;
  let fixture: ComponentFixture<Cart>;
  let cartService: CartService;

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

  beforeEach(async () => {
    localStorage.clear();

    const routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigate', 'createUrlTree', 'serializeUrl'],
      { events: of({}) }
    );
    routerSpy.createUrlTree.and.returnValue({} as UrlTree);
    routerSpy.serializeUrl.and.returnValue('');

    const activatedRouteMock = {
      params: of({}),
      snapshot: { params: {} },
    };

    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Cart);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);
    fixture.detectChanges();
  });

  afterEach(() => {
    cartService.clearCart();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ===============================================
  // PRUEBAS: Cálculo del total cuando cambia la cantidad
  // ===============================================

  describe('Cálculo del total del carrito cuando cambia la cantidad de un producto', () => {
    describe('Método getItemTotal - Subtotal de cada producto', () => {
      it('debería calcular correctamente el subtotal de un producto', () => {
        const subtotal = component.getItemTotal(10000, 2);
        expect(subtotal).toBe(20000);
      });

      it('debería calcular correctamente el subtotal cuando la cantidad es 1', () => {
        const subtotal = component.getItemTotal(15000, 1);
        expect(subtotal).toBe(15000);
      });

      it('debería calcular correctamente el subtotal con cantidad alta', () => {
        const subtotal = component.getItemTotal(10000, 10);
        expect(subtotal).toBe(100000);
      });

      it('debería retornar 0 cuando la cantidad es 0', () => {
        const subtotal = component.getItemTotal(10000, 0);
        expect(subtotal).toBe(0);
      });
    });

    describe('increaseQuantity - Aumentar cantidad', () => {
      it('debería aumentar la cantidad y recalcular el total', () => {
        cartService.addToCart(mockProduct1, 2);

        expect(component.subtotal).toBe(20000);
        expect(component.totalItems).toBe(2);

        component.increaseQuantity(mockProduct1.id, 2);

        expect(component.totalItems).toBe(3);
        expect(component.subtotal).toBe(30000);
      });

      it('debería recalcular el total general con múltiples productos al aumentar cantidad', () => {
        cartService.addToCart(mockProduct1, 1); // 10000
        cartService.addToCart(mockProduct2, 1); // 15000

        expect(component.subtotal).toBe(25000);

        component.increaseQuantity(mockProduct1.id, 1);

        // Nuevo total: (10000 * 2) + 15000 = 35000
        expect(component.subtotal).toBe(35000);
        expect(component.total).toBe(35000);
      });
    });

    describe('decreaseQuantity - Disminuir cantidad', () => {
      it('debería disminuir la cantidad y recalcular el total', () => {
        cartService.addToCart(mockProduct1, 3);

        expect(component.subtotal).toBe(30000);

        component.decreaseQuantity(mockProduct1.id, 3);

        expect(component.totalItems).toBe(2);
        expect(component.subtotal).toBe(20000);
      });

      it('debería recalcular el total general con múltiples productos al disminuir cantidad', () => {
        cartService.addToCart(mockProduct1, 3); // 30000
        cartService.addToCart(mockProduct2, 2); // 30000

        expect(component.subtotal).toBe(60000);

        component.decreaseQuantity(mockProduct1.id, 3);

        // Nuevo total: (10000 * 2) + (15000 * 2) = 50000
        expect(component.subtotal).toBe(50000);
      });

      it('debería eliminar el producto cuando la cantidad llega a 0', () => {
        cartService.addToCart(mockProduct1, 1);
        cartService.addToCart(mockProduct2, 1);

        expect(component.cartItems.length).toBe(2);

        component.decreaseQuantity(mockProduct1.id, 1);

        expect(component.cartItems.length).toBe(1);
        expect(component.subtotal).toBe(15000);
      });
    });

    describe('Consistencia de datos después de cambios de cantidad', () => {
      it('debería mantener consistencia entre subtotal y total', () => {
        cartService.addToCart(mockProduct1, 2);

        expect(component.subtotal).toBe(component.total);

        component.increaseQuantity(mockProduct1.id, 2);

        expect(component.subtotal).toBe(component.total);

        component.decreaseQuantity(mockProduct1.id, 3);

        expect(component.subtotal).toBe(component.total);
      });

      it('debería actualizar correctamente totalItems al cambiar cantidades', () => {
        cartService.addToCart(mockProduct1, 2);
        cartService.addToCart(mockProduct2, 3);

        expect(component.totalItems).toBe(5);

        component.increaseQuantity(mockProduct1.id, 2);
        expect(component.totalItems).toBe(6);

        component.decreaseQuantity(mockProduct2.id, 3);
        expect(component.totalItems).toBe(5);
      });

      it('no debería tener inconsistencias después de múltiples operaciones', () => {
        cartService.addToCart(mockProduct1, 1);

        for (let i = 1; i <= 5; i++) {
          component.increaseQuantity(mockProduct1.id, i);
        }

        // Después de 5 incrementos, cantidad = 6
        expect(component.totalItems).toBe(6);
        expect(component.subtotal).toBe(60000);

        // Verificar que getItemTotal coincide
        const itemTotal = component.getItemTotal(mockProduct1.price, 6);
        expect(itemTotal).toBe(component.subtotal);
      });
    });

    describe('shippingFree - Envío gratis basado en subtotal', () => {
      it('debería indicar envío gratis cuando subtotal >= 50000', () => {
        cartService.addToCart(mockProduct1, 5); // 50000

        expect(component.subtotal).toBe(50000);
        expect(component.shippingFree).toBeTrue();
      });

      it('no debería indicar envío gratis cuando subtotal < 50000', () => {
        cartService.addToCart(mockProduct1, 4); // 40000

        expect(component.subtotal).toBe(40000);
        expect(component.shippingFree).toBeFalse();
      });

      it('debería actualizar shippingFree al cambiar cantidad', () => {
        cartService.addToCart(mockProduct1, 4); // 40000
        expect(component.shippingFree).toBeFalse();

        component.increaseQuantity(mockProduct1.id, 4);
        // Ahora subtotal = 50000
        expect(component.shippingFree).toBeTrue();
      });
    });
  });
});

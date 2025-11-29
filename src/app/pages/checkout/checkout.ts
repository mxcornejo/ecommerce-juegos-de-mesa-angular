import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Cart as CartService } from '../../services/cart';
import { OrderService } from '../../services/order';

/**
 * Componente de checkout para finalizar la compra.
 * Muestra resumen del pedido y permite confirmar la orden.
 *
 * @example
 * // Navegar al checkout
 * this.router.navigate(['/checkout']);
 *
 * @usageNotes
 * - Redirige a /cart si el carrito está vacío
 * - Envío gratis para compras sobre $50.000
 * - Al confirmar, limpia el carrito y redirige a confirmación
 */
@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  /** Servicio del carrito para obtener productos y totales */
  cartService = inject(CartService);

  /** Servicio de órdenes para crear el pedido */
  orderService = inject(OrderService);

  /** Router para navegación */
  router = inject(Router);

  /**
   * Inicializa el componente.
   * Redirige al carrito si está vacío.
   */
  ngOnInit(): void {
    // Redirigir si el carrito está vacío
    if (this.cartService.items().length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  /**
   * Obtiene los items del carrito.
   *
   * @returns Lista de productos con cantidades
   */
  get cartItems() {
    return this.cartService.items();
  }

  /**
   * Obtiene el total de unidades en el carrito.
   *
   * @returns Suma de todas las cantidades
   */
  get totalItems() {
    return this.cartService.totalItems();
  }

  /**
   * Obtiene el subtotal del carrito.
   *
   * @returns Suma de (precio * cantidad) de cada producto
   */
  get subtotal() {
    return this.cartService.subtotal();
  }

  /**
   * Obtiene el costo de envío.
   *
   * @returns Costo de envío ($0 si es gratis)
   */
  get shipping() {
    return this.cartService.getShippingCost();
  }

  /**
   * Obtiene el total final incluyendo envío.
   *
   * @returns Total a pagar
   */
  get total() {
    return this.cartService.getFinalTotal();
  }

  /**
   * Indica si el envío es gratis.
   *
   * @returns true si subtotal >= $50.000
   */
  get shippingFree() {
    return this.subtotal >= 50000;
  }

  /**
   * Confirma el pedido y finaliza la compra.
   * Crea la orden, limpia el carrito y redirige a confirmación.
   *
   * @example
   * // En el template
   * <button (click)="confirmOrder()">Confirmar Pedido</button>
   */
  confirmOrder(): void {
    const order = this.orderService.createOrder(
      this.cartItems,
      this.subtotal,
      0, // tax = 0 porque está incluido en el precio
      this.shipping,
      this.total
    );

    // Limpiar el carrito
    this.cartService.clearCart();

    // Navegar a la página de confirmación
    this.router.navigate(['/confirmation'], {
      queryParams: { orderNumber: order.orderNumber },
    });
  }
}

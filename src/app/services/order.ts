import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Order } from '../models/order.interface';
import { CartItem } from '../models/cart-item.interface';

/**
 * Servicio de gestión de órdenes de compra.
 * Crea, guarda y recupera órdenes desde localStorage.
 *
 * @example
 * // Inyectar el servicio
 * private orderService = inject(OrderService);
 *
 * // Crear orden
 * const order = this.orderService.createOrder(items, 45000, 0, 5000, 50000);
 *
 * @usageNotes
 * - Genera números de orden únicos formato WW-YYYY-NNNNNN
 * - Persiste órdenes individuales en localStorage
 * - Guarda referencia a última orden para recuperación fácil
 * - Compatible con SSR (verifica plataforma browser)
 */
@Injectable({
  providedIn: 'root',
})
export class OrderService {
  /** ID de plataforma para detección SSR */
  private platformId = inject(PLATFORM_ID);

  /** Signal de la orden actual en proceso */
  private currentOrder = signal<Order | null>(null);

  /**
   * Obtiene la orden actual en memoria.
   *
   * @example
   * const order = this.orderService.getCurrentOrder();
   *
   * @returns Orden actual o null si no hay
   */
  getCurrentOrder() {
    return this.currentOrder();
  }

  /**
   * Crea una nueva orden de compra.
   *
   * @example
   * const order = this.orderService.createOrder(
   *   cartItems,  // items del carrito
   *   45000,      // subtotal
   *   0,          // impuesto
   *   5000,       // envío
   *   50000       // total
   * );
   *
   * @param items - Array de items del carrito
   * @param subtotal - Subtotal de productos
   * @param tax - Impuesto aplicado
   * @param shipping - Costo de envío
   * @param total - Total final
   * @returns Orden creada con número único
   *
   * @usageNotes
   * - Genera ID único con crypto.randomUUID()
   * - Guarda en localStorage automáticamente
   * - Estado inicial: 'confirmed'
   */
  createOrder(
    items: CartItem[],
    subtotal: number,
    tax: number,
    shipping: number,
    total: number
  ): Order {
    const orderNumber = this.generateOrderNumber();
    const order: Order = {
      id: crypto.randomUUID(),
      orderNumber,
      date: new Date(),
      items: [...items],
      subtotal,
      tax,
      shipping,
      total,
      status: 'confirmed',
    };

    this.currentOrder.set(order);
    this.saveOrderToStorage(order);
    return order;
  }

  /**
   * Obtiene una orden por su número.
   *
   * @example
   * const order = this.orderService.getOrderByNumber('WW-2025-123456');
   *
   * @param orderNumber - Número de orden a buscar
   * @returns Orden encontrada o null si no existe
   */
  getOrderByNumber(orderNumber: string): Order | null {
    if (isPlatformBrowser(this.platformId)) {
      const savedOrder = localStorage.getItem(`order_${orderNumber}`);
      if (savedOrder) {
        return JSON.parse(savedOrder);
      }
    }
    return null;
  }

  /**
   * Genera un número de orden único.
   *
   * @example
   * // Retorna: "WW-2025-847293"
   *
   * @returns Número de orden formato WW-YYYY-NNNNNN
   */
  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `WW-${year}-${random}`;
  }

  /**
   * Guarda la orden en localStorage.
   *
   * @param order - Orden a guardar
   *
   * @usageNotes
   * - Guarda con clave order_{orderNumber}
   * - Actualiza lastOrder para recuperación fácil
   */
  private saveOrderToStorage(order: Order): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(`order_${order.orderNumber}`, JSON.stringify(order));
      localStorage.setItem('lastOrder', order.orderNumber);
    }
  }

  /**
   * Obtiene la última orden realizada.
   *
   * @example
   * const lastOrder = this.orderService.getLastOrder();
   *
   * @returns Última orden o null si no hay
   *
   * @usageNotes
   * Útil para página de confirmación cuando no se tiene el orderNumber
   */
  getLastOrder(): Order | null {
    if (isPlatformBrowser(this.platformId)) {
      const lastOrderNumber = localStorage.getItem('lastOrder');
      if (lastOrderNumber) {
        return this.getOrderByNumber(lastOrderNumber);
      }
    }
    return null;
  }
}

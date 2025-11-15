import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Order } from '../models/order.interface';
import { CartItem } from '../models/cart-item.interface';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private platformId = inject(PLATFORM_ID);
  private currentOrder = signal<Order | null>(null);

  getCurrentOrder() {
    return this.currentOrder();
  }

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

  getOrderByNumber(orderNumber: string): Order | null {
    if (isPlatformBrowser(this.platformId)) {
      const savedOrder = localStorage.getItem(`order_${orderNumber}`);
      if (savedOrder) {
        return JSON.parse(savedOrder);
      }
    }
    return null;
  }

  private generateOrderNumber(): string {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `WW-${year}-${random}`;
  }

  private saveOrderToStorage(order: Order): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(`order_${order.orderNumber}`, JSON.stringify(order));
      localStorage.setItem('lastOrder', order.orderNumber);
    }
  }

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

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Cart as CartService } from '../../services/cart';
import { OrderService } from '../../services/order';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout implements OnInit {
  cartService = inject(CartService);
  orderService = inject(OrderService);
  router = inject(Router);

  ngOnInit(): void {
    // Redirigir si el carrito está vacío
    if (this.cartService.items().length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  get cartItems() {
    return this.cartService.items();
  }

  get totalItems() {
    return this.cartService.totalItems();
  }

  get subtotal() {
    return this.cartService.subtotal();
  }

  get shipping() {
    return this.cartService.getShippingCost();
  }

  get total() {
    return this.cartService.getFinalTotal();
  }

  get shippingFree() {
    return this.subtotal >= 50000;
  }

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

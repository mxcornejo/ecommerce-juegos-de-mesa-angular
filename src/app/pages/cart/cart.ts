import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Cart as CartService } from '../../services/cart';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  cartService = inject(CartService);

  get cartItems() {
    return this.cartService.items();
  }

  get totalItems() {
    return this.cartService.totalItems();
  }

  get subtotal() {
    return this.cartService.subtotal();
  }

  get total() {
    return this.cartService.total();
  }

  get shippingFree() {
    return this.subtotal >= 50000;
  }

  increaseQuantity(productId: number, currentQuantity: number): void {
    this.cartService.updateQuantity(productId, currentQuantity + 1);
  }

  decreaseQuantity(productId: number, currentQuantity: number): void {
    this.cartService.updateQuantity(productId, currentQuantity - 1);
  }

  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  getItemTotal(price: number, quantity: number): number {
    return price * quantity;
  }
}

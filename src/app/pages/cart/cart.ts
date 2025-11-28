import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Cart as CartService } from '../../services/cart';

/**
 * Componente de página del carrito de compras.
 * Muestra los productos agregados, permite modificar cantidades y eliminar items.
 *
 * @usageNotes
 * - Envío gratis para compras sobre $50.000
 * - Cantidad mínima por producto: 1
 */
@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  /** Servicio del carrito inyectado para gestionar productos */
  cartService = inject(CartService);

  /**
   * Obtiene los items del carrito.
   *
   * @returns Lista de productos en el carrito con cantidad
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
   * Obtiene el total a pagar.
   *
   * @returns Total incluyendo envío si aplica
   */
  get total() {
    return this.cartService.total();
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
   * Aumenta la cantidad de un producto en 1.
   *
   * @param productId ID del producto a modificar
   * @param currentQuantity Cantidad actual del producto
   *
   * @example
   * increaseQuantity(1, 2); // Cambia qty de 2 a 3
   */
  increaseQuantity(productId: number, currentQuantity: number): void {
    this.cartService.updateQuantity(productId, currentQuantity + 1);
  }

  /**
   * Disminuye la cantidad de un producto en 1.
   * Si llega a 0, el producto se elimina del carrito.
   *
   * @param productId ID del producto a modificar
   * @param currentQuantity Cantidad actual del producto
   *
   * @example
   * decreaseQuantity(1, 2); // Cambia qty de 2 a 1
   */
  decreaseQuantity(productId: number, currentQuantity: number): void {
    this.cartService.updateQuantity(productId, currentQuantity - 1);
  }

  /**
   * Elimina un producto del carrito.
   *
   * @param productId ID del producto a eliminar
   *
   * @example
   * removeItem(1); // Elimina producto con ID 1
   */
  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
  }

  /**
   * Calcula el total de un item (precio × cantidad).
   *
   * @param price Precio unitario del producto
   * @param quantity Cantidad del producto
   * @returns Total del item
   *
   * @example
   * getItemTotal(10000, 3); // Retorna 30000
   */
  getItemTotal(price: number, quantity: number): number {
    return price * quantity;
  }
}

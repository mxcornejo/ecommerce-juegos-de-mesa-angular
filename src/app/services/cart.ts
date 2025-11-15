import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem } from '../models/cart-item.interface';
import { Product } from '../models/product.interface';

@Injectable({
  providedIn: 'root',
})
export class Cart {
  private platformId = inject(PLATFORM_ID);
  private cartItems = signal<CartItem[]>([]);

  // Computed values
  items = this.cartItems.asReadonly();

  totalItems = computed(() => this.cartItems().reduce((total, item) => total + item.quantity, 0));

  subtotal = computed(() =>
    this.cartItems().reduce((total, item) => total + item.product.price * item.quantity, 0)
  );

  total = computed(() => this.subtotal());

  constructor() {
    // Cargar carrito del localStorage si existe (solo en el navegador)
    this.loadCartFromStorage();
  }

  addToCart(product: Product, quantity: number = 1): void {
    const currentItems = this.cartItems();
    const existingItemIndex = currentItems.findIndex((item) => item.product.id === product.id);

    if (existingItemIndex > -1) {
      // Si el producto ya existe, actualizar cantidad
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += quantity;
      this.cartItems.set(updatedItems);
    } else {
      // Si es un producto nuevo, agregarlo
      this.cartItems.set([...currentItems, { product, quantity }]);
    }

    this.saveCartToStorage();
  }

  updateQuantity(productId: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentItems = this.cartItems();
    const updatedItems = currentItems.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  removeFromCart(productId: number): void {
    const currentItems = this.cartItems();
    const updatedItems = currentItems.filter((item) => item.product.id !== productId);
    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItems.set([]);
    this.saveCartToStorage();
  }

  private saveCartToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cart', JSON.stringify(this.cartItems()));
    }
  }

  private loadCartFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartItems.set(JSON.parse(savedCart));
      }
    }
  }
}

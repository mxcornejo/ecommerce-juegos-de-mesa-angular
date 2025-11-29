import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem } from '../models/cart-item.interface';
import { Product } from '../models/product.interface';

/**
 * Servicio de carrito de compras con persistencia en localStorage.
 * Gestiona productos, cantidades y cálculos de totales.
 *
 * @example
 * // Inyectar el servicio
 * cartService = inject(Cart);
 *
 * // Agregar producto
 * this.cartService.addToCart(product, 2);
 *
 * // Obtener total
 * const total = this.cartService.getFinalTotal();
 *
 * @usageNotes
 * - Usa signals para reactividad (items, totalItems, subtotal, total)
 * - Persiste en localStorage automáticamente
 * - Compatible con SSR (verifica plataforma browser)
 * - Envío gratis sobre $50.000, sino $5.000
 */
@Injectable({
  providedIn: 'root',
})
export class Cart {
  /** ID de plataforma para detección SSR */
  private platformId = inject(PLATFORM_ID);

  /** Signal interno de items del carrito */
  private cartItems = signal<CartItem[]>([]);

  /**
   * Signal de solo lectura de items del carrito.
   *
   * @example
   * const items = this.cartService.items();
   */
  items = this.cartItems.asReadonly();

  /**
   * Computed del total de productos (suma de cantidades).
   *
   * @example
   * const count = this.cartService.totalItems(); // 5
   */
  totalItems = computed(() => this.cartItems().reduce((total, item) => total + item.quantity, 0));

  /**
   * Computed del subtotal (suma de precio * cantidad).
   *
   * @example
   * const sub = this.cartService.subtotal(); // 45000
   */
  subtotal = computed(() =>
    this.cartItems().reduce((total, item) => total + item.product.price * item.quantity, 0)
  );

  /**
   * Computed del total (igual a subtotal, sin envío).
   *
   * @example
   * const total = this.cartService.total();
   */
  total = computed(() => this.subtotal());

  /**
   * Constructor que carga carrito desde localStorage.
   *
   * @usageNotes
   * Solo carga si está en navegador (no SSR)
   */
  constructor() {
    // Cargar carrito del localStorage si existe (solo en el navegador)
    this.loadCartFromStorage();
  }

  /**
   * Agrega un producto al carrito o incrementa cantidad si ya existe.
   *
   * @example
   * this.cartService.addToCart(product, 2);
   *
   * @param product - Producto a agregar
   * @param quantity - Cantidad a agregar (default: 1)
   *
   * @usageNotes
   * Si el producto ya existe, suma la cantidad al existente
   */
  addToCart(product: Product, quantity = 1): void {
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

  /**
   * Actualiza la cantidad de un producto en el carrito.
   *
   * @example
   * this.cartService.updateQuantity(productId, 3);
   *
   * @param productId - ID del producto a actualizar
   * @param quantity - Nueva cantidad (si <=0, elimina el producto)
   */
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

  /**
   * Elimina un producto del carrito.
   *
   * @example
   * this.cartService.removeFromCart(productId);
   *
   * @param productId - ID del producto a eliminar
   */
  removeFromCart(productId: number): void {
    const currentItems = this.cartItems();
    const updatedItems = currentItems.filter((item) => item.product.id !== productId);
    this.cartItems.set(updatedItems);
    this.saveCartToStorage();
  }

  /**
   * Vacía completamente el carrito.
   *
   * @example
   * this.cartService.clearCart();
   *
   * @usageNotes
   * Se usa después de confirmar una orden
   */
  clearCart(): void {
    this.cartItems.set([]);
    this.saveCartToStorage();
  }

  /**
   * Calcula el costo de envío.
   *
   * @example
   * const shipping = this.cartService.getShippingCost();
   * // 0 si subtotal >= 50000, sino 5000
   *
   * @returns Costo de envío en CLP
   */
  getShippingCost(): number {
    return this.subtotal() >= 50000 ? 0 : 5000;
  }

  /**
   * Calcula el total final incluyendo envío.
   *
   * @example
   * const final = this.cartService.getFinalTotal();
   * // subtotal + envío
   *
   * @returns Total final en CLP
   */
  getFinalTotal(): number {
    return this.subtotal() + this.getShippingCost();
  }

  /**
   * Guarda el carrito en localStorage.
   *
   * @usageNotes
   * Se ejecuta automáticamente después de cada modificación
   */
  private saveCartToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cart', JSON.stringify(this.cartItems()));
    }
  }

  /**
   * Carga el carrito desde localStorage.
   *
   * @usageNotes
   * Se ejecuta en el constructor si está en browser
   */
  private loadCartFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        this.cartItems.set(JSON.parse(savedCart));
      }
    }
  }
}

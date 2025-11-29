import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.interface';
import { Cart } from '../../services/cart';

/**
 * Componente de tarjeta de producto para listados.
 * Muestra imagen, nombre, precio y botón de agregar al carrito.
 *
 * @example
 * // En un template:
 * <app-card-product [product]="producto"></app-card-product>
 *
 * @usageNotes
 * - Requiere input obligatorio de Product
 * - Enlaza a /product/{id} para ver detalle
 * - Permite agregar al carrito directamente desde la tarjeta
 * - Usado en Products y Categories
 */
@Component({
  selector: 'app-card-product',
  imports: [RouterLink],
  templateUrl: './card-product.html',
  styleUrl: './card-product.scss',
})
export class CardProduct {
  /**
   * Datos del producto a mostrar.
   *
   * @example
   * // product = { id: 1, name: 'Catan', price: 35000, image: '...' }
   */
  @Input() product!: Product;

  /** Servicio del carrito de compras */
  cartService = inject(Cart);

  /**
   * Agrega el producto al carrito (cantidad 1).
   *
   * @example
   * // <button (click)="addToCart($event)">Agregar</button>
   *
   * @param event - Evento del click para prevenir navegación
   *
   * @usageNotes
   * Usa stopPropagation para evitar que el click navegue al detalle
   */
  addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(this.product, 1);
  }
}

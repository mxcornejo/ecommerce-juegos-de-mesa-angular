import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product as ProductModel } from '../../models/product.interface';
import { Category } from '../../models/category.interface';
import { PRODUCTS, CATEGORIES } from '../../data/mock-data';
import { Cart } from '../../services/cart';

/**
 * Componente de detalle de producto individual.
 * Muestra información completa del producto y permite agregarlo al carrito.
 *
 * @example
 * // Ruta en app.routes.ts:
 * { path: 'product/:id', component: Product }
 *
 * // Navegar a un producto:
 * this.router.navigate(['/product', 123]);
 *
 * @usageNotes
 * - Obtiene el ID del producto desde la URL (:id)
 * - Muestra precio con descuento del 15%
 * - Cantidad seleccionable de 1 a 10 unidades
 * - Redirige al carrito después de agregar
 */
@Component({
  selector: 'app-product',
  imports: [CommonModule, RouterLink],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class Product implements OnInit {
  /** Servicio de rutas para obtener parámetros de URL */
  private route = inject(ActivatedRoute);

  /** Router para navegación programática */
  private router = inject(Router);

  /** Servicio del carrito de compras */
  cartService = inject(Cart);

  /** Producto actual a mostrar */
  product: ProductModel | undefined;

  /** Categoría del producto actual */
  category: Category | undefined;

  /** Porcentaje de descuento aplicado (15%) */
  readonly discountPercentage = 15;

  /** Cantidad seleccionada para agregar al carrito (1-10) */
  quantity = signal(1);

  /**
   * Inicializa el componente cargando el producto por ID de la URL.
   *
   * @example
   * // URL: /product/5
   * // Busca producto con id=5 en PRODUCTS
   *
   * @usageNotes
   * También carga la categoría asociada al producto
   */
  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    this.product = PRODUCTS.find((p) => p.id === productId);

    if (this.product) {
      this.category = CATEGORIES.find((c) => c.id === this.product!.categoryId);
    }
  }

  /**
   * Calcula el precio original antes del descuento del 15%.
   *
   * @example
   * // Si product.price = 85, retorna 100 (precio original)
   * const original = this.discount;
   *
   * @returns Precio original redondeado o 0 si no hay producto
   */
  get discount(): number {
    // Calcula un descuento del 15% para mostrar el precio original
    return this.product ? Math.round(this.product.price / 0.85) : 0;
  }

  /**
   * Incrementa la cantidad seleccionada en 1 (máximo 10).
   *
   * @example
   * // <button (click)="increaseQuantity()">+</button>
   */
  increaseQuantity() {
    if (this.quantity() < 10) {
      this.quantity.update((q) => q + 1);
    }
  }

  /**
   * Decrementa la cantidad seleccionada en 1 (mínimo 1).
   *
   * @example
   * // <button (click)="decreaseQuantity()">-</button>
   */
  decreaseQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  /**
   * Agrega el producto al carrito con la cantidad seleccionada.
   *
   * @example
   * // <button (click)="addToCart()">Agregar al carrito</button>
   *
   * @usageNotes
   * Navega automáticamente a /cart después de agregar
   */
  addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity());
      this.router.navigate(['/cart']);
    }
  }
}

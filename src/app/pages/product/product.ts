import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product as ProductModel } from '../../models/product.interface';
import { Category } from '../../models/category.interface';
import { PRODUCTS, CATEGORIES } from '../../data/mock-data';
import { Cart } from '../../services/cart';

@Component({
  selector: 'app-product',
  imports: [CommonModule, RouterLink],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class Product implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  cartService = inject(Cart);

  product: ProductModel | undefined;
  category: Category | undefined;
  readonly discountPercentage = 15;
  quantity = signal(1);

  ngOnInit(): void {
    const productId = Number(this.route.snapshot.paramMap.get('id'));
    this.product = PRODUCTS.find((p) => p.id === productId);

    if (this.product) {
      this.category = CATEGORIES.find((c) => c.id === this.product!.categoryId);
    }
  }

  get discount(): number {
    // Calcula un descuento del 15% para mostrar el precio original
    return this.product ? Math.round(this.product.price / 0.85) : 0;
  }

  increaseQuantity() {
    if (this.quantity() < 10) {
      this.quantity.update((q) => q + 1);
    }
  }

  decreaseQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update((q) => q - 1);
    }
  }

  addToCart() {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity());
      this.router.navigate(['/cart']);
    }
  }
}

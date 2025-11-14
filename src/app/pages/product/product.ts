import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product as ProductModel } from '../../models/product.interface';
import { Category } from '../../models/category.interface';
import { PRODUCTS, CATEGORIES } from '../../data/mock-data';

@Component({
  selector: 'app-product',
  imports: [CommonModule, RouterLink],
  templateUrl: './product.html',
  styleUrl: './product.scss',
})
export class Product implements OnInit {
  private route = inject(ActivatedRoute);

  product: ProductModel | undefined;
  category: Category | undefined;
  readonly discountPercentage = 15;

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
}

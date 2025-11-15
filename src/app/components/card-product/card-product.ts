import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.interface';
import { Cart } from '../../services/cart';

@Component({
  selector: 'app-card-product',
  imports: [RouterLink],
  templateUrl: './card-product.html',
  styleUrl: './card-product.scss',
})
export class CardProduct {
  @Input() product!: Product;
  cartService = inject(Cart);

  addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(this.product, 1);
  }
}

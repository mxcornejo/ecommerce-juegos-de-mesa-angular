import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CATEGORIES } from '../../data/mock-data';
import { Category } from '../../models/category.interface';
import { Cart } from '../../services/cart';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private router = inject(Router);
  cartService = inject(Cart);
  categories: Category[] = CATEGORIES;

  get cartItemCount() {
    return this.cartService.totalItems();
  }

  navigateToProducts() {
    this.router.navigate(['/products']);
  }
}

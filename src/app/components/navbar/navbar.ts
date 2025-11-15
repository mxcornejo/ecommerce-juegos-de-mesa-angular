import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CATEGORIES } from '../../data/mock-data';
import { Category } from '../../models/category.interface';
import { Cart } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  private router = inject(Router);
  cartService = inject(Cart);
  authService = inject(AuthService);
  categories: Category[] = CATEGORIES;

  get cartItemCount() {
    return this.cartService.totalItems();
  }

  // Exponer signals directamente
  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.authService.currentUser;

  navigateToProducts() {
    this.router.navigate(['/products']);
  }

  onLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }
}

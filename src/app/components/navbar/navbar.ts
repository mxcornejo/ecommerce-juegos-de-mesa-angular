import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CATEGORIES } from '../../data/mock-data';
import { Category } from '../../models/category.interface';
import { Cart } from '../../services/cart';
import { AuthService } from '../../services/auth';

/**
 * Componente de barra de navegación principal.
 * Muestra el logo, enlaces de navegación, categorías, carrito y opciones de usuario.
 *
 * @example
 * // En app.html:
 * <app-navbar></app-navbar>
 *
 * @usageNotes
 * - Incluido en el layout principal de la aplicación
 * - Muestra contador de items en el carrito en tiempo real
 * - Adapta opciones según estado de autenticación (usuario/admin)
 * - Contiene menú de categorías con navegación a productos filtrados
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  /** Router para navegación programática */
  private router = inject(Router);

  /** Servicio del carrito de compras */
  cartService = inject(Cart);

  /** Servicio de autenticación */
  authService = inject(AuthService);

  /** Lista de categorías para el menú de navegación */
  categories: Category[] = CATEGORIES;

  /**
   * Obtiene el número total de items en el carrito.
   * @returns Cantidad total de productos en el carrito
   */
  get cartItemCount() {
    return this.cartService.totalItems();
  }

  /** Signal que indica si el usuario está autenticado */
  isAuthenticated = this.authService.isAuthenticated;

  /** Signal con los datos del usuario actual */
  currentUser = this.authService.currentUser;

  /** Signal que indica si hay una sesión de admin activa */
  isAdminAuth = this.authService.isAdminAuth;

  /**
   * Navega a la página de productos.
   */
  navigateToProducts() {
    this.router.navigate(['/products']);
  }

  /**
   * Cierra la sesión del usuario actual.
   * Muestra confirmación antes de cerrar sesión.
   */
  onLogout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }

  /**
   * Cierra la sesión del administrador.
   * Muestra confirmación antes de cerrar sesión.
   */
  onAdminLogout() {
    if (confirm('¿Cerrar sesión del panel de administración?')) {
      this.authService.adminLogout();
    }
  }
}

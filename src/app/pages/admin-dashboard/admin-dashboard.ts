import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { ApiService } from '../../services/api.service';
import { User } from '../../models/user.interface';
import { Product } from '../../models/product.interface';
import { Category } from '../../models/category.interface';
import { FormsModule } from '@angular/forms';

/**
 * Componente del panel de administración.
 * Permite gestionar usuarios registrados: visualizar, buscar y eliminar.
 *
 * @example
 * // Navegar al dashboard (requiere autenticación admin)
 * this.router.navigate(['/admin-dashboard']);
 *
 * @usageNotes
 * - Solo accesible para administradores autenticados
 * - Muestra estadísticas de usuarios registrados
 * - Búsqueda en tiempo real por nombre, usuario o email
 */
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  /** Servicio de autenticación para gestión de usuarios */
  private authService = inject(AuthService);

  /** Servicio de API para obtener productos */
  private apiService = inject(ApiService);

  /** Router para navegación */
  private router = inject(Router);

  /** Lista de todos los usuarios registrados */
  allUsers = signal<User[]>([]);

  /** Lista de todos los productos */
  allProducts = signal<Product[]>([]);

  /** Lista de categorías para el formulario */
  categories = signal<Category[]>([]);

  /** Producto seleccionado para edición o nuevo producto */
  selectedProduct: Partial<Product> = {};

  /** Indica si el modal de producto está visible */
  showProductModal = false;

  /** Indica si se está editando un producto existente */
  isEditing = false;

  /** Término de búsqueda actual */
  searchTerm = signal<string>('');

  /** Estadísticas de usuarios (total y registros de hoy) */
  stats = signal<{ total: number; todayRegistrations: number }>({
    total: 0,
    todayRegistrations: 0,
  });

  /** Hora de la última actualización de datos */
  lastUpdate = signal<string>('');

  /**
   * Usuarios filtrados según el término de búsqueda.
   * Filtra por nombre, usuario o email (case-insensitive).
   *
   * @returns Lista de usuarios que coinciden con la búsqueda
   */
  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.allUsers();

    return this.allUsers().filter(
      (user) =>
        user.nombre.toLowerCase().includes(term) ||
        user.usuario.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
    );
  });

  /**
   * Inicializa el componente cargando la lista de usuarios y productos.
   */
  ngOnInit(): void {
    this.loadUsers();
    this.loadProducts();
    this.loadCategories();
  }

  /**
   * Carga la lista de usuarios y estadísticas desde el servicio.
   * Actualiza también la hora de última actualización.
   */
  loadUsers(): void {
    this.allUsers.set(this.authService.getRegisteredUsers());
    this.stats.set(this.authService.getUserStats());
    this.updateLastUpdateTime();
  }

  /**
   * Carga la lista de productos desde el servicio API.
   */
  loadProducts(): void {
    this.apiService.getProducts().subscribe((products) => {
      this.allProducts.set(products);
    });
  }

  /**
   * Carga la lista de categorías desde el servicio API.
   */
  loadCategories(): void {
    this.apiService.getCategories().subscribe((categories) => {
      this.categories.set(categories);
    });
  }

  /**
   * Abre el modal para crear o editar un producto.
   * @param product Producto a editar (opcional)
   */
  openProductModal(product?: Product) {
    if (product) {
      this.selectedProduct = { ...product };
      this.isEditing = true;
    } else {
      this.selectedProduct = {
        name: '',
        description: '',
        price: 0,
        image: '',
        categoryId: 0,
      };
      this.isEditing = false;
    }
    this.showProductModal = true;
  }

  /**
   * Cierra el modal de producto.
   */
  closeProductModal() {
    this.showProductModal = false;
    this.selectedProduct = {};
  }

  /**
   * Guarda el producto (crear o actualizar).
   */
  saveProduct() {
    if (this.isEditing && this.selectedProduct.id) {
      this.apiService.updateProduct(this.selectedProduct as Product).subscribe(() => {
        this.loadProducts();
        this.closeProductModal();
      });
    } else {
      this.apiService.addProduct(this.selectedProduct as Omit<Product, 'id'>).subscribe(() => {
        this.loadProducts();
        this.closeProductModal();
      });
    }
  }

  /**
   * Elimina un producto.
   * @param id ID del producto a eliminar
   */
  deleteProduct(id: number) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.apiService.deleteProduct(id).subscribe(() => {
        this.loadProducts();
      });
    }
  }

  /**
   * Actualiza el timestamp de última actualización.
   * Formato: HH:MM en español.
   */
  updateLastUpdateTime(): void {
    const now = new Date();
    this.lastUpdate.set(
      now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      })
    );
  }

  /**
   * Elimina un usuario del sistema previa confirmación.
   *
   * @param userId ID único del usuario a eliminar
   * @param userName Nombre del usuario (para mostrar en confirmación)
   *
   * @example
   * deleteUser('abc123', 'Juan Pérez');
   */
  deleteUser(userId: string, userName: string): void {
    if (!confirm(`¿Estás seguro de que deseas eliminar al usuario "${userName}"?`)) {
      return;
    }

    const result = this.authService.deleteUser(userId);

    if (result.success) {
      this.loadUsers(); // Recargar la lista
      alert(result.message);
    } else {
      alert(result.message);
    }
  }

  /**
   * Maneja el cambio en el campo de búsqueda.
   * Actualiza el signal searchTerm para filtrar usuarios.
   *
   * @param event Evento del input de búsqueda
   */
  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  /**
   * Recarga la lista de usuarios manualmente.
   * Útil para refrescar datos después de cambios externos.
   */
  reloadList(): void {
    this.loadUsers();
  }

  /**
   * Formatea una fecha ISO a formato legible.
   *
   * @param isoDate Fecha en formato ISO (ej: '2025-11-28T10:30:00')
   * @returns Fecha formateada en español
   *
   * @example
   * formatDate('2025-11-28T10:30:00'); // '28/11/2025'
   */
  formatDate(isoDate: string): string {
    return this.authService.formatDate(isoDate);
  }
}

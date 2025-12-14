import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Banner } from '../../components/banner/banner';
import { CardProduct } from '../../components/card-product/card-product';
import { ApiService } from '../../services/api.service';
import { Product } from '../../models/product.interface';
import { Category } from '../../models/category.interface';
import { forkJoin } from 'rxjs';

/**
 * Componente de listado de productos por categoría.
 * Muestra productos agrupados y permite filtrar por categoría.
 *
 * @example
 * // Ruta en app.routes.ts:
 * { path: 'products', component: Products }
 *
 * // Filtrar por categoría:
 * // /products?category=estrategia
 *
 * @usageNotes
 * - Sin queryParam muestra todas las categorías
 * - Con ?category=slug filtra por esa categoría específica
 * - Se suscribe a cambios de queryParams para filtrado reactivo
 */
@Component({
  selector: 'app-products',
  imports: [Banner, CardProduct],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  /** Servicio de rutas para obtener queryParams */
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  /** Lista completa de productos */
  products: Product[] = [];

  /** Lista completa de categorías */
  categories: Category[] = [];

  /** Categorías filtradas a mostrar */
  filteredCategories: Category[] = [];

  /** Slug de la categoría seleccionada desde queryParams */
  selectedCategorySlug: string | null = null;

  /**
   * Inicializa el componente suscribiéndose a cambios de queryParams.
   *
   * @example
   * // Al navegar a /products?category=familiar
   * // Se actualiza selectedCategorySlug y filtra categorías
   *
   * @usageNotes
   * Usa subscribe para reaccionar a cambios de navegación sin recargar
   */
  ngOnInit() {
    forkJoin({
      products: this.apiService.getProducts(),
      categories: this.apiService.getCategories(),
    }).subscribe(({ products, categories }) => {
      this.products = products;
      this.categories = categories;

      this.route.queryParamMap.subscribe((params) => {
        this.selectedCategorySlug = params.get('category');
        this.filterCategories();
      });
    });
  }

  /**
   * Filtra las categorías según el slug seleccionado.
   *
   * @example
   * // Con selectedCategorySlug = 'estrategia'
   * // filteredCategories contendrá solo esa categoría
   *
   * @usageNotes
   * Si no hay slug seleccionado, muestra todas las categorías
   */
  filterCategories() {
    if (this.selectedCategorySlug) {
      this.filteredCategories = this.categories.filter(
        (cat) => cat.slug === this.selectedCategorySlug
      );
    } else {
      this.filteredCategories = this.categories;
    }
  }

  /**
   * Obtiene los productos de una categoría específica.
   *
   * @example
   * // En el template:
   * // *ngFor="let product of getProductsByCategory(category.id)"
   *
   * @param categoryId - ID de la categoría a filtrar
   * @returns Array de productos pertenecientes a esa categoría
   */
  getProductsByCategory(categoryId: number): Product[] {
    return this.products.filter((product) => product.categoryId === categoryId);
  }
}

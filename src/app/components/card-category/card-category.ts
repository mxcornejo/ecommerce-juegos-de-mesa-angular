import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../models/category.interface';

/**
 * Componente de tarjeta de categoría para mostrar en el home.
 * Muestra imagen, nombre y enlace a productos filtrados.
 *
 * @example
 * // En un template:
 * <app-card-category [category]="categoria"></app-card-category>
 *
 * @usageNotes
 * - Requiere input obligatorio de Category
 * - Enlaza a /products?category={slug}
 * - Usado en el componente Categories
 */
@Component({
  selector: 'app-card-category',
  imports: [RouterLink],
  templateUrl: './card-category.html',
  styleUrl: './card-category.scss',
})
export class CardCategory {
  /**
   * Datos de la categoría a mostrar.
   *
   * @example
   * // category = { id: 1, name: 'Estrategia', slug: 'estrategia', image: '...' }
   */
  @Input() category!: Category;
}

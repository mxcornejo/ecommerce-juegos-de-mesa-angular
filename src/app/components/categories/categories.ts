import { Component } from '@angular/core';
import { CardCategory } from '../card-category/card-category';
import { CATEGORIES } from '../../data/mock-data';
import { Category } from '../../models/category.interface';

/**
 * Componente contenedor que muestra el grid de categorías.
 * Renderiza una CardCategory por cada categoría disponible.
 *
 * @example
 * // En un template:
 * <app-categories></app-categories>
 *
 * @usageNotes
 * - Carga categorías desde mock-data
 * - Usado en la página Home
 * - Itera sobre categories para mostrar CardCategory
 */
@Component({
  selector: 'app-categories',
  imports: [CardCategory],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories {
  /**
   * Lista de categorías a mostrar desde mock-data.
   *
   * @example
   * // Se usa en template con *ngFor
   * // *ngFor="let category of categories"
   */
  categories: Category[] = CATEGORIES;
}

import { Component, OnInit } from '@angular/core';
import { CardCategory } from '../card-category/card-category';
import { ApiService } from '../../services/api.service';
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
 * - Carga categorías desde ApiService
 * - Usado en la página Home
 * - Itera sobre categories para mostrar CardCategory
 */
@Component({
  selector: 'app-categories',
  imports: [CardCategory],
  templateUrl: './categories.html',
  styleUrl: './categories.scss',
})
export class Categories implements OnInit {
  /**
   * Lista de categorías a mostrar.
   *
   * @example
   * // Se usa en template con *ngFor
   * // *ngFor="let category of categories"
   */
  categories: Category[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.apiService.getCategories().subscribe((data) => {
      this.categories = data;
    });
  }
}

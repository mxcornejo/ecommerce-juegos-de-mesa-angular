import { Component } from '@angular/core';

/**
 * Componente hero/banner principal de la página de inicio.
 * Muestra una sección destacada con imagen de fondo y llamada a la acción.
 *
 * @example
 * // En home.html:
 * <app-hero></app-hero>
 *
 * @usageNotes
 * - Componente presentacional sin lógica
 * - Utilizado en la página Home como sección principal
 * - Los estilos de fondo e imagen se definen en hero.scss
 */
@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {}

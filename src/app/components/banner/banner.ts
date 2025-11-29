import { Component } from '@angular/core';

/**
 * Componente de banner decorativo para páginas de productos.
 * Muestra un encabezado visual en la sección de catálogo.
 *
 * @example
 * // En un template:
 * <app-banner></app-banner>
 *
 * @usageNotes
 * - Componente presentacional sin lógica
 * - Usado en la página de Products
 * - Estilos definidos en banner.scss
 */
@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.scss',
})
export class Banner {}

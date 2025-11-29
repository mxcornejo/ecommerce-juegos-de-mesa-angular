import { Component } from '@angular/core';
import { Hero } from '../../components/hero/hero';
import { Categories } from '../../components/categories/categories';

/**
 * Componente de página principal (Home) del e-commerce.
 * Muestra el hero banner y las categorías de productos.
 *
 * @example
 * // Ruta en app.routes.ts:
 * { path: '', component: Home }
 *
 * @usageNotes
 * - Página de inicio por defecto del sitio
 * - Compone los componentes Hero y Categories
 * - No requiere autenticación
 */
@Component({
  selector: 'app-home',
  imports: [Hero, Categories],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Componente de pie de página del sitio.
 * Muestra enlaces de navegación, información de contacto y copyright.
 *
 * @example
 * // En app.html:
 * <app-footer></app-footer>
 *
 * @usageNotes
 * - Componente presentacional sin lógica
 * - Incluido en el layout principal (app.html)
 * - Contiene enlaces de navegación con RouterLink
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {}

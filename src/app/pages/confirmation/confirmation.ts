import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order';
import { Order } from '../../models/order.interface';

/**
 * Componente de confirmación de pedido que muestra los detalles
 * de una orden completada después del checkout.
 *
 * @example
 * // Navegar a confirmación con número de orden
 * this.router.navigate(['/confirmation'], {
 *   queryParams: { orderNumber: 'ORD-123456' }
 * });
 *
 * @usageNotes
 * - Busca la orden por queryParam 'orderNumber' o muestra la última orden
 * - Redirige al home si no encuentra ninguna orden válida
 * - Incluye funcionalidad de impresión del comprobante
 */
@Component({
  selector: 'app-confirmation',
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.scss',
})
export class Confirmation implements OnInit {
  /** Servicio de rutas para obtener parámetros de la URL */
  private route = inject(ActivatedRoute);

  /** Router para navegación programática */
  private router = inject(Router);

  /** Servicio de órdenes para consultar pedidos */
  private orderService = inject(OrderService);

  /** Orden actual a mostrar, null si no se encuentra */
  order: Order | null = null;

  /**
   * Inicializa el componente buscando la orden correspondiente.
   *
   * @example
   * // Se ejecuta automáticamente al cargar el componente
   * // Busca por orderNumber en queryParams o usa la última orden
   *
   * @usageNotes
   * Prioridad de búsqueda:
   * 1. Por número de orden en queryParams
   * 2. Última orden registrada
   * 3. Redirige a home si no hay orden
   */
  ngOnInit(): void {
    const orderNumber = this.route.snapshot.queryParamMap.get('orderNumber');

    if (orderNumber) {
      this.order = this.orderService.getOrderByNumber(orderNumber);
    } else {
      // Intentar obtener la última orden
      this.order = this.orderService.getLastOrder();
    }

    // Si no hay orden, redirigir al inicio
    if (!this.order) {
      this.router.navigate(['/']);
    }
  }

  /**
   * Obtiene la fecha de la orden formateada en español (Chile).
   *
   * @example
   * // Retorna: "28 de noviembre de 2025, 14:30"
   * const fecha = this.orderDate;
   *
   * @returns Fecha formateada o string vacío si no hay orden
   */
  get orderDate(): string {
    if (!this.order) return '';
    return new Date(this.order.date).toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Abre el diálogo de impresión del navegador para imprimir el comprobante.
   *
   * @example
   * // En el template:
   * // <button (click)="printOrder()">Imprimir</button>
   *
   * @usageNotes
   * Utiliza window.print() nativo del navegador
   */
  printOrder(): void {
    window.print();
  }
}

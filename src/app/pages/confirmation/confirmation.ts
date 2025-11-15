import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order';
import { Order } from '../../models/order.interface';

@Component({
  selector: 'app-confirmation',
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.scss',
})
export class Confirmation implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);

  order: Order | null = null;

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

  printOrder(): void {
    window.print();
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SalesOrder,
  SalesOrderCreate,
  ReservationResult,
  OrderStatus, AvailabilityCheck
} from '../models/sales-order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8088/api/sales-orders';
  private url='http://localhost:8088/api/sales-orders/business'

  constructor(private http: HttpClient) {}

  // Créer une commande
  createOrder(orderData: SalesOrderCreate): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(this.apiUrl, orderData);
  }

  createOrderForClient(orderData: any): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(`${this.apiUrl}/client/create`, orderData);
  }

  getMyOrders(): Observable<SalesOrder[]> {
    // Essayez différents champs pour l'ID
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // Option 1: Chercher par email (si votre backend supporte)
    const email = currentUser.email;
    console.log('Current user email:', email);

    if (!email) {
      throw new Error('User email not found');
    }

    return this.http.get<SalesOrder[]>(`${this.apiUrl}/client/email/${email}`);
  }

  // Récupérer une commande par ID
  getOrderById(id: number): Observable<SalesOrder> {
    return this.http.get<SalesOrder>(`${this.apiUrl}/${id}`);
  }

  // Annuler une commande
  cancelOrder(id: number | undefined): Observable<any> {
    return this.http.post(`${this.url}/${id}/cancel`, {});
  }

  // Réserver le stock pour une commande
  reserveOrder(id: number): Observable<ReservationResult> {
    return this.http.post<ReservationResult>(`${this.apiUrl}/${id}/reserve`, {});
  }

  getOrderStatus(order: SalesOrder): OrderStatus {
    if (order.deliveredAt) return OrderStatus.DELIVERED;
    if (order.shippedAt) return OrderStatus.SHIPPED;
    if (order.reservedAt) return OrderStatus.RESERVED;
    return OrderStatus.CREATED;
  }
  getOrderStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'CREATED': 'bg-yellow-100 text-yellow-800',
      'RESERVED': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getOrderStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'CREATED': 'Créée',
      'RESERVED': 'Réservée',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée'
    };
    return labels[status] || status;
  }

  checkAvailability(orderId: number, warehouseId: number): Observable<AvailabilityCheck> {
    return this.http.get<AvailabilityCheck>(
      `${this.url}/${orderId}/check?warehouseId=${warehouseId}`
    );
  }

  // ========================================================================
  // MÉTHODES UTILITAIRES
  // ========================================================================

  /**
   * ⭐ Calculer le total d'une commande à partir de ses lignes
   */
  calculateOrderTotal(order: SalesOrder): number {
    if (!order.orderLines || order.orderLines.length === 0) {
      return 0;
    }

    return order.orderLines.reduce((total, line) => {
      return total + (line.totalPrice || (line.quantity * line.unitPrice));
    }, 0);
  }

  /**
   * ⭐ Calculer le nombre total d'articles
   */
  calculateTotalItems(order: SalesOrder): number {
    if (!order.orderLines || order.orderLines.length === 0) {
      return 0;
    }

    return order.orderLines.reduce((total, line) => {
      return total + line.quantity;
    }, 0);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '-';

    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Vérifier si une commande peut être annulée
   */
  canCancelOrder(order: SalesOrder): boolean {
    const status = this.getOrderStatus(order);
    return status === OrderStatus.CREATED || status === OrderStatus.RESERVED;
  }

  /**
   * Vérifier si une commande peut être modifiée
   */
  canEditOrder(order: SalesOrder): boolean {
    const status = this.getOrderStatus(order);
    return status === OrderStatus.CREATED;
  }
}

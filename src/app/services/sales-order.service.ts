// services/sales-order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  SalesOrder,
  SalesOrderCreate,
  SalesOrderUpdate,
  SalesOrderLine,
  SalesOrderLineCreate,
  SalesOrderLineUpdate,
  ReservationResult,
  AvailabilityCheck,
  ShipmentResult,
  CancellationResult,
  DeliveryResponse
} from '../models/sales-order.model';

@Injectable({
  providedIn: 'root'
})
export class SalesOrderService {
  private apiUrl = 'http://localhost:8088/api';

  constructor(private http: HttpClient) {}

  // Sales Order CRUD
  getAllOrders(): Observable<SalesOrder[]> {
    return this.http.get<SalesOrder[]>(`${this.apiUrl}/sales-orders`);
  }

  getOrderById(id: number): Observable<SalesOrder> {
    return this.http.get<SalesOrder>(`${this.apiUrl}/sales-orders/${id}`);
  }

  getOrdersByClient(clientId: number): Observable<SalesOrder[]> {
    return this.http.get<SalesOrder[]>(`${this.apiUrl}/sales-orders/client/${clientId}`);
  }

  createOrder(order: SalesOrderCreate): Observable<SalesOrder> {
    return this.http.post<SalesOrder>(`${this.apiUrl}/sales-orders`, order);
  }

  updateOrder(id: number, order: SalesOrderUpdate): Observable<SalesOrder> {
    return this.http.put<SalesOrder>(`${this.apiUrl}/sales-orders/${id}`, order);
  }

  deleteOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sales-orders/${id}`);
  }

  // Sales Order Lines
  getLinesByOrder(orderId: number): Observable<SalesOrderLine[]> {
    return this.http.get<SalesOrderLine[]>(`${this.apiUrl}/sales-order-lines/order/${orderId}`);
  }

  getLineById(id: number): Observable<SalesOrderLine> {
    return this.http.get<SalesOrderLine>(`${this.apiUrl}/sales-order-lines/${id}`);
  }

  addLineToOrder(orderId: number, line: SalesOrderLineCreate): Observable<SalesOrderLine> {
    return this.http.post<SalesOrderLine>(`${this.apiUrl}/sales-order-lines/order/${orderId}`, line);
  }

  updateLine(id: number, line: SalesOrderLineUpdate): Observable<SalesOrderLine> {
    return this.http.put<SalesOrderLine>(`${this.apiUrl}/sales-order-lines/${id}`, line);
  }

  deleteLine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/sales-order-lines/${id}`);
  }

  // Business Operations
  reserveOrder(orderId: number, warehouseId: number): Observable<ReservationResult> {
    const params = new HttpParams().set('warehouseId', warehouseId.toString());
    return this.http.post<ReservationResult>(
      `${this.apiUrl}/sales-orders/business/${orderId}/reserve`,
      null,
      { params }
    );
  }

  checkAvailability(orderId: number, warehouseId: number): Observable<AvailabilityCheck> {
    const params = new HttpParams().set('warehouseId', warehouseId.toString());
    return this.http.get<AvailabilityCheck>(
      `${this.apiUrl}/sales-orders/business/${orderId}/check`,
      { params }
    );
  }

  shipOrder(orderId: number, warehouseId: number): Observable<ShipmentResult> {
    const params = new HttpParams().set('warehouseId', warehouseId.toString());
    return this.http.post<ShipmentResult>(
      `${this.apiUrl}/sales-orders/business/${orderId}/ship`,
      null,
      { params }
    );
  }

  deliverOrder(orderId: number): Observable<DeliveryResponse> {
    return this.http.post<DeliveryResponse>(
      `${this.apiUrl}/sales-orders/business/${orderId}/deliver`,
      null
    );
  }

  cancelOrder(orderId: number, reason: string, warehouseId: number): Observable<CancellationResult> {
    const params = new HttpParams().set('warehouseId', warehouseId.toString());
    return this.http.post<CancellationResult>(
      `${this.apiUrl}/sales-orders/business/${orderId}/cancel`,
      { reason },
      { params }
    );
  }

  // Utility method to determine order status
  getOrderStatus(order: SalesOrder): string {
    if (order.deliveredAt) return 'DELIVERED';
    if (order.shippedAt) return 'SHIPPED';
    if (order.reservedAt) return 'RESERVED';
    return 'CREATED';
  }

  // Utility method to get status badge class
  getStatusBadgeClass(order: SalesOrder): string {
    const status = this.getOrderStatus(order);
    const classes: { [key: string]: string } = {
      'CREATED': 'badge-info',
      'RESERVED': 'badge-warning',
      'SHIPPED': 'badge-primary',
      'DELIVERED': 'badge-success'
    };
    return classes[status] || 'badge-secondary';
  }
}

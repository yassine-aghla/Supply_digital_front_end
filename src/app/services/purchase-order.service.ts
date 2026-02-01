// services/purchase-order.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PurchaseOrder,
  CreatePurchaseOrderRequest,
  UpdatePurchaseOrderStatusRequest,
  PurchaseOrderLine,
  ReceiptResult,
  ApprovalResult,
  CancellationResult,
  ReceptionStatus,
  StockAvailabilityForPO,
  PurchaseOrderStatus
} from '../models/purchase-order.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseOrderService {
  private apiUrl = 'http://localhost:8088/api';

  constructor(private http: HttpClient) {}

  // ============ CRUD Purchase Orders ============
  createPurchaseOrder(request: CreatePurchaseOrderRequest): Observable<PurchaseOrder> {
    return this.http.post<PurchaseOrder>(`${this.apiUrl}/purchase-orders`, request);
  }

  getAllPurchaseOrders(): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.apiUrl}/purchase-orders`);
  }

  getPurchaseOrderById(id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`${this.apiUrl}/purchase-orders/${id}`);
  }

  updatePurchaseOrderStatus(id: number, request: UpdatePurchaseOrderStatusRequest): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`${this.apiUrl}/purchase-orders/${id}/status`, request);
  }

  getPurchaseOrdersByStatus(status: string): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.apiUrl}/purchase-orders/status/${status}`);
  }

  getPurchaseOrdersBySupplier(supplierId: number): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.apiUrl}/purchase-orders/supplier/${supplierId}`);
  }

  getPurchaseOrdersByWarehouseManager(warehouseManagerId: number): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`${this.apiUrl}/purchase-orders/warehouse-manager/${warehouseManagerId}`);
  }

  deletePurchaseOrder(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/purchase-orders/${id}`);
  }

  // ============ Purchase Order Lines ============
  getAllOrderLines(): Observable<PurchaseOrderLine[]> {
    return this.http.get<PurchaseOrderLine[]>(`${this.apiUrl}/purchase-order-lines`);
  }

  getOrderLineById(id: number): Observable<PurchaseOrderLine> {
    return this.http.get<PurchaseOrderLine>(`${this.apiUrl}/purchase-order-lines/${id}`);
  }

  getOrderLinesByPurchaseOrder(purchaseOrderId: number): Observable<PurchaseOrderLine[]> {
    return this.http.get<PurchaseOrderLine[]>(`${this.apiUrl}/purchase-order-lines/purchase-order/${purchaseOrderId}`);
  }

  getOrderLinesByProduct(productId: number): Observable<PurchaseOrderLine[]> {
    return this.http.get<PurchaseOrderLine[]>(`${this.apiUrl}/purchase-order-lines/product/${productId}`);
  }

  getPendingOrderLinesByProduct(productId: number): Observable<PurchaseOrderLine[]> {
    return this.http.get<PurchaseOrderLine[]>(`${this.apiUrl}/purchase-order-lines/product/${productId}/pending`);
  }

  getTotalQuantityOrderedByProduct(productId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/purchase-order-lines/product/${productId}/total-quantity`);
  }

  deleteOrderLine(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/purchase-order-lines/${id}`);
  }

  // ============ Business Operations ============
  receiveFullOrder(poId: number, warehouseId: number): Observable<ReceiptResult> {
    const params = new HttpParams().set('warehouseId', warehouseId.toString());
    return this.http.post<ReceiptResult>(
      `${this.apiUrl}/purchase-orders/business/${poId}/receive-full`,
      null,
      { params }
    );
  }

  approvePurchaseOrder(poId: number): Observable<ApprovalResult> {
    return this.http.post<ApprovalResult>(
      `${this.apiUrl}/purchase-orders/business/${poId}/approve`,
      null
    );
  }

  cancelPurchaseOrder(poId: number, reason: string): Observable<CancellationResult> {
    return this.http.post<CancellationResult>(
      `${this.apiUrl}/purchase-orders/business/${poId}/cancel`,
      { reason }
    );
  }

  checkReceptionStatus(poId: number): Observable<ReceptionStatus> {
    return this.http.get<ReceptionStatus>(
      `${this.apiUrl}/purchase-orders/business/${poId}/reception-status`
    );
  }

  getStockAvailability(poId: number, warehouseId: number): Observable<StockAvailabilityForPO> {
    const params = new HttpParams().set('warehouseId', warehouseId.toString());
    return this.http.get<StockAvailabilityForPO>(
      `${this.apiUrl}/purchase-orders/business/${poId}/stock-availability`,
      { params }
    );
  }

  canApprove(order: PurchaseOrder): boolean {
    // Accepte à la fois PENDING et CONFIRMED (si le backend dit CONFIRMED)
    const status = order.status || '';
    return status === PurchaseOrderStatus.PENDING ||
      status === 'CONFIRMED' as any;
  }

  canReceive(order: PurchaseOrder): boolean {
    // Peut recevoir si APPROVED ou CONFIRMED
    const status = order.status || '';
    return status === PurchaseOrderStatus.APPROVED ||
      status === 'CONFIRMED' as any;
  }

  canCancel(order: PurchaseOrder): boolean {
    // Peut annuler si PENDING, APPROVED ou CONFIRMED
    const status = order.status || '';
    return status === PurchaseOrderStatus.PENDING ||
      status === PurchaseOrderStatus.APPROVED ||
      status === 'CONFIRMED' as any;
  }

// Méthode utilitaire pour normaliser les statuts
  normalizeStatus(status: string): string {
    const normalized = (status || '').toUpperCase();

    // Si le backend retourne CONFIRMED, on le mappe à APPROVED
    if (normalized === 'CONFIRMED') {
      return PurchaseOrderStatus.APPROVED;
    }

    return normalized;
  }

// Utilisez cette méthode dans getStatusText et getStatusBadgeClass
  getStatusText(status: string): string {
    const normalized = this.normalizeStatus(status);

    const labels: { [key: string]: string } = {
      'PENDING': 'En attente',
      'APPROVED': 'Approuvée',  // Pour l'UI, on garde "Approuvée"
      'RECEIVED': 'Reçue',
      'CANCELLED': 'Annulée'
    };

    // Si c'est CONFIRMED mais pas dans l'enum, on affiche "Confirmée"
    if (status.toUpperCase() === 'CONFIRMED') {
      return 'Confirmée';
    }

    return labels[normalized] || status;
  }

  getStatusBadgeClass(status: string): string {
    const normalized = this.normalizeStatus(status);

    const classes: { [key: string]: string } = {
      'PENDING': 'badge-warning',
      'APPROVED': 'badge-success',
      'RECEIVED': 'badge-info',
      'CANCELLED': 'badge-danger'
    };

    return classes[normalized] || 'badge-secondary';
  }

  calculateOrderTotal(order: PurchaseOrder): number {
    if (!order.orderLines || order.orderLines.length === 0) return 0;
    return order.orderLines.reduce((sum, line) =>
      sum + (line.lineTotal || (line.quantity * line.unitPrice)), 0
    );
  }
}

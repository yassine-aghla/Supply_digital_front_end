import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable, of, throwError} from 'rxjs';
import {
  Inventory,
  ReservationRequest,
  ReservationResponse,
  MovementRequest,
  InventoryMovement,
  AdjustmentRequest,
  AllocationRequest,
  AllocationResponse,
  AvailabilityResponse,
  StockStatusResponse
} from '../models/inventory.model';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private baseUrl = 'http://localhost:8088/api/inventories';
  private operationsUrl = 'http://localhost:8088/api/inventory/operations';

  constructor(private http: HttpClient) {}

  // ==================== CRUD de base ====================

  /**
   * Récupérer tous les inventaires
   */
  getAllInventories(): Observable<Inventory[]> {
    return this.http.get<Inventory[]>(this.baseUrl);
  }

  /**
   * Récupérer un inventaire par ID
   */
  getInventoryById(id: number): Observable<Inventory> {
    return this.http.get<Inventory>(`${this.baseUrl}/${id}`);
  }

  /**
   * Créer un nouvel inventaire
   */
  createInventory(inventory: Inventory): Observable<Inventory> {
    return this.http.post<Inventory>(this.baseUrl, inventory);
  }

  /**
   * Mettre à jour un inventaire
   */
  updateInventory(id: number, inventory: Inventory): Observable<Inventory> {
    return this.http.put<Inventory>(`${this.baseUrl}/${id}`, inventory);
  }

  /**
   * Mettre à jour les quantités d'un inventaire
   */
  updateQuantities(id: number, qtyOnHand: number, qtyReserved: number): Observable<Inventory> {
    const params = new HttpParams()
      .set('qtyOnHand', qtyOnHand.toString())
      .set('qtyReserved', qtyReserved.toString());

    return this.http.patch<Inventory>(`${this.baseUrl}/${id}/quantities`, null, { params });
  }

  /**
   * Supprimer un inventaire
   */
  deleteInventory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ==================== Opérations métier ====================

  /**
   * Obtenir la quantité disponible
   */
  getAvailableQuantity(inventoryId: number): Observable<AvailabilityResponse> {
    return this.http.get<AvailabilityResponse>(
      `${this.operationsUrl}/${inventoryId}/available`
    );
  }

  /**
   * Réserver du stock
   */
  reserveStock(request: ReservationRequest): Observable<ReservationResponse | any> {
    return this.http.post<ReservationResponse>(`${this.operationsUrl}/reserve`, request);
  }

  /**
   * Libérer une réservation
   */
  releaseReservation(request: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(`${this.operationsUrl}/release`, request);
  }

  /**
   * Enregistrer une entrée de stock (Inbound)
   */
  recordInbound(request: MovementRequest): Observable<InventoryMovement> {
    return this.http.post<InventoryMovement>(`${this.operationsUrl}/inbound`, request);
  }

  /**
   * Enregistrer une sortie de stock (Outbound)
   */
  recordOutbound(request: MovementRequest): Observable<InventoryMovement> {
    return this.http.post<InventoryMovement>(`${this.operationsUrl}/outbound`, request);
  }

  /**
   * Enregistrer un ajustement de stock
   */
  recordAdjustment(request: AdjustmentRequest): Observable<InventoryMovement | any> {
    return this.http.post<InventoryMovement>(`${this.operationsUrl}/adjustment`, request);
  }

  /**
   * Allouer du stock depuis plusieurs entrepôts
   */
  allocateFromMultipleWarehouses(request: AllocationRequest): Observable<AllocationResponse> {
    return this.http.post<AllocationResponse>(`${this.operationsUrl}/allocate`, request);
  }

  /**
   * Vérifier si un produit est en rupture de stock
   */
  checkOutOfStock(productId: number, warehouseId: number): Observable<StockStatusResponse> {
    const params = new HttpParams()
      .set('productId', productId.toString())
      .set('warehouseId', warehouseId.toString());

    return this.http.get<StockStatusResponse>(
      `${this.operationsUrl}/out-of-stock`,
      { params }
    );
  }

  updateInventoryQuantities(id: number, qtyOnHand: number, qtyReserved: number): Observable<Inventory> {
    const params = new HttpParams()
      .set('qtyOnHand', qtyOnHand.toString())
      .set('qtyReserved', qtyReserved.toString());

    return this.http.patch<Inventory>(`${this.baseUrl}/${id}/quantities`, null, { params }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('InventoryService error:', error);
    return throwError(() => ({
      message: error.error?.message || 'Une erreur est survenue',
      status: error.status,
      error: error.error
    }));
  }

  /**
   * Récupérer un inventaire par produit et entrepôt
   * Retourne null si non trouvé
   */
  getInventoryByProductAndWarehouse(productId: number, warehouseId: number): Observable<Inventory | null> {
    const params = new HttpParams()
      .set('productId', productId.toString())
      .set('warehouseId', warehouseId.toString());

    return this.http.get<Inventory>(`${this.baseUrl}/by-product-warehouse`, { params }).pipe(
      catchError(error => {
        if (error.status === 404) {
          // Inventaire non trouvé - c'est OK
          console.log(`Aucun inventaire trouvé pour produit ${productId} et entrepôt ${warehouseId}`);
          return of(null);
        }
        console.error('Erreur lors de la recherche de l\'inventaire:', error);
        return throwError(() => new Error('Erreur lors de la recherche de l\'inventaire'));
      })
    );
  }


}

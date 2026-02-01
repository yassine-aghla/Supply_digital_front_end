import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import { Warehouse } from '../models/warehouse.model';
import {catchError, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {
  private apiUrl = 'http://localhost:8088/api/wareHouse';

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les entrepôts
   */
  getAllWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(this.apiUrl);
  }

  /**
   * Récupérer un entrepôt par ID
   */
  getWarehouseById(id: number): Observable<Warehouse> {
    return this.http.get<Warehouse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouvel entrepôt
   */
  createWarehouse(warehouse: Warehouse): Observable<Warehouse> {
    return this.http.post<Warehouse>(this.apiUrl, warehouse);
  }

  /**
   * Mettre à jour un entrepôt
   */
  updateWarehouse(id: number, warehouse: Warehouse): Observable<Warehouse> {
    return this.http.put<Warehouse>(`${this.apiUrl}/${id}`, warehouse);
  }

  /**
   * Supprimer un entrepôt
   */
  deleteWarehouse(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
  updateWarehouseStatut(id:number):Observable<any>{
    return this.http.patch<any>(`${this.apiUrl}/${id}/statut`,
      {}
  );

  }
  getMyWarehouses(): Observable<Warehouse[]> {
    return this.http.get<Warehouse[]>(`${this.apiUrl}/my-warehouses`).pipe(
      tap(warehouses => console.log('My Warehouses loaded:', warehouses)),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('warehouse error:', error);
    return throwError(() => ({
      message: error.error?.message || 'Une erreur est survenue',
      status: error.status,
      error: error.error
    }));
  }
}

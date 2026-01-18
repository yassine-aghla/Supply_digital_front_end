// services/shipment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


export interface Shipment {
  id?: number;
  trackingNumber: string;
  carrierId: number;
  carrierName?: string;
  plannedDate: string;
  actualDeliveryDate?: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'DELAYED';
  description?: string;
  originAddress?: string;
  destinationAddress?: string;
  weight?: number;
  dimensions?: string;
  estimatedDeliveryDate?: string;
  shippingCost?: number;
}

export interface ShipmentCreateDTO {
  trackingNumber: string;
  carrierId: number;
  plannedDate: string;
  status: string;
  description?: string;
}

export interface ShipmentUpdateDTO {
  carrierId?: number;
  plannedDate?: string;
  status?: string;
  description?: string;
  actualDeliveryDate?: string;
}

export interface ShipmentTracking {
  currentStatus: string;
  estimatedDelivery: string;
  locationUpdates: TrackingUpdate[];
}

export interface TrackingUpdate {
  timestamp: string;
  location: string;
  status: string;
  notes?: string;
}

export interface StatusUpdateResponse {
  shipmentId: number;
  newStatus: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {
  private apiUrl = `http://localhost:8088/api/shipments`;
  private businessApiUrl = `http://localhost:8088/api/shipments/business`;

  constructor(private http: HttpClient) {}

  // CRUD operations
  getAll(): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(this.apiUrl);
  }

  getById(id: number): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.apiUrl}/${id}`);
  }

  getByTrackingNumber(trackingNumber: string): Observable<Shipment> {
    return this.http.get<Shipment>(`${this.apiUrl}/tracking/${trackingNumber}`);
  }

  getByCarrier(carrierId: number): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(`${this.apiUrl}/carrier/${carrierId}`);
  }

  getByStatus(status: string): Observable<Shipment[]> {
    return this.http.get<Shipment[]>(`${this.apiUrl}/status/${status}`);
  }

  create(shipment: ShipmentCreateDTO): Observable<Shipment> {
    return this.http.post<Shipment>(this.apiUrl, shipment);
  }

  update(id: number, shipment: ShipmentUpdateDTO): Observable<Shipment> {
    return this.http.put<Shipment>(`${this.apiUrl}/${id}`, shipment);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Business operations
  trackShipment(trackingNumber: string): Observable<ShipmentTracking> {
    return this.http.get<ShipmentTracking>(`${this.businessApiUrl}/track/${trackingNumber}`);
  }

  startTransit(shipmentId: number): Observable<StatusUpdateResponse> {
    return this.http.post<StatusUpdateResponse>(`${this.businessApiUrl}/${shipmentId}/start-transit`, {});
  }

  deliver(shipmentId: number): Observable<StatusUpdateResponse> {
    return this.http.post<StatusUpdateResponse>(`${this.businessApiUrl}/${shipmentId}/deliver`, {});
  }

  updateStatus(shipmentId: number, status: string): Observable<StatusUpdateResponse> {
    const endpoint = status === 'IN_TRANSIT' ? 'start-transit' :
      status === 'DELIVERED' ? 'deliver' : '';

    if (!endpoint) {
      throw new Error('Invalid status update endpoint');
    }

    return this.http.post<StatusUpdateResponse>(
      `${this.businessApiUrl}/${shipmentId}/${endpoint}`,
      {}
    );
  }
}

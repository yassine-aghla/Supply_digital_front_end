// services/carrier.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Carrier {
  id?: number;
  code: string;
  name: string;
  contactEmail: string;
  contactPhone: string;
  baseShippingRate: number;
  maxDailyCapacity: number;
  currentDailyShipments: number;
  cutOffTime: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

@Injectable({
  providedIn: 'root'
})
export class CarrierService {
  private apiUrl = `http://localhost:8088/api/carriers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Carrier[]> {
    return this.http.get<Carrier[]>(this.apiUrl);
  }

  getById(id: number): Observable<Carrier> {
    return this.http.get<Carrier>(`${this.apiUrl}/${id}`);
  }

  create(carrier: Carrier): Observable<Carrier> {
    return this.http.post<Carrier>(this.apiUrl, carrier);
  }

  update(id: number, carrier: Carrier): Observable<Carrier> {
    return this.http.put<Carrier>(`${this.apiUrl}/${id}`, carrier);
  }

  updateStatus(id: number, status: string): Observable<Carrier> {
    return this.http.patch<Carrier>(`${this.apiUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

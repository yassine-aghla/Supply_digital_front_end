// services/supplier.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Supplier {
  id?: number;
  name: string;
  contactInfo: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  private apiUrl = `http://localhost:8088/api/suppliers`;

  constructor(private http: HttpClient) {}

  // CRUD operations
  getAll(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.apiUrl);
  }

  getById(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/${id}`);
  }

  getByName(name: string): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/name/${name}`);
  }

  create(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.apiUrl, supplier);
  }

  update(id: number, supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/${id}`, supplier);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  // Search by name
  searchByName(name: string): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/name/${name}`);
  }
}

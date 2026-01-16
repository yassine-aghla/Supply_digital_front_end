import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'  // Important pour Standalone
})
export class ProductService {
  private apiUrl = 'http://localhost:8088/api/products';

  constructor(private http: HttpClient) {}

  getAllProducts(active?: boolean, category?: string): Observable<Product[]> {
    let params = new HttpParams();

    if (active !== undefined) {
      params = params.set('active', active.toString());
    }
    if (category) {
      params = params.set('category', category);
    }

    return this.http.get<Product[]>(this.apiUrl, { params });
  }

  getActiveProducts(): Observable<Product[]> {
    return this.getAllProducts(true);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductByCode(code: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/code/${code}`);
  }

  getProductsByCategory(category: string): Observable<Product[]> {
    return this.getAllProducts(undefined, category);
  }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  activateProduct(id: number): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateProduct(id: number): Observable<Product | any> {
    return this.http.patch<Product>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

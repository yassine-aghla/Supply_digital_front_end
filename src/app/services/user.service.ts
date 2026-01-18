// services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  User,
  UserCreateRequest,
  UserUpdateRequest,
  Role,
  LoginRequest,
  AuthResponse,
  DeleteResponse
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8088/api/users';
  private authUrl = 'http://localhost:8088/api/auth';

  constructor(private http: HttpClient) {}

  // ============ CRUD Users ============
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/username/${username}`);
  }

  createUser(userData: UserCreateRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData);
  }

  updateUser(id: number, userData: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  activateUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/activate`, {});
  }

  deactivateUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/deactivate`, {});
  }

  changePassword(id: number, currentPassword: string, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/password`, {
      currentPassword,
      newPassword
    });
  }

  // ============ Authentication ============
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/login`, credentials);
  }

  register(userData: UserCreateRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, userData);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.authUrl}/logout`, {});
  }

  refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/refresh`, {});
  }

  // ============ Roles ============
  getAvailableRoles(): Role[] {
    return Object.values(Role);
  }

  getRoleDisplayName(role: Role): string {
    const roleNames = {
      [Role.ADMIN]: 'Administrateur',
      [Role.WAREHOUSE_MANAGER]: 'Manager Entrepôt',
      [Role.CLIENT]: 'Client'
    };
    return roleNames[role] || role;
  }


  getRoleColor(role: Role): string {
    const colors = {
      [Role.ADMIN]: 'bg-red-100 text-red-800',
      [Role.WAREHOUSE_MANAGER]: 'bg-blue-100 text-blue-800',
      [Role.CLIENT]: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  }
}

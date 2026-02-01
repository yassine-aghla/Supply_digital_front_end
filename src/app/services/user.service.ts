// services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  User,
  UserCreateRequest,
  UserUpdateRequest,
  Role,
  LoginRequest,
  AuthResponse
} from '../models/user.model';

export interface LoginApiResponse {
  accessToken?: string;
  token?: string;
  tokenType?: string;
  email?: string;
  user?: User;
  expiresIn?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8088/api/users';
  private authUrl = 'http://localhost:8088/api/auth';

  constructor(private http: HttpClient) {}

  // ============ CRUD Users ============
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getUserByUsername(username: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/username/${username}`).pipe(
      catchError(this.handleError)
    );
  }

  createUser(userData: UserCreateRequest): Observable<User> {
    return this.http.post<User>(this.apiUrl, userData).pipe(
      catchError(this.handleError)
    );
  }

  updateUser(id: number, userData: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, userData).pipe(
      catchError(this.handleError)
    );
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  activateUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/activate`, {}).pipe(
      catchError(this.handleError)
    );
  }

  deactivateUser(id: number): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/deactivate`, {}).pipe(
      catchError(this.handleError)
    );
  }

  changePassword(id: number, currentPassword: string, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/password`, {
      currentPassword,
      newPassword
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ============ Authentication ============
  login(credentials: LoginRequest): Observable<LoginApiResponse> {
    console.log('UserService.login() - Sending request to:', `${this.authUrl}/login`);

    return this.http.post<LoginApiResponse>(`${this.authUrl}/login`, credentials).pipe(
      tap(response => {
        console.log('UserService.login() - Raw API response:', response);
        console.log('UserService.login() - Has accessToken?', !!response.accessToken);
        console.log('UserService.login() - Has user?', !!response.user);
        if (response.user) {
          console.log('UserService.login() - User role from API:', response.user.role);
        }
      }),
      catchError(error => {
        console.error('UserService.login() - API error:', error);
        return throwError(() => error);
      })
    );
  }

  register(userData: UserCreateRequest): Observable<AuthResponse> {
    console.log('UserService.register() - Registering user');
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, userData).pipe(
      tap(response => {
        console.log('UserService.register() - Registration response:', response);
      }),
      catchError(this.handleError)
    );
  }

  logout(): Observable<void> {
    console.log('UserService.logout() - Logging out');
    return this.http.post<void>(`${this.authUrl}/logout`, {}).pipe(
      tap(() => {
        console.log('UserService.logout() - Logout successful');
      }),
      catchError(error => {
        console.error('UserService.logout() - Error:', error);
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    console.log('UserService.refreshToken() - Refreshing token');
    return this.http.post<AuthResponse>(`${this.authUrl}/refresh`, {}).pipe(
      tap(response => {
        console.log('UserService.refreshToken() - Token refreshed');
      }),
      catchError(this.handleError)
    );
  }

  // ============ Utility Methods ============
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

  // ============ Token Decoding - VERSION AMÉLIORÉE ============
  decodeJwtToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Invalid JWT format');
        return null;
      }

      const payload = parts[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const parsed = JSON.parse(decodedPayload);

      console.log('=== JWT TOKEN DECODED ===');
      console.log('Full payload:', parsed);
      console.log('Role in token:', parsed.role);
      console.log('Authorities in token:', parsed.authorities);
      console.log('Subject (username):', parsed.sub);

      return parsed;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  extractRoleFromToken(token: string): Role | null {
    if (!token) {
      console.warn('No token provided for role extraction');
      return null;
    }

    const decoded = this.decodeJwtToken(token);
    if (!decoded) {
      return null;
    }

    console.log('=== EXTRACTING ROLE FROM TOKEN ===');

    // 1. Chercher dans la propriété "role" directement
    if (decoded.role) {
      console.log('Found role property:', decoded.role);
      return this.normalizeRole(decoded.role);
    }

    // 2. Chercher dans "authorities" (premier élément)
    if (decoded.authorities && Array.isArray(decoded.authorities) && decoded.authorities.length > 0) {
      console.log('Found in authorities[0]:', decoded.authorities[0]);
      return this.normalizeRole(decoded.authorities[0]);
    }

    // 3. Chercher dans d'autres propriétés possibles
    const possibleKeys = ['scope', 'roles', 'authority'];
    for (const key of possibleKeys) {
      if (decoded[key]) {
        console.log(`Found in ${key}:`, decoded[key]);
        const value = Array.isArray(decoded[key]) ? decoded[key][0] : decoded[key];
        return this.normalizeRole(value);
      }
    }

    console.warn('No role found in token payload:', decoded);
    return null;
  }

  private normalizeRole(roleValue: any): Role | null {
    if (!roleValue) return null;

    // Convertir en string et nettoyer
    let roleStr = roleValue.toString().trim();

    console.log('Raw role value:', roleStr);

    // Enlever le préfixe ROLE_ s'il existe
    if (roleStr.startsWith('ROLE_')) {
      roleStr = roleStr.substring(5); // Enlever "ROLE_"
    }

    roleStr = roleStr.toUpperCase();

    console.log('Normalized role string:', roleStr);

    // Mapper vers les rôles connus
    if (roleStr === 'ADMIN') return Role.ADMIN;
    if (roleStr === 'WAREHOUSE_MANAGER' || roleStr === 'MANAGER') return Role.WAREHOUSE_MANAGER;
    if (roleStr === 'CLIENT' || roleStr === 'USER') return Role.CLIENT;

    console.warn('Unknown role value:', roleStr);
    return null;
  }

  // ============ Token Validation ============
  validateToken(token: string): boolean {
    if (!token || token.trim().length === 0) {
      return false;
    }

    const decoded = this.decodeJwtToken(token);
    if (!decoded) {
      return false;
    }

    if (decoded.exp) {
      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();
      if (currentTime > expirationTime) {
        console.warn('Token has expired');
        return false;
      }
    }

    return true;
  }

  // ============ User Creation from Token ============
  createUserFromToken(token: string, email?: string): User | null {
    if (!token) {
      console.warn('No token provided for user creation');
      return null;
    }

    const role = this.extractRoleFromToken(token);
    console.log('=== CREATING USER FROM TOKEN ===');
    console.log('Extracted role:', role);

    const decoded = this.decodeJwtToken(token);
    if (!decoded) {
      return null;
    }

    const userEmail = email || decoded.sub || decoded.email || 'unknown@example.com';

    const user: User = {
      email: userEmail,
      username: userEmail.split('@')[0],
      role: role || Role.CLIENT, // Fallback sur CLIENT si pas de rôle
      active: true
    };

    console.log('Created user:', user);
    return user;
  }

  // ============ Error Handling ============
  private handleError(error: any): Observable<never> {
    console.error('UserService error:', error);

    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      errorMessage = `Erreur ${error.status}: ${error.message}`;
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}

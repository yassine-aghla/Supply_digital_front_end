// services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, Role, AuthResponse } from '../models/user.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  currentUser$ = this.currentUserSubject.asObservable();
  token$ = this.tokenSubject.asObservable();
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('currentUser');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.tokenSubject.next(token);
        this.currentUserSubject.next(user);
        this.isAuthenticatedSubject.next(true);
      } catch (error) {
        this.clearAuth();
      }
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return new Observable(observer => {
      this.userService.login({ email, password }).subscribe({
        next: (response) => {
          this.setAuth(response.token, response.user);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  register(userData: any): Observable<AuthResponse> {
    return new Observable(observer => {
      this.userService.register(userData).subscribe({
        next: (response) => {
          this.setAuth(response.token, response.user);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  logout(): void {
    this.userService.logout().subscribe({
      next: () => {
        this.clearAuth();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.clearAuth();
        this.router.navigate(['/login']);
      }
    });
  }

  refreshToken(): Observable<AuthResponse> {
    return new Observable(observer => {
      this.userService.refreshToken().subscribe({
        next: (response) => {
          this.setAuth(response.token, response.user);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          this.clearAuth();
          observer.error(error);
        }
      });
    });
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  hasRole(role: Role): boolean {
    const user = this.currentUserSubject.value;
    return user?.role === role;
  }

  isAdmin(): boolean {
    return this.hasRole(Role.ADMIN);
  }

  isWarehouseManager(): boolean {
    return this.hasRole(Role.WAREHOUSE_MANAGER);
  }

  isClient(): boolean {
    return this.hasRole(Role.CLIENT);
  }

  private setAuth(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  private clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('refreshToken');
    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }
}

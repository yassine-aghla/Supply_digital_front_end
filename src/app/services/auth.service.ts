// services/auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, Role, AuthResponse } from '../models/user.model';
import { UserService, LoginApiResponse } from './user.service';

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

    console.log('AuthService.loadStoredAuth() - Loading stored auth');
    console.log('Token exists in localStorage?', !!token);
    console.log('User exists in localStorage?', !!userStr);

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);

        // Valider le token avant de l'accepter
        if (this.userService.validateToken(token)) {
          this.tokenSubject.next(token);
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
          console.log('AuthService - Stored auth loaded successfully');
          console.log('Loaded user role:', user.role);
        } else {
          console.warn('AuthService - Stored token is invalid, clearing auth');
          this.clearAuth();
        }
      } catch (error) {
        console.error('AuthService - Error parsing stored user:', error);
        this.clearAuth();
      }
    } else {
      console.log('AuthService - No stored auth found');
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    console.log('AuthService.login() - Starting login process');

    return new Observable(observer => {
      this.userService.login({ email, password }).subscribe({
        next: (apiResponse: LoginApiResponse) => {
          console.log('AuthService.login() - API response received');
          console.log('Full API response:', apiResponse);

          try {
            // Extraire le token
            const token = this.getTokenFromResponse(apiResponse);
            console.log('Token extracted, length:', token.length);

            // PRIORITÉ 1: Utiliser le user de l'API si disponible
            let user: User;

            if (apiResponse.user && apiResponse.user.email && apiResponse.user.role) {
              console.log('Using user from API response');
              console.log('API user role:', apiResponse.user.role);
              user = apiResponse.user;
            }
            // PRIORITÉ 2: Utiliser le rôle de la réponse directe si disponible
            else if (apiResponse["role"]) {
              console.log('Using role from API response root:', apiResponse["role"]);
              user = {
                email: apiResponse.email || email,
                username: (apiResponse.email || email).split('@')[0],
                role: this.normalizeRole(apiResponse["role"]),
                active: true
              };
            }
            // PRIORITÉ 3: Extraire du token
            else {
              console.log('Extracting user from token');
              user = this.getUserFromToken(token, apiResponse.email || email);
            }

            console.log('Final user object:', user);
            console.log('Final user role:', user.role);

            // Sauvegarder l'authentification
            this.saveAuth(token, user);

            // Créer la réponse formatée
            const formattedResponse: AuthResponse = {
              token: token,
              accessToken: apiResponse.accessToken || token,
              user: user,
              expiresIn: apiResponse.expiresIn || 3600,
              tokenType: apiResponse.tokenType || 'Bearer',
              email: user.email
            };

            console.log('AuthService.login() - Login successful');
            observer.next(formattedResponse);
            observer.complete();

          } catch (error: any) {
            console.error('AuthService.login() - Error processing response:', error);
            observer.error({
              message: error.message || 'Erreur lors du traitement de la réponse',
              details: 'Format de réponse inattendu du serveur'
            });
          }
        },
        error: (error) => {
          console.error('AuthService.login() - API error:', error);
          observer.error(error);
        }
      });
    });
  }

  private getTokenFromResponse(response: LoginApiResponse): string {
    console.log('AuthService - Extracting token from response');

    if (response.accessToken && typeof response.accessToken === 'string') {
      console.log('Using accessToken, length:', response.accessToken.length);
      return response.accessToken;
    }

    if (response.token && typeof response.token === 'string') {
      console.log('Using token, length:', response.token.length);
      return response.token;
    }

    // Chercher dans toutes les propriétés
    for (const key of Object.keys(response)) {
      if (key.toLowerCase().includes('token') && typeof response[key] === 'string') {
        console.log(`Found token in property "${key}", length:`, response[key].length);
        return response[key];
      }
    }

    throw new Error('Aucun token valide trouvé dans la réponse du serveur');
  }

  private getUserFromToken(token: string, email: string): User {
    console.log('AuthService - Creating user from token');

    const userFromToken = this.userService.createUserFromToken(token, email);

    if (userFromToken) {
      console.log('Created user from token:', userFromToken);
      return userFromToken;
    }

    // Fallback: créer un user basique
    console.log('Creating fallback user');
    return {
      email: email || 'unknown@example.com',
      username: email.split('@')[0],
      role: Role.CLIENT,
      active: true
    };
  }

  private normalizeRole(role: any): Role {
    console.log('AuthService - Normalizing role:', role);

    if (!role) return Role.CLIENT;

    let roleStr = role.toString().trim();

    // Enlever le préfixe ROLE_ s'il existe
    if (roleStr.startsWith('ROLE_')) {
      roleStr = roleStr.substring(5);
    }

    roleStr = roleStr.toUpperCase();

    console.log('Normalized role:', roleStr);

    if (roleStr === 'ADMIN') return Role.ADMIN;
    if (roleStr === 'WAREHOUSE_MANAGER' || roleStr === 'MANAGER') return Role.WAREHOUSE_MANAGER;
    if (roleStr === 'CLIENT' || roleStr === 'USER') return Role.CLIENT;

    console.warn('Unknown role, defaulting to CLIENT:', roleStr);
    return Role.CLIENT;
  }

  private saveAuth(token: string, user: User): void {
    console.log('AuthService - Saving auth to storage');
    console.log('Saving user with role:', user.role);

    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));

    this.tokenSubject.next(token);
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);

    console.log('Auth saved successfully');
  }

  register(userData: any): Observable<AuthResponse> {
    return new Observable(observer => {
      this.userService.register(userData).subscribe({
        next: (response) => {
          const token = response.token || response.accessToken || '';
          this.saveAuth(token, response.user!);
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
    console.log('AuthService.logout() - Logging out');

    this.userService.logout().subscribe({
      next: () => {
        this.clearAuth();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('AuthService.logout() - Error during logout:', error);
        this.clearAuth();
        this.router.navigate(['/login']);
      }
    });
  }

  refreshToken(): Observable<AuthResponse> {
    return new Observable(observer => {
      this.userService.refreshToken().subscribe({
        next: (response) => {
          const token = response.token || response.accessToken || '';
          this.saveAuth(token, response.user!);
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

  private clearAuth(): void {
    console.log('AuthService - Clearing auth data');

    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('refreshToken');

    this.tokenSubject.next(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }
}

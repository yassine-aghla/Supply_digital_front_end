// guards/auth.guard.ts - VERSION AMÉLIORÉE
import { Injectable } from '@angular/core';
import {
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivate,
  CanActivateChild
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAuth(route, state);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAuth(childRoute, state);
  }

  private checkAuth(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    console.log('AuthGuard - Checking access to:', state.url);

    const isLoggedIn = this.authService.isLoggedIn();

    // ========== VÉRIFICATION 1: Utilisateur connecté ? ==========
    if (!isLoggedIn) {
      console.log('User not logged in - Redirecting to login');
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: state.url }
      });
      return false;
    }

    const user = this.authService.getCurrentUser();
    console.log('Current user:', user?.username, '| Role:', user?.role);

    // ========== VÉRIFICATION 2: Rôles requis ? ==========
    const requiredRoles = route.data['roles'] as Role[];

    if (requiredRoles && requiredRoles.length > 0) {
      console.log(' Required roles:', requiredRoles);

      if (!user) {
        console.log('User object not found - Redirecting to login');
        this.router.navigate(['/login']);
        return false;
      }

      // ========== VÉRIFICATION 3: L'utilisateur a-t-il le bon rôle ? ==========
      if (!requiredRoles.includes(user.role)) {
        console.log('Access DENIED - User role:', user.role, '| Required:', requiredRoles);
        console.log('Redirecting to appropriate page for role:', user.role);

        // Rediriger vers la page appropriée selon le rôle
        this.redirectToHomePage(user.role);
        return false;
      }

      console.log('Access GRANTED - User has required role');
    } else {
      console.log('No role restriction on this route');
    }

    return true;
  }

  private redirectToHomePage(role?: Role): void {
    console.log('Redirecting to home page for role:', role);

    switch (role) {
      case Role.ADMIN:
        console.log('Redirecting ADMIN to /dashboard');
        this.router.navigate(['/dashboard']);
        break;
      case Role.WAREHOUSE_MANAGER:
        console.log('Redirecting WAREHOUSE_MANAGER to /warehouse/dashboard');
        this.router.navigate(['/warehouse/dashboard']);
        break;
      case Role.CLIENT:
        console.log('Redirecting CLIENT to /home');
        this.router.navigate(['/home']);
        break;
      default:
        console.log('Unknown role - Redirecting to /login');
        this.router.navigate(['/login']);
    }
  }
}

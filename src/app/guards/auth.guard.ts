// guards/auth.guard.ts
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
    return this.checkAuth(route);
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    return this.checkAuth(childRoute);
  }

  private checkAuth(route: ActivatedRouteSnapshot): boolean {
    // Vérifier si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: route.url.join('/') }
      });
      return false;
    }

    // Vérifier les rôles requis
    const requiredRoles = route.data['roles'] as Role[];
    if (requiredRoles && requiredRoles.length > 0) {
      const userRole = this.authService.getCurrentUser()?.role;
      if (!userRole || !requiredRoles.includes(userRole)) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}

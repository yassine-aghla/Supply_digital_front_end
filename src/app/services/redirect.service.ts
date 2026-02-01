// services/redirect.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  redirectBasedOnRole(): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    switch (user.role) {
      case Role.ADMIN:
        this.router.navigate(['/dashboard']);
        break;
      case Role.WAREHOUSE_MANAGER:
        this.router.navigate(['/dashboard']);
        break;
      case Role.CLIENT:
        this.router.navigate(['/home']); // ⬅️ Clients vont vers /home
        break;
      default:
        this.router.navigate(['/login']);
    }
  }

  // Méthode pour rediriger après login
  redirectAfterLogin(): void {
    const user = this.authService.getCurrentUser();

    if (!user) {
      return;
    }

    switch (user.role) {
      case Role.CLIENT:
        this.router.navigate(['/home']);
        break;
      case Role.ADMIN:
        this.router.navigate(['/dashboard']);
        break;
      case Role.WAREHOUSE_MANAGER:
        this.router.navigate(['/warehouse/dashboard']);
        break;
    }
  }
}

// components/header/header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  showMobileMenu = false;
  showUserDropdown = false;
  currentUser: User | null = null;
  private userSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements d'utilisateur
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Header - User updated:', user);
    });

    // Récupérer l'utilisateur actuel au démarrage
    this.currentUser = this.authService.getCurrentUser();
    console.log('Header - Current user on init:', this.currentUser);
  }

  ngOnDestroy(): void {
    // Nettoyer la souscription
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  toggleUserDropdown(): void {
    this.showUserDropdown = !this.showUserDropdown;
  }

  // Méthode pour obtenir les initiales de l'utilisateur
  getUserInitials(): string {
    if (!this.currentUser) return 'U';

    if (this.currentUser.username) {
      return this.currentUser.username.charAt(0).toUpperCase();
    }

    if (this.currentUser.email) {
      const namePart = this.currentUser.email.split('@')[0];
      return namePart.substring(0, 2).toUpperCase();
    }

    return 'U';
  }

  getDisplayName(): string {
    if (!this.currentUser) return 'Utilisateur';

    if (this.currentUser.username) {
      return this.currentUser.username;
    }

    if (this.currentUser.email) {
      const namePart = this.currentUser.email.split('@')[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }

    return 'Utilisateur';
  }

  // Méthode pour traduire le rôle
  getRoleDisplay(): string {
    if (!this.currentUser) return 'Invité';

    const roleTranslations: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'WAREHOUSE_MANAGER': 'Manager Entrepôt',
      'CLIENT': 'Client'
    };

    return roleTranslations[this.currentUser.role] || this.currentUser.role;
  }

  // Méthode pour se déconnecter
  logout(): void {
    console.log('Header - Logout clicked');
    this.authService.logout();
    this.showUserDropdown = false;
  }

  // Navigation vers le profil
  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.showUserDropdown = false;
  }

  // Navigation vers les paramètres
  goToSettings(): void {
    this.router.navigate(['/settings']);
    this.showUserDropdown = false;
  }

  search(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    console.log('Search:', searchTerm);
  }
}

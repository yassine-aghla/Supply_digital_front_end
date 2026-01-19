// components/sidebar/sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import {AuthService} from '../../services/auth.service';
import {User} from '../../models/user.model';
import {Subscription} from 'rxjs';

interface MenuItem {
  title: string;
  icon: string;
  path: string;
  submenu?: MenuItem[];
  isOpen?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isCollapsed = false;
  activePath: string = '';
  currentUser: User | null = null; // Ajoutez cette ligne
  private userSubscription: Subscription | null = null;

  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'fas fa-chart-line',
      path: '/dashboard'
    },
    {
      title: 'Utilisateurs',
      icon: 'fas fa-users',
      path: '/users',
      submenu: [
        { title: 'Liste Utilisateurs', icon: 'fas fa-list', path: '/users' },
        { title: 'Créer Utilisateur', icon: 'fas fa-user-plus', path: '/users/create' }
      ],
      isOpen: false
    }
    ,
    {
      title: 'Inventaire',
      icon: 'fas fa-boxes',
      path: '/inventory',
      submenu: [
        { title: 'Liste Inventaire', icon: 'fas fa-list', path: '/inventory' },
        { title: 'Opérations', icon: 'fas fa-cogs', path: '/inventory/operations' }
      ],
      isOpen: false
    },
    {
      title: 'Orders',
      icon: 'fas fa-clipboard-list',
      path: '/sales-orders',
      submenu: [
        { title: 'sales-orders', icon: 'fas fa-clipboard-list', path: '/sales-orders' },
        { title: 'purchase-orders', icon: 'fas fa-clipboard-list', path: '/purchase-orders' }
      ],
      isOpen: false
    },
    {
      title: 'Produits',
      icon: 'fas fa-tags',
      path: '/products'
    },
    {
      title: 'Carriers',
      icon: 'fas fa-truck',
      path: '/carriers'
    },
    {
      title: 'Entrepôts',
      icon: 'fas fa-warehouse',
      path: '/warehouses'
    },
    {
      title: 'shipments',
      icon:'far fa-shipping-fast',
      path: '/shipments'
    },
    {
      title: 'Fournisseurs',
      icon: 'fas fa-user-tie',
      path: '/suppliers'
    },
    {
      title: 'Rapports',
      icon: 'fas fa-chart-bar',
      path: '/reports',
      submenu: [
        { title: 'Analytique', icon: 'fas fa-chart-pie', path: '/reports/analytics' },
        { title: 'Stocks', icon: 'fas fa-box-open', path: '/reports/stocks' },
        { title: 'Ventes', icon: 'fas fa-money-bill', path: '/reports/sales' }
      ],
      isOpen: false
    },
    {
      title: 'Paramètres',
      icon: 'fas fa-cog',
      path: '/settings',
      submenu: [
        { title: 'Utilisateurs', icon: 'fas fa-users', path: '/settings/users' },
        { title: 'Permissions', icon: 'fas fa-shield-alt', path: '/settings/permissions' },
        { title: 'Configuration', icon: 'fas fa-wrench', path: '/settings/config' }
      ],

      isOpen: false
    }
  ];

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Écouter les changements de route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.activePath = event.url;
        this.markParentActive(this.activePath);
      });

    // Initialiser l'état actif
    this.activePath = this.router.url;
    this.markParentActive(this.activePath);

    console.log('Sidebar - AuthService état:', {
      isAuthenticated: this.authService.isLoggedIn(),
      currentUser: this.authService.getCurrentUser(),
      hasToken: !!this.authService.getToken()
    });

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Récupérer l'utilisateur actuel
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnDestroy(): void {
    // Nettoyer la souscription
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Méthode pour obtenir les initiales
  getUserInitials(): string {
    if (!this.currentUser) return 'U';

    // Selon votre modèle User, utilisez firstName/lastName ou email
    if (this.currentUser.username) {
      return (this.currentUser.username.charAt(0)).toUpperCase();
    }

    // Fallback sur l'email
    if (this.currentUser.email) {
      const namePart = this.currentUser.email.split('@')[0];
      return namePart.substring(0, 2).toUpperCase();
    }

    return 'U';
  }

  // Méthode pour obtenir le nom à afficher
  getDisplayName(): string {
    if (!this.currentUser) return 'Utilisateur';


    if (this.currentUser.username ) {
      return `${this.currentUser.username} `;
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

  toggleSubmenu(menuItem: MenuItem): void {
    if (menuItem.submenu) {
      menuItem.isOpen = !menuItem.isOpen;
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  isActive(path: string): boolean {
    return this.activePath === path || this.activePath.startsWith(path + '/');
  }

  private markParentActive(path: string): void {
    // Fermer tous les sous-menus d'abord
    this.menuItems.forEach(item => {
      if (item.submenu) {
        item.isOpen = false;
      }
    });

    // Ouvrir le parent si nécessaire
    this.menuItems.forEach(item => {
      if (item.submenu) {
        item.submenu.forEach(subItem => {
          if (this.isActive(subItem.path)) {
            item.isOpen = true;
          }
        });
      }
    });
  }
}

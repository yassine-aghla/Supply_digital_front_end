// components/sidebar/sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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

  menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      icon: 'fas fa-chart-line',
      path: ''
    },
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
      title: 'Produits',
      icon: 'fas fa-tags',
      path: '/products'
    },
    {
      title: 'Entrepôts',
      icon: 'fas fa-warehouse',
      path: '/warehouses'
    },
    {
      title: 'Commandes',
      icon: 'fas fa-clipboard-list',
      path: '/orders'
    },
    {
      title: 'Fournisseurs',
      icon: 'fas fa-truck',
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

  constructor(private router: Router) {}

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

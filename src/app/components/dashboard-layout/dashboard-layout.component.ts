import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.css']
})
export class DashboardLayoutComponent {
  sidebarOpen = true;

  menuItems: MenuItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: 'chart-line' },
    { path: '/users', label: 'Utilisateurs', icon: 'users', badge: 24 },
    { path: '/products', label: 'Produits', icon: 'box' },
    { path: '/inventory', label: 'Inventaires', icon: 'clipboard-list' },
    { path: '/warehouses', label: 'Entrepôts', icon: 'warehouse' },
    { path: '/purchase-orders', label: 'Bons d\'Achat', icon: 'shopping-cart', badge: 5 },
    { path: '/sales-orders', label: 'Bons de Vente', icon: 'dollar-sign' },
    { path: '/shipments', label: 'Expéditions', icon: 'truck' },
    { path: '/suppliers', label: 'Fournisseurs', icon: 'building' },
    { path: '/carriers', label: 'Transporteurs', icon: 'shipping-fast' }
  ];

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    // Logique de déconnexion
    console.log('Déconnexion...');
  }
}

// pages/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {LayoutService} from '../../services/layout.service';

interface StatCard {
  title: string;
  value: number;
  icon: string;
  change: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  statCards: StatCard[] = [
    {
      title: 'Produits en Stock',
      value: 1250,
      icon: 'fas fa-boxes',
      change: 12.5,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Entrepôts Actifs',
      value: 8,
      icon: 'fas fa-warehouse',
      change: 2.3,
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      title: 'Produits Totaux',
      value: 85,
      icon: 'fas fa-tags',
      change: 5.7,
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      title: 'Commandes du Mois',
      value: 342,
      icon: 'fas fa-clipboard-list',
      change: -1.2,
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    }
  ];

  recentActivities = [
    { action: 'Nouveau produit ajouté', time: 'Il y a 5 min', user: 'Admin', icon: 'fas fa-plus-circle' },
    { action: 'Inventaire mis à jour', time: 'Il y a 15 min', user: 'Manager', icon: 'fas fa-sync-alt' },
    { action: 'Commande expédiée', time: 'Il y a 30 min', user: 'Logistics', icon: 'fas fa-shipping-fast' },
    { action: 'Rapport généré', time: 'Il y a 1 heure', user: 'Admin', icon: 'fas fa-chart-bar' },
    { action: 'Stock ajusté', time: 'Il y a 2 heures', user: 'Warehouse', icon: 'fas fa-adjust' }
  ];
  constructor(private layoutService: LayoutService ) {

  }
  ngOnInit(): void {
    this.layoutService.showLayout();
  }

  getChangeColor(change: number): string {
    return change >= 0 ? '#10b981' : '#ef4444';
  }

  getChangeIcon(change: number): string {
    return change >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down';
  }

  protected readonly Math = Math;
}

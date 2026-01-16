import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: string;
  color: string;
  trend: 'up' | 'down';
}

interface Activity {
  icon: string;
  title: string;
  description: string;
  time: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  today = new Date();

  stats: StatCard[] = [
    {
      title: 'Total Produits',
      value: '2,543',
      change: '+12.5%',
      icon: '📦',
      color: '#3b82f6',
      trend: 'up'
    },
    {
      title: 'Commandes en cours',
      value: '145',
      change: '+8.2%',
      icon: '🛒',
      color: '#10b981',
      trend: 'up'
    },
    {
      title: 'Entrepôts actifs',
      value: '12',
      change: '0%',
      icon: '🏭',
      color: '#f59e0b',
      trend: 'up'
    },
    {
      title: 'Expéditions',
      value: '89',
      change: '-3.1%',
      icon: '🚚',
      color: '#ef4444',
      trend: 'down'
    }
  ];

  recentActivities: Activity[] = [
    {
      icon: '📦',
      title: 'Nouveau produit ajouté',
      description: 'Football Jersey 2025 a été ajouté au catalogue',
      time: 'Il y a 5 minutes',
      type: 'success'
    },
    {
      icon: '🛒',
      title: 'Commande reçue',
      description: 'Commande #CMD-2024-156 de 120 unités',
      time: 'Il y a 15 minutes',
      type: 'info'
    },
    {
      icon: '⚠️',
      title: 'Stock faible',
      description: 'Produit PRD-8891 nécessite un réapprovisionnement',
      time: 'Il y a 1 heure',
      type: 'warning'
    },
    {
      icon: '🚚',
      title: 'Expédition livrée',
      description: 'Livraison #SHP-445 effectuée avec succès',
      time: 'Il y a 2 heures',
      type: 'success'
    },
    {
      icon: '❌',
      title: 'Commande annulée',
      description: 'Commande #CMD-2024-143 annulée par le client',
      time: 'Il y a 3 heures',
      type: 'danger'
    }
  ];

  quickActions = [
    { label: 'Nouveau Produit', icon: '➕', route: '/products', color: '#3b82f6' },
    { label: 'Bon d\'Achat', icon: '🛒', route: '/purchase-orders', color: '#10b981' },
    { label: 'Expédition', icon: '🚚', route: '/shipments', color: '#f59e0b' },
    { label: 'Inventaire', icon: '📋', route: '/inventory', color: '#8b5cf6' }
  ];

  ngOnInit(): void {
    // Charger les données du dashboard
  }
}

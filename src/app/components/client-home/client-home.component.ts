// components/client-home/client-home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientDashboardService } from '../../services/client-dashboard.service';
import { OrderKPIs, ClientAlert } from '../../models/client-dashboard.model';

@Component({
  selector: 'app-client-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './client-home.component.html',
  styleUrls: ['./client-home.component.css']
})
export class ClientHomeComponent implements OnInit {
  kpis: OrderKPIs | null = null;
  alerts: ClientAlert[] = [];
  isLoading = true;

  constructor(private dashboardService: ClientDashboardService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.kpis = data.kpis;
        this.alerts = data.alerts;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  getAlertClass(severity: 'info' | 'warning' | 'error'): string {
    return this.dashboardService.getAlertClass(severity);
  }

  getAlertIcon(type: 'reservation' | 'cutoff'): string {
    return this.dashboardService.getAlertIcon(type);
  }

  formatTTL(minutes: number): string {
    return this.dashboardService.formatTTL(minutes);
  }

  dismissAlert(alertId: string): void {
    // TODO: Implémenter la logique de suppression d'alerte
    this.alerts = this.alerts.filter(a => a.id !== alertId);
  }
}

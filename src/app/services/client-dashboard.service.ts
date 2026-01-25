// services/client-dashboard.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardData, OrderKPIs, ClientAlert } from '../models/client-dashboard.model';

@Injectable({
    providedIn: 'root'
})
export class ClientDashboardService {

    constructor() { }

    /**
     * Récupère les KPIs du dashboard
     * TODO: Remplacer par un vrai appel API GET /api/client/dashboard/kpis
     */
    getKPIs(): Observable<OrderKPIs> {
        // Données mock pour démonstration
        const mockKPIs: OrderKPIs = {
            created: 12,
            reserved: 8,
            shipped: 15,
            delivered: 45,
            canceled: 3
        };
        return of(mockKPIs);
    }

    /**
     * Récupère les alertes actives
     * TODO: Remplacer par un vrai appel API GET /api/client/orders/alerts
     */
    getAlerts(): Observable<ClientAlert[]> {
        // Données mock pour démonstration
        const mockAlerts: ClientAlert[] = [
            {
                id: '1',
                type: 'reservation',
                orderId: 'ORD-2026-001',
                message: 'Réservation expire dans 3h',
                severity: 'warning',
                timestamp: new Date(),
                data: {
                    ttlRemaining: 180, // minutes
                    expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000)
                }
            },
            {
                id: '2',
                type: 'reservation',
                orderId: 'ORD-2026-005',
                message: 'Réservation expire dans 45 minutes',
                severity: 'error',
                timestamp: new Date(),
                data: {
                    ttlRemaining: 45,
                    expiresAt: new Date(Date.now() + 45 * 60 * 1000)
                }
            },
            {
                id: '3',
                type: 'cutoff',
                orderId: 'ORD-2026-012',
                message: 'Commande créée après 15h - expédition prévue demain',
                severity: 'info',
                timestamp: new Date(),
                data: {
                    createdAt: new Date(2026, 0, 25, 16, 30), // 16h30
                    cutoffTime: '15:00'
                }
            }
        ];
        return of(mockAlerts);
    }

    /**
     * Récupère toutes les données du dashboard
     */
    getDashboardData(): Observable<DashboardData> {
        // En production, cela pourrait être un seul appel API
        // Pour l'instant, on combine les deux endpoints mock
        const kpis$ = this.getKPIs();
        const alerts$ = this.getAlerts();

        // Simulation de combinaison (en vrai, utilisez forkJoin de rxjs)
        return new Observable(observer => {
            let kpis: OrderKPIs;
            let alerts: ClientAlert[];

            kpis$.subscribe(k => {
                kpis = k;
                if (alerts) {
                    observer.next({ kpis, alerts });
                    observer.complete();
                }
            });

            alerts$.subscribe(a => {
                alerts = a;
                if (kpis) {
                    observer.next({ kpis, alerts });
                    observer.complete();
                }
            });
        });
    }

    /**
     * Calcule le temps restant formaté pour une alerte de réservation
     */
    formatTTL(minutes: number): string {
        if (minutes < 60) {
            return `${minutes} min`;
        } else {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;
            return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
        }
    }

    /**
     * Retourne la classe CSS selon la sévérité de l'alerte
     */
    getAlertClass(severity: 'info' | 'warning' | 'error'): string {
        const classes = {
            'info': 'alert-info',
            'warning': 'alert-warning',
            'error': 'alert-error'
        };
        return classes[severity];
    }

    /**
     * Retourne l'icône selon le type d'alerte
     */
    getAlertIcon(type: 'reservation' | 'cutoff'): string {
        const icons = {
            'reservation': 'fas fa-clock',
            'cutoff': 'fas fa-info-circle'
        };
        return icons[type];
    }
}

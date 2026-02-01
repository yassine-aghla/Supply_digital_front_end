// ============================================================================
// my-orders.component.ts - VERSION CORRIGÉE
// ============================================================================
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { SalesOrder, OrderStatus } from '../../models/sales-order.model';
import {LayoutService} from '../../services/layout.service';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {
  orders: SalesOrder[] = [];
  selectedOrder: SalesOrder | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private layoutService: LayoutService

  ) {}

  ngOnInit(): void {
    this.loadMyOrders();
    this.layoutService.hideLayout();
  }

  loadMyOrders(): void {
    this.loading = true;
    this.error = null;

    console.log('🔄 Chargement des commandes...');

    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        console.log('✅ Commandes chargées:', orders);

        // Vérifier que chaque commande a bien ses orderLines
        orders.forEach(order => {
          if (!order.orderLines || order.orderLines.length === 0) {
            console.warn(`⚠️ Commande #${order.id} n'a pas de lignes!`);
          } else {
            console.log(`✅ Commande #${order.id}: ${order.orderLines.length} lignes`);
          }
        });

        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement commandes:', error);
        this.error = 'Erreur lors du chargement de vos commandes';
        this.loading = false;
      }
    });
  }

  // ========================================================================
  // ⭐ MÉTHODES POUR CALCULER LES TOTAUX À PARTIR DES ORDERLINES
  // ========================================================================

  /**
   * ⭐ Calculer le total d'une commande à partir de ses lignes
   */
  getOrderTotal(order: SalesOrder): number {
    // Si le backend a déjà calculé le total, l'utiliser
    if (order.totalAmount !== undefined && order.totalAmount !== null) {
      return order.totalAmount;
    }

    // Sinon, calculer à partir des lignes
    if (!order.orderLines || order.orderLines.length === 0) {
      console.warn(`⚠️ Commande #${order.id} n'a pas de lignes pour calculer le total`);
      return 0;
    }

    const total = order.orderLines.reduce((sum, line) => {
      const lineTotal = line.totalPrice || (line.quantity * line.unitPrice);
      console.log(`  Ligne: ${line.productName} - ${line.quantity} x ${line.unitPrice} = ${lineTotal}`);
      return sum + lineTotal;
    }, 0);

    console.log(`💰 Total commande #${order.id}: ${total} MAD`);
    return total;
  }

  /**
   * ⭐ Calculer le nombre total d'articles
   */
  getTotalItems(order: SalesOrder): number {
    // Si le backend a déjà calculé le total, l'utiliser
    if (order.totalItems !== undefined && order.totalItems !== null) {
      return order.totalItems;
    }

    // Sinon, calculer à partir des lignes
    if (!order.orderLines || order.orderLines.length === 0) {
      return 0;
    }

    return order.orderLines.reduce((sum, line) => sum + line.quantity, 0);
  }

  /**
   * ⭐ Obtenir le détail des produits d'une commande
   */
  getOrderProducts(order: SalesOrder): string {
    if (!order.orderLines || order.orderLines.length === 0) {
      return 'Aucun produit';
    }

    if (order.orderLines.length === 1) {
      return `${order.orderLines[0].productName} (x${order.orderLines[0].quantity})`;
    }

    const firstProduct = order.orderLines[0];
    const othersCount = order.orderLines.length - 1;
    return `${firstProduct.productName} et ${othersCount} autre${othersCount > 1 ? 's' : ''}`;
  }

  // ========================================================================
  // MÉTHODES D'AFFICHAGE
  // ========================================================================

  getOrderStatus(order: SalesOrder): string {
    return this.orderService.getOrderStatus(order);
  }

  getOrderStatusLabel(status: string): string {
    return this.orderService.getOrderStatusLabel(status);
  }

  getOrderStatusColor(status: string): string {
    return this.orderService.getOrderStatusColor(status);
  }

  formatDate(date: Date | string | undefined): string {
    return this.orderService.formatDate(date);
  }

  viewOrderDetails(order: SalesOrder): void {
    console.log('👁️ Affichage détails commande:', order);
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  canCancelOrder(order: SalesOrder): boolean {
    return this.orderService.canCancelOrder(order);
  }

  cancelOrder(order: SalesOrder): void {
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    this.loading = true;
    this.orderService.cancelOrder(order.id).subscribe({
      next: () => {
        console.log('✅ Commande annulée');
        this.loadMyOrders();
        this.closeOrderDetails();
      },
      error: (error) => {
        console.error('❌ Erreur annulation:', error);
        this.error = 'Erreur lors de l\'annulation de la commande';
        this.loading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }
}

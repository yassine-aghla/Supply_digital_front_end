// components/order-detail/order-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SalesOrderService } from '../../services/sales-order.service';
import { SalesOrder, ReservationResult, ShipmentResult } from '../../models/sales-order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  order: SalesOrder | null = null;
  loading = false;
  error: string | null = null;
  warehouseId: number = 1; // Default warehouse
  cancelReason = '';
  showCancelModal = false;
  processing = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: SalesOrderService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(+id);
    }
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.error = null;

    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la commande:', err);
        this.error = 'Erreur lors du chargement de la commande';
        this.loading = false;
      }
    });
  }

  getOrderStatus(): string {
    if (!this.order) return '';
    return this.orderService.getOrderStatus(this.order);
  }

  getStatusBadgeClass(): string {
    if (!this.order) return '';
    return this.orderService.getStatusBadgeClass(this.order);
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'CREATED': 'Créée',
      'RESERVED': 'Réservée',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée'
    };
    return statusTexts[status] || status;
  }

  canReserve(): boolean {
    return this.getOrderStatus() === 'CREATED';
  }

  canShip(): boolean {
    return this.getOrderStatus() === 'RESERVED';
  }

  canDeliver(): boolean {
    return this.getOrderStatus() === 'SHIPPED';
  }

  canCancel(): boolean {
    const status = this.getOrderStatus();
    return status === 'CREATED' || status === 'RESERVED';
  }

  checkAvailability(): void {
    if (!this.order?.id) return;

    this.processing = true;
    this.orderService.checkAvailability(this.order.id, this.warehouseId).subscribe({
      next: (result) => {
        this.processing = false;
        let message = result.available
          ? '✓ Tous les produits sont disponibles'
          : '✗ Stock insuffisant pour certains produits';

        message += '\n\nDétails:\n';
        result.items.forEach(item => {
          message += `\n${item.productName}: ${item.available}/${item.requested} disponible(s)`;
        });

        alert(message);
      },
      error: (err) => {
        this.processing = false;
        console.error('Erreur:', err);
        alert('Erreur lors de la vérification de disponibilité');
      }
    });
  }

  reserveOrder(): void {
    if (!this.order?.id || !confirm('Confirmer la réservation de cette commande ?')) return;

    this.processing = true;
    this.orderService.reserveOrder(this.order.id, this.warehouseId).subscribe({
      next: (result: ReservationResult) => {
        this.processing = false;
        if (result.success) {
          alert('✓ Commande réservée avec succès');
          this.loadOrder(this.order!.id!);
        } else {
          let message = result.message + '\n\nProduits non disponibles:\n';
          result.failedItems?.forEach(item => {
            message += `\n${item.productName}: ${item.available}/${item.requested}`;
          });
          alert(message);
        }
      },
      error: (err) => {
        this.processing = false;
        console.error('Erreur:', err);
        alert('Erreur lors de la réservation');
      }
    });
  }

  shipOrder(): void {
    if (!this.order?.id || !confirm('Confirmer l\'expédition de cette commande ?')) return;

    this.processing = true;
    this.orderService.shipOrder(this.order.id, this.warehouseId).subscribe({
      next: (result: ShipmentResult) => {
        this.processing = false;
        if (result.success) {
          alert('✓ Commande expédiée avec succès');
          this.loadOrder(this.order!.id!);
        } else {
          alert(result.message);
        }
      },
      error: (err) => {
        this.processing = false;
        console.error('Erreur:', err);
        alert('Erreur lors de l\'expédition');
      }
    });
  }

  deliverOrder(): void {
    if (!this.order?.id || !confirm('Confirmer la livraison de cette commande ?')) return;

    this.processing = true;
    this.orderService.deliverOrder(this.order.id).subscribe({
      next: (result) => {
        this.processing = false;
        alert(result.message);
        this.loadOrder(this.order!.id!);
      },
      error: (err) => {
        this.processing = false;
        console.error('Erreur:', err);
        alert('Erreur lors de la livraison');
      }
    });
  }

  openCancelModal(): void {
    this.showCancelModal = true;
    this.cancelReason = '';
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancelReason = '';
  }

  confirmCancel(): void {
    if (!this.order?.id || !this.cancelReason.trim()) {
      alert('Veuillez entrer une raison d\'annulation');
      return;
    }

    this.processing = true;
    this.orderService.cancelOrder(this.order.id, this.cancelReason, this.warehouseId).subscribe({
      next: (result) => {
        this.processing = false;
        this.closeCancelModal();
        alert(result.message);
        this.router.navigate(['/sales-orders']);
      },
      error: (err) => {
        this.processing = false;
        console.error('Erreur:', err);
        alert('Erreur lors de l\'annulation');
      }
    });
  }

  editOrder(): void {
    if (this.order?.id) {
      this.router.navigate(['/sales-orders/edit', this.order.id]);
    }
  }

  deleteOrder(): void {
    if (!this.order?.id || !confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) return;

    this.orderService.deleteOrder(this.order.id).subscribe({
      next: () => {
        alert('Commande supprimée avec succès');
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('Erreur lors de la suppression');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/sales-orders']);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '0.00 MAD';
    return `${amount.toFixed(2)} MAD`;
  }
}

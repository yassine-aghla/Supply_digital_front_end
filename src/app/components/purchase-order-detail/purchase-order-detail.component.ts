// components/purchase-order-detail/purchase-order-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../../models/purchase-order.model';
import { Warehouse } from '../../models/warehouse.model';
import { WarehouseService } from '../../services/warehouse.service';

@Component({
  selector: 'app-purchase-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './purchase-order-detail.component.html',
  styleUrls: ['./purchase-order-detail.component.css']
})
export class PurchaseOrderDetailComponent implements OnInit {
  order: PurchaseOrder | null = null;
  loading = false;
  error: string | null = null;
  warehouseId: number = 1;
  selectedWarehouseId: number = 1; // Nouvelle variable pour le select
  warehouses: Warehouse[] = []; // Liste des entrepôts
  loadingWarehouses = false;
  cancelReason = '';
  showCancelModal = false;
  processing = false;

  // Pour accéder au enum dans le template
  PurchaseOrderStatus = PurchaseOrderStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private purchaseOrderService: PurchaseOrderService,
    private warehouseService: WarehouseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(+id);
      this.loadWarehouses();
    }
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.error = null;

    this.purchaseOrderService.getPurchaseOrderById(id).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du bon de commande:', err);
        this.error = 'Erreur lors du chargement du bon de commande';
        this.loading = false;
      }
    });
  }

  loadWarehouses(): void {
    this.loadingWarehouses = true;
    this.warehouseService.getAllWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses;
        this.loadingWarehouses = false;

        // Sélectionnez le premier entrepôt par défaut
        if (warehouses.length > 0) {
          this.selectedWarehouseId = warehouses[0].id!;
          this.warehouseId = warehouses[0].id!; // Mettez à jour l'ancienne variable pour compatibilité
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des entrepôts:', err);
        this.loadingWarehouses = false;
      }
    });
  }

  onWarehouseChange(): void {
    this.warehouseId = this.selectedWarehouseId;
  }

  // Méthode pour obtenir le nom de l'entrepôt sélectionné
  getSelectedWarehouseName(): string {
    const warehouse = this.warehouses.find(w => w.id === this.selectedWarehouseId);
    return warehouse ? warehouse.name : 'Non spécifié';
  }
  getStatusBadgeClass(): string {
    if (!this.order) return '';
    return this.purchaseOrderService.getStatusBadgeClass(this.order.status);
  }

  getStatusText(status: string): string {
    return this.purchaseOrderService.getStatusText(status);
  }

  canApprove(): boolean {
    return this.order ? this.purchaseOrderService.canApprove(this.order) : false;
  }

  canReceive(): boolean {
    return this.order ? this.purchaseOrderService.canReceive(this.order) : false;
  }

  canCancel(): boolean {
    return this.order ? this.purchaseOrderService.canCancel(this.order) : false;
  }

  approvePurchaseOrder(): void {
    if (!this.order?.id || !confirm('Confirmer l\'approbation de ce bon de commande ?')) return;

    this.processing = true;
    this.purchaseOrderService.approvePurchaseOrder(this.order.id).subscribe({
      next: (result) => {
        this.processing = false;
        alert(result.message);
        this.loadOrder(this.order!.id!);
      },
      error: (err) => {
        this.processing = false;
        console.error('Erreur:', err);
        alert('Erreur lors de l\'approbation');
      }
    });
  }

  checkReceptionStatus(): void {
    if (!this.order?.id) return;

    this.processing = true;
    this.purchaseOrderService.checkReceptionStatus(this.order.id).subscribe({
      next: (result) => {
        this.processing = false;
        let message = `Statut: ${result.message}\n`;
        message += `Peut être reçu: ${result.canBeReceived ? 'Oui' : 'Non'}\n\n`;

        if (result.orderLines) {
          message += 'Détails des lignes:\n';
          result.orderLines.forEach(line => {
            message += `\n${line.productName}: ${line.quantityReceived}/${line.quantityOrdered}`;
          });
        }

        alert(message);
      },
      error: (err) => {
        this.processing = false;
        console.error('Erreur:', err);
        alert('Erreur lors de la vérification du statut');
      }
    });
  }

  checkStockAvailability(): void {
    if (!this.order?.id) return;

    this.processing = true;
    this.purchaseOrderService.getStockAvailability(this.order.id, this.warehouseId).subscribe({
      next: (result) => {
        this.processing = false;
        let message = result.message + '\n\nDétails:\n';

        result.items.forEach(item => {
          message += `\n${item.productName}:`;
          message += `\n  Commandé: ${item.quantityOrdered}`;
          message += `\n  Stock actuel: ${item.currentStock}`;
          message += `\n  Stock après réception: ${item.afterReceiptStock}\n`;
        });

        alert(message);
      },
      error: (err) => {
        this.processing = false;
        console.error('Erreur:', err);
        alert('Erreur lors de la vérification du stock');
      }
    });
  }

  receiveFullOrder(): void {
    if (!this.order?.id || !confirm('Confirmer la réception complète de ce bon de commande ?')) return;

    this.processing = true;
    this.purchaseOrderService.receiveFullOrder(this.order.id, this.warehouseId).subscribe({
      next: (result) => {
        this.processing = false;
        if (result.success) {
          let message = `✓ ${result.message}\n\nArticles reçus:\n`;
          result.itemsReceived?.forEach(item => {
            message += `\n${item.productName}: ${item.quantity} unités`;
            message += `\nNouveau stock: ${item.newStockLevel}`;
          });
          alert(message);
          this.loadOrder(this.order!.id!);
        } else {
          alert(result.message);
        }
      },
      error: (err) => {
        this.processing = false;
        console.error('Erreur:', err);
        alert('Erreur lors de la réception');
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
    this.purchaseOrderService.cancelPurchaseOrder(this.order.id, this.cancelReason).subscribe({
      next: (result) => {
        this.processing = false;
        this.closeCancelModal();
        alert(result.message);
        this.router.navigate(['/purchase-orders']);
      },
      error: (err) => {
        this.processing = false;
        console.error('Erreur:', err);
        alert('Erreur lors de l\'annulation');
      }
    });
  }

  deleteOrder(): void {
    if (!this.order?.id || !confirm('Êtes-vous sûr de vouloir supprimer ce bon de commande ?')) return;

    this.purchaseOrderService.deletePurchaseOrder(this.order.id).subscribe({
      next: () => {
        alert('Bon de commande supprimé avec succès');
        this.router.navigate(['/purchase-orders']);
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert('Erreur lors de la suppression');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/purchase-orders']);
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

  calculateTotal(): number {
    return this.order ? this.purchaseOrderService.calculateOrderTotal(this.order) : 0;
  }
}

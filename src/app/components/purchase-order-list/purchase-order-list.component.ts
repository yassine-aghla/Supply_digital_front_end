// components/purchase-order-list/purchase-order-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { PurchaseOrder, PurchaseOrderStatus } from '../../models/purchase-order.model';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './purchase-order-list.component.html',
  styleUrls: ['./purchase-order-list.component.css']
})
export class PurchaseOrderListComponent implements OnInit {
  orders: PurchaseOrder[] = [];
  filteredOrders: PurchaseOrder[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  filterStatus = 'ALL';

  // Pour accéder à l'enum dans le template
  PurchaseOrderStatus = PurchaseOrderStatus;

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.purchaseOrderService.getAllPurchaseOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des bons de commande:', err);
        this.error = 'Erreur lors du chargement des bons de commande';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm ||
        order.supplierName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.id?.toString().includes(this.searchTerm);

      const matchesStatus = this.filterStatus === 'ALL' ||
        order.status === this.filterStatus;

      return matchesSearch && matchesStatus;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getStatusBadgeClass(order: PurchaseOrder): string {
    return this.purchaseOrderService.getStatusBadgeClass(order.status);
  }

  getStatusText(status: PurchaseOrderStatus | string): string {
    return this.purchaseOrderService.getStatusText(status);
  }

  viewOrder(id: number): void {
    this.router.navigate(['/purchase-orders', id]);
  }

  createOrder(): void {
    this.router.navigate(['/purchase-orders/create']);
  }

  deleteOrder(id: number, event: Event): void {
    event.stopPropagation();

    if (confirm('Êtes-vous sûr de vouloir supprimer ce bon de commande ?')) {
      this.purchaseOrderService.deletePurchaseOrder(id).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          alert('Erreur lors de la suppression du bon de commande');
        }
      });
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  calculateTotal(order: PurchaseOrder): number {
    return this.purchaseOrderService.calculateOrderTotal(order);
  }

  getLineCount(order: PurchaseOrder): number {
    return order.orderLines?.length || 0;
  }
}

// components/order-list/order-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SalesOrderService } from '../../services/sales-order.service';
import { SalesOrder } from '../../models/sales-order.model';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: SalesOrder[] = [];
  filteredOrders: SalesOrder[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  filterStatus = 'ALL';

  constructor(
    private orderService: SalesOrderService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des commandes:', err);
        this.error = 'Erreur lors du chargement des commandes';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm ||
        order.clientName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.id?.toString().includes(this.searchTerm);

      const matchesStatus = this.filterStatus === 'ALL' ||
        this.getOrderStatus(order) === this.filterStatus;

      return matchesSearch && matchesStatus;
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  getOrderStatus(order: SalesOrder): string {
    return this.orderService.getOrderStatus(order);
  }

  getStatusBadgeClass(order: SalesOrder): string {
    return this.orderService.getStatusBadgeClass(order);
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

  viewOrder(id: number): void {
    this.router.navigate(['/sales-orders', id]);
  }

  createOrder(): void {
    this.router.navigate(['/sales-orders/create']);
  }

  editOrder(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/sales-orders/edit', id]);
  }

  deleteOrder(id: number, event: Event): void {
    event.stopPropagation();

    if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
      this.orderService.deleteOrder(id).subscribe({
        next: () => {
          this.loadOrders();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          alert('Erreur lors de la suppression de la commande');
        }
      });
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number | undefined): string {
    if (!amount) return '0.00 MAD';
    return `${amount.toFixed(2)} MAD`;
  }
}

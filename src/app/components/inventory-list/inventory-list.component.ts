import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { InventoryService } from '../../services/inventory.service';
import { Inventory } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-list.component.html',
  styleUrls: ['./inventory-list.component.css']
})
export class InventoryListComponent implements OnInit, OnDestroy {
  inventories: Inventory[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Filtres
  searchTerm: string = '';
  filterLowStock: boolean = false;

  private routerSubscription?: Subscription;

  constructor(
    private inventoryService: InventoryService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInventories();

    // Recharger automatiquement quand on revient sur cette page
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (this.router.url === '/inventory') {
          console.log('Rechargement automatique des inventaires');
          this.loadInventories();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadInventories(): void {
    this.loading = true;
    this.error = null;

    this.inventoryService.getAllInventories().subscribe({
      next: (data) => {
        this.inventories = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des inventaires';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  get filteredInventories(): Inventory[] {
    let result = this.inventories;

    // Filtre par recherche
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(inv =>
        inv.productName?.toLowerCase().includes(term) ||
        inv.productCode?.toLowerCase().includes(term) ||
        inv.warehouseName?.toLowerCase().includes(term) ||
        inv.warehouseCode?.toLowerCase().includes(term)
      );
    }

    // Filtre stock faible
    if (this.filterLowStock) {
      result = result.filter(inv => this.getAvailableQty(inv) < 10);
    }

    return result;
  }

  getAvailableQty(inventory: Inventory): number {
    return inventory.qtyOnHand - inventory.qtyReserved;
  }

  getStockLevel(inventory: Inventory): 'high' | 'medium' | 'low' | 'out' {
    const available = this.getAvailableQty(inventory);
    if (available === 0) return 'out';
    if (available < 10) return 'low';
    if (available < 50) return 'medium';
    return 'high';
  }

  getStockLevelLabel(level: string): string {
    const labels: { [key: string]: string } = {
      high: 'Stock Élevé',
      medium: 'Stock Moyen',
      low: 'Stock Faible',
      out: 'Rupture'
    };
    return labels[level] || 'Inconnu';
  }

  checkAvailability(inventoryId: number): void {
    this.inventoryService.getAvailableQuantity(inventoryId).subscribe({
      next: (response) => {
        this.successMessage = `Quantité disponible: ${response.availableQuantity}`;
        this.clearMessageAfterDelay();
      },
      error: (err) => {
        this.error = 'Erreur lors de la vérification de disponibilité';
        console.error('Error:', err);
      }
    });
  }

  deleteInventory(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet inventaire ?')) {
      return;
    }

    this.inventoryService.deleteInventory(id).subscribe({
      next: () => {
        this.successMessage = 'Inventaire supprimé avec succès';
        this.loadInventories();
        this.clearMessageAfterDelay();
      },
      error: (err) => {
        this.error = 'Erreur lors de la suppression';
        console.error('Error:', err);
      }
    });
  }

  clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = null;
      this.error = null;
    }, 3000);
  }
}

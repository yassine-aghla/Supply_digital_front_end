// pages/warehouse-manager/dashboard/warehouse-dashboard.component.ts
import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';
import {WarehouseService} from '../../services/warehouse.service';
import {InventoryService} from '../../services/inventory.service';
import {AuthService} from '../../services/auth.service';
import {Warehouse} from '../../models/warehouse.model';
import {Inventory} from '../../models/inventory.model';
import {Role, User} from '../../models/user.model';
import {LayoutService} from '../../services/layout.service';

interface WarehouseWithInventories {
  warehouse: Warehouse;
  inventories: Inventory[];
  totalProducts: number;
  totalStock: number;
  totalReserved: number;
  totalAvailable: number;
  expanded: boolean;
}

@Component({
  selector: 'app-warehouse-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouse-dashboard.component.html',
  styleUrls: ['./warehouse-dashboard.component.css']
})
export class WarehouseDashboardComponent implements OnInit {
  warehousesWithInventories: WarehouseWithInventories[] = [];
  allInventories: Inventory[] = [];

  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  currentUser:User = {
     username:"",
    email:"",
    active:true,
    role:Role.WAREHOUSE_MANAGER
  };

  // Filtres
  searchQuery = '';
  selectedWarehouse: number | null = null;

  // Modal d'édition de quantités
  showEditModal = false;
  selectedInventory: Inventory | null = null;
  editForm = {
    qtyOnHand: 0,
    qtyReserved: 0
  };

  constructor(
    private warehouseService: WarehouseService,
    private inventoryService: InventoryService,
    private authService: AuthService,
    private router: Router,
    private layoutService:LayoutService
  ) {
    this.currentUser = this.authService.getCurrentUser()!;
  }

  ngOnInit(): void {
    this.layoutService.hideLayout();
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    // Charger UNIQUEMENT les entrepôts du manager connecté
    this.warehouseService.getMyWarehouses().subscribe({
      next: (warehouses) => {
        console.log('My Warehouses loaded:', warehouses);

        if (warehouses.length === 0) {
          this.showError('Aucun entrepôt assigné à votre compte');
          this.loading = false;
          return;
        }

        // Charger tous les inventaires
        this.inventoryService.getAllInventories().subscribe({
          next: (inventories) => {
            console.log('All Inventories loaded:', inventories);

            // Filtrer uniquement les inventaires des entrepôts du manager
            const myWarehouseIds = warehouses.map(w => w.id);
            const myInventories = inventories.filter(inv =>
              myWarehouseIds.includes(inv.warehouseId)
            );

            console.log('My Inventories filtered:', myInventories);
            this.allInventories = myInventories;
            this.processData(warehouses, myInventories);
            this.loading = false;
          },
          error: (error) => {
            console.error('Error loading inventories:', error);
            this.showError('Erreur lors du chargement des inventaires');
            this.loading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading my warehouses:', error);
        this.showError('Erreur lors du chargement de vos entrepôts');
        this.loading = false;
      }
    });
  }

  processData(warehouses: Warehouse[], inventories: Inventory[]): void {
    this.warehousesWithInventories = warehouses.map(warehouse => {
      const warehouseInventories = inventories.filter(
        inv => inv.warehouseId === warehouse.id
      );

      const totalStock = warehouseInventories.reduce((sum, inv) => sum + inv.qtyOnHand, 0);
      const totalReserved = warehouseInventories.reduce((sum, inv) => sum + inv.qtyReserved, 0);
      const totalAvailable = totalStock - totalReserved;

      return {
        warehouse,
        inventories: warehouseInventories,
        totalProducts: warehouseInventories.length,
        totalStock,
        totalReserved,
        totalAvailable,
        expanded: false
      };
    });

    console.log('Processed data:', this.warehousesWithInventories);
  }

  toggleWarehouse(item: WarehouseWithInventories): void {
    item.expanded = !item.expanded;
  }

  getFilteredWarehouses(): WarehouseWithInventories[] {
    let filtered = this.warehousesWithInventories;

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.warehouse.name?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }

  openEditModal(inventory: Inventory): void {
    this.selectedInventory = inventory;
    this.editForm = {
      qtyOnHand: inventory.qtyOnHand,
      qtyReserved: inventory.qtyReserved
    };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedInventory = null;
  }

  submitEditQuantities(): void {
    if (!this.selectedInventory?.id) return;

    if (this.editForm.qtyOnHand < 0 || this.editForm.qtyReserved < 0) {
      this.showError('Les quantités ne peuvent pas être négatives');
      return;
    }

    if (this.editForm.qtyReserved > this.editForm.qtyOnHand) {
      this.showError('La quantité réservée ne peut pas dépasser le stock disponible');
      return;
    }

    this.loading = true;

    this.inventoryService.updateInventoryQuantities(
      this.selectedInventory.id,
      this.editForm.qtyOnHand,
      this.editForm.qtyReserved
    ).subscribe({
      next: () => {
        this.showSuccessMessage('Quantités mises à jour avec succès');
        this.closeEditModal();
        this.loadData();
      },
      error: (error) => {
        console.error('Error updating quantities:', error);
        this.showError('Erreur lors de la mise à jour des quantités');
        this.loading = false;
      }
    });
  }

  getAvailableQty(inventory: Inventory): number {
    return inventory.qtyOnHand - inventory.qtyReserved;
  }

  getStockStatusColor(available: number, total: number): string {
    const percentage = (available / total) * 100;

    if (percentage <= 10) return 'danger';
    if (percentage <= 30) return 'warning';
    return 'success';
  }

  getTotalStats() {
    return {
      totalWarehouses: this.warehousesWithInventories.length,
      totalProducts: this.warehousesWithInventories.reduce((sum, w) => sum + w.totalProducts, 0),
      totalStock: this.warehousesWithInventories.reduce((sum, w) => sum + w.totalStock, 0),
      totalReserved: this.warehousesWithInventories.reduce((sum, w) => sum + w.totalReserved, 0),
      totalAvailable: this.warehousesWithInventories.reduce((sum, w) => sum + w.totalAvailable, 0)
    };
  }

  logout(): void {
    this.authService.logout();
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => this.successMessage = null, 3000);
  }

  private showError(message: string): void {
    this.error = message;
    setTimeout(() => this.error = null, 5000);
  }
}

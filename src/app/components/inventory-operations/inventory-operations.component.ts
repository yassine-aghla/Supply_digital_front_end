// inventory-operations.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { ProductService } from '../../services/product.service';
import { WarehouseService } from '../../services/warehouse.service';
import {
  ReservationRequest,
  MovementRequest,
  AdjustmentRequest,
  AllocationRequest,
  AllocationResponse
} from '../../models/inventory.model';
import { Product } from '../../models/product.model';
import { Warehouse } from '../../models/warehouse.model';

@Component({
  selector: 'app-inventory-operations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-operations.component.html',
  styleUrls: ['./inventory-operations.component.css']
})
export class InventoryOperationsComponent {
  activeTab: 'create' | 'reserve' | 'inbound' | 'outbound' | 'adjustment' | 'allocation' = 'create';
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  allocationResult: AllocationResponse | null = null;

  products: Product[] = [];
  warehouses: Warehouse[] = [];
  loadingData = false;

  // Formulaires
  newInventoryForm = {
    productId: 0,
    productName: '',
    productCode: '',
    warehouseId: 0,
    warehouseName: '',
    warehouseCode: '',
    qtyOnHand: 0,
    qtyReserved: 0,
    productDescription: ''
  };

  reservationForm = {
    productId: 0,
    productName: '',
    productCode: '',
    warehouseId: 0,
    warehouseName: '',
    warehouseCode: '',
    quantity: 0,
    referenceDoc: ''
  };

  movementForm = {
    productId: 0,
    productName: '',
    productCode: '',
    warehouseId: 0,
    warehouseName: '',
    warehouseCode: '',
    quantity: 0,
    referenceDoc: '',
    description: '',
    currentStock: 0
  };

  adjustmentForm = {
    productId: 0,
    productName: '',
    productCode: '',
    warehouseId: 0,
    warehouseName: '',
    warehouseCode: '',
    adjustmentQuantity: 0,
    referenceDoc: '',
    reason: '',
    currentStock: 0
  };

  allocationForm = {
    productId: 0,
    productName: '',
    productCode: '',
    totalQuantity: 0,
    warehouseIdsByPriority: [] as number[],
    availableStock: 0
  };

  warehouseIdsInput: string = '';

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService,
    private warehouseService: WarehouseService,
    protected router: Router
  ) {}

  setTab(tab: 'create' | 'reserve' | 'inbound' | 'outbound' | 'adjustment' | 'allocation'): void {
    this.activeTab = tab;
    this.resetMessages();
  }

  ngOnInit(): void {
    this.loadProductsAndWarehouses();
  }

  loadProductsAndWarehouses(): void {
    this.loadingData = true;

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.loadingData = false;
      },
      error: (err) => {
        console.error('Erreur chargement produits:', err);
        this.loadingData = false;
      }
    });

    this.warehouseService.getAllWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses;
      },
      error: (err) => {
        console.error('Erreur chargement entrepôts:', err);
      }
    });
  }

  // Méthodes de sélection pour tous les formulaires
  onProductSelected(event: any, formType: string): void {
    const productId = Number(event.target.value);
    const selectedProduct = this.products.find(p => p.id === productId);

    if (selectedProduct) {
      switch (formType) {
        case 'create':
          this.newInventoryForm.productId = selectedProduct.id!;
          this.newInventoryForm.productName = selectedProduct.name;
          this.newInventoryForm.productCode = selectedProduct.code || '';
          this.newInventoryForm.productDescription = selectedProduct.description || '';
          break;

        case 'reserve':
          this.reservationForm.productId = selectedProduct.id!;
          this.reservationForm.productName = selectedProduct.name;
          this.reservationForm.productCode = selectedProduct.code || '';
          break;

        case 'movement':
          this.movementForm.productId = selectedProduct.id!;
          this.movementForm.productName = selectedProduct.name;
          this.movementForm.productCode = selectedProduct.code || '';
          if (this.movementForm.warehouseId) {
            this.loadCurrentStock(selectedProduct.id!, 'movement', this.movementForm.warehouseId);
          }
          break;

        case 'adjustment':
          this.adjustmentForm.productId = selectedProduct.id!;
          this.adjustmentForm.productName = selectedProduct.name;
          this.adjustmentForm.productCode = selectedProduct.code || '';
          if (this.adjustmentForm.warehouseId) {
            this.loadCurrentStock(selectedProduct.id!, 'adjustment', this.adjustmentForm.warehouseId);
          }
          break;

        case 'allocation':
          this.allocationForm.productId = selectedProduct.id!;
          this.allocationForm.productName = selectedProduct.name;
          this.allocationForm.productCode = selectedProduct.code || '';
          this.calculateTotalStock(selectedProduct.id!);
          break;
      }
    }
  }

  onWarehouseSelected(event: any, formType: string): void {
    const warehouseId = Number(event.target.value);
    const selectedWarehouse = this.warehouses.find(w => w.id === warehouseId);

    if (selectedWarehouse) {
      switch (formType) {
        case 'create':
          this.newInventoryForm.warehouseId = selectedWarehouse.id!;
          this.newInventoryForm.warehouseName = selectedWarehouse.name;
          this.newInventoryForm.warehouseCode = selectedWarehouse.code || '';
          break;

        case 'reserve':
          this.reservationForm.warehouseId = selectedWarehouse.id!;
          this.reservationForm.warehouseName = selectedWarehouse.name;
          this.reservationForm.warehouseCode = selectedWarehouse.code || '';
          break;

        case 'movement':
          this.movementForm.warehouseId = selectedWarehouse.id!;
          this.movementForm.warehouseName = selectedWarehouse.name;
          this.movementForm.warehouseCode = selectedWarehouse.code || '';
          if (this.movementForm.productId) {
            this.loadCurrentStock(this.movementForm.productId, 'movement', warehouseId);
          }
          break;

        case 'adjustment':
          this.adjustmentForm.warehouseId = selectedWarehouse.id!;
          this.adjustmentForm.warehouseName = selectedWarehouse.name;
          this.adjustmentForm.warehouseCode = selectedWarehouse.code || '';
          if (this.adjustmentForm.productId) {
            this.loadCurrentStock(this.adjustmentForm.productId, 'adjustment', warehouseId);
          }
          break;
      }
    }
  }

  // Méthodes pour gérer les opérations
  createInventory(): void {
    if (!this.newInventoryForm.productId || !this.newInventoryForm.warehouseId) {
      this.error = 'Les champs Produit et Entrepôt sont obligatoires';
      return;
    }

    if (this.newInventoryForm.qtyOnHand < 0) {
      this.error = 'La quantité en main doit être positive';
      return;
    }

    if (this.newInventoryForm.qtyReserved < 0) {
      this.error = 'La quantité réservée doit être positive';
      return;
    }

    if (this.newInventoryForm.qtyReserved > this.newInventoryForm.qtyOnHand) {
      this.error = 'La quantité réservée ne peut pas dépasser la quantité en main';
      return;
    }

    this.loading = true;
    this.resetMessages();

    this.inventoryService.createInventory(this.newInventoryForm).subscribe({
      next: (response) => {
        this.successMessage = 'Inventaire créé avec succès!';
        this.resetNewInventoryForm();
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création de l\'inventaire';
        this.loading = false;
      }
    });
  }

  reserveStock(): void {
    if (!this.reservationForm.productId || !this.reservationForm.warehouseId ||
      !this.reservationForm.quantity || !this.reservationForm.referenceDoc) {
      this.error = 'Tous les champs sont obligatoires';
      return;
    }

    this.loading = true;
    this.resetMessages();

    const reservationRequest: ReservationRequest = {
      productId: this.reservationForm.productId,
      warehouseId: this.reservationForm.warehouseId,
      quantity: this.reservationForm.quantity,
      referenceDoc: this.reservationForm.referenceDoc
    };

    this.inventoryService.reserveStock(reservationRequest).subscribe({
      next: (response) => {
        if (response.error) {
          this.error = response.error;
        } else {
          this.successMessage = `Stock réservé avec succès! ${this.reservationForm.productName} - ${this.reservationForm.warehouseName}`;
          this.resetReservationForm();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors de la réservation';
        this.loading = false;
      }
    });
  }

  releaseReservation(): void {
    if (!this.reservationForm.productId || !this.reservationForm.warehouseId ||
      !this.reservationForm.quantity || !this.reservationForm.referenceDoc) {
      this.error = 'Tous les champs sont obligatoires';
      return;
    }

    this.loading = true;
    this.resetMessages();

    const releaseRequest: ReservationRequest = {
      productId: this.reservationForm.productId,
      warehouseId: this.reservationForm.warehouseId,
      quantity: this.reservationForm.quantity,
      referenceDoc: this.reservationForm.referenceDoc
    };

    this.inventoryService.releaseReservation(releaseRequest).subscribe({
      next: () => {
        this.successMessage = `Réservation libérée avec succès! ${this.reservationForm.productName} - ${this.reservationForm.warehouseName}`;
        this.resetReservationForm();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de la libération';
        this.loading = false;
      }
    });
  }

  recordInbound(): void {
    if (!this.movementForm.productId || !this.movementForm.warehouseId || !this.movementForm.quantity) {
      this.error = 'Tous les champs sont obligatoires';
      return;
    }

    this.loading = true;
    this.resetMessages();

    const movementRequest: MovementRequest = {
      productId: this.movementForm.productId,
      warehouseId: this.movementForm.warehouseId,
      quantity: this.movementForm.quantity,
      referenceDoc: this.movementForm.referenceDoc,
      description: this.movementForm.description
    };

    this.inventoryService.recordInbound(movementRequest).subscribe({
      next: () => {
        this.successMessage = `Entrée de ${this.movementForm.quantity} unités pour ${this.movementForm.productName}`;
        this.resetMovementForm();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'enregistrement';
        this.loading = false;
      }
    });
  }

  recordOutbound(): void {
    if (!this.movementForm.productId || !this.movementForm.warehouseId || !this.movementForm.quantity) {
      this.error = 'Tous les champs sont obligatoires';
      return;
    }

    if (this.movementForm.quantity > this.movementForm.currentStock) {
      this.error = `Stock insuffisant! Disponible: ${this.movementForm.currentStock}, Demandé: ${this.movementForm.quantity}`;
      return;
    }

    this.loading = true;
    this.resetMessages();

    const movementRequest: MovementRequest = {
      productId: this.movementForm.productId,
      warehouseId: this.movementForm.warehouseId,
      quantity: this.movementForm.quantity,
      referenceDoc: this.movementForm.referenceDoc,
      description: this.movementForm.description
    };

    this.inventoryService.recordOutbound(movementRequest).subscribe({
      next: () => {
        this.successMessage = `Sortie de ${this.movementForm.quantity} unités pour ${this.movementForm.productName}`;
        this.resetMovementForm();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'enregistrement';
        this.loading = false;
      }
    });
  }

  recordAdjustment(): void {
    if (!this.adjustmentForm.productId || !this.adjustmentForm.warehouseId ||
      this.adjustmentForm.adjustmentQuantity === 0) {
      this.error = 'Tous les champs obligatoires doivent être remplis';
      return;
    }

    this.loading = true;
    this.resetMessages();

    const adjustmentRequest: AdjustmentRequest = {
      productId: this.adjustmentForm.productId,
      warehouseId: this.adjustmentForm.warehouseId,
      adjustmentQuantity: this.adjustmentForm.adjustmentQuantity,
      referenceDoc: this.adjustmentForm.referenceDoc,
      reason: this.adjustmentForm.reason
    };

    this.inventoryService.recordAdjustment(adjustmentRequest).subscribe({
      next: (response) => {
        if (response.error) {
          this.error = response.error;
        } else {
          const action = this.adjustmentForm.adjustmentQuantity > 0 ? 'ajouté' : 'retiré';
          this.successMessage = `${Math.abs(this.adjustmentForm.adjustmentQuantity)} unités ${action} pour ${this.adjustmentForm.productName}`;
          this.resetAdjustmentForm();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.error || 'Erreur lors de l\'ajustement';
        this.loading = false;
      }
    });
  }

  allocateStock(): void {
    if (!this.allocationForm.productId || !this.allocationForm.totalQuantity) {
      this.error = 'Les champs Produit et Quantité Totale sont obligatoires';
      return;
    }

    const warehouseIds = this.warehouseIdsInput
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));

    if (warehouseIds.length === 0) {
      this.error = 'Veuillez entrer au moins un ID d\'entrepôt';
      return;
    }

    if (this.allocationForm.totalQuantity > this.allocationForm.availableStock) {
      this.error = `Stock insuffisant! Disponible: ${this.allocationForm.availableStock}, Demandé: ${this.allocationForm.totalQuantity}`;
      return;
    }

    this.loading = true;
    this.resetMessages();

    const allocationRequest: AllocationRequest = {
      productId: this.allocationForm.productId,
      totalQuantity: this.allocationForm.totalQuantity,
      warehouseIdsByPriority: warehouseIds
    };

    this.inventoryService.allocateFromMultipleWarehouses(allocationRequest).subscribe({
      next: (response) => {
        this.allocationResult = response;
        if (response.fullyAllocated) {
          this.successMessage = `Allocation réussie à 100% pour ${this.allocationForm.productName}`;
        } else {
          this.error = `Allocation partielle: manque ${response.shortage} unités`;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'allocation';
        this.loading = false;
      }
    });
  }

  // Méthodes utilitaires
  private loadCurrentStock(productId: number, formType: string, warehouseId?: number): void {
    if (!productId) return;

    const targetWarehouseId = warehouseId ||
      (formType === 'movement' ? this.movementForm.warehouseId :
        formType === 'adjustment' ? this.adjustmentForm.warehouseId : 0);

    if (!targetWarehouseId) return;

    this.inventoryService.getInventoryByProductAndWarehouse(productId, targetWarehouseId)
      .subscribe({
        next: (inventory:any) => {
          if (inventory) {
            const stock = inventory.qtyOnHand - inventory.qtyReserved;
            if (formType === 'movement') {
              this.movementForm.currentStock = stock;
            } else if (formType === 'adjustment') {
              this.adjustmentForm.currentStock = stock;
            }
          }
        },
        error: (err:any) => {
          console.error('Erreur chargement stock:', err);
        }
      });
  }

  private calculateTotalStock(productId: number): void {
    if (!productId) return;

    this.inventoryService.getAllInventories().subscribe({
      next: (inventories) => {
        const productInventories = inventories.filter(
          inv => inv.productId === productId
        );

        const totalStock = productInventories.reduce((sum, inv) => {
          return sum + (inv.qtyOnHand - inv.qtyReserved);
        }, 0);

        this.allocationForm.availableStock = totalStock;
      },
      error: (err) => {
        console.error('Erreur calcul stock total:', err);
      }
    });
  }

  private checkInventoryExists(productId?: number, warehouseId?: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const prodId = productId || this.reservationForm.productId;
      const whId = warehouseId || this.reservationForm.warehouseId;

      this.inventoryService.getAllInventories().subscribe({
        next: (inventories) => {
          const exists = inventories.some(inv =>
            inv.productId === prodId && inv.warehouseId === whId
          );
          resolve(exists);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  // Méthodes de reset
  resetNewInventoryForm(): void {
    this.newInventoryForm = {
      productId: 0,
      productName: '',
      productCode: '',
      productDescription: '',
      warehouseId: 0,
      warehouseName: '',
      warehouseCode: '',
      qtyOnHand: 0,
      qtyReserved: 0
    };
  }

  resetReservationForm(): void {
    this.reservationForm = {
      productId: 0,
      productName: '',
      productCode: '',
      warehouseId: 0,
      warehouseName: '',
      warehouseCode: '',
      quantity: 0,
      referenceDoc: ''
    };
  }

  resetMovementForm(): void {
    this.movementForm = {
      productId: 0,
      productName: '',
      productCode: '',
      warehouseId: 0,
      warehouseName: '',
      warehouseCode: '',
      quantity: 0,
      referenceDoc: '',
      description: '',
      currentStock: 0
    };
  }

  resetAdjustmentForm(): void {
    this.adjustmentForm = {
      productId: 0,
      productName: '',
      productCode: '',
      warehouseId: 0,
      warehouseName: '',
      warehouseCode: '',
      adjustmentQuantity: 0,
      referenceDoc: '',
      reason: '',
      currentStock: 0
    };
  }

  resetAllocationForm(): void {
    this.allocationForm = {
      productId: 0,
      productName: '',
      productCode: '',
      totalQuantity: 0,
      warehouseIdsByPriority: [],
      availableStock: 0
    };
    this.warehouseIdsInput = '';
    this.allocationResult = null;
  }

  resetMessages(): void {
    this.error = null;
    this.successMessage = null;
  }

  clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = null;
      this.error = null;
    }, 5000);
  }
}

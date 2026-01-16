// inventory-operations.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { ProductService } from '../../services/product.service'; // NOUVEAU
import { WarehouseService } from '../../services/warehouse.service';
import {
  Inventory, // AJOUTEZ CET IMPORT
  ReservationRequest,
  MovementRequest,
  AdjustmentRequest,
  AllocationRequest,
  AllocationResponse
} from '../../models/inventory.model';
import { Product } from '../../models/product.model'; // NOUVEAU
import { Warehouse } from '../../models/warehouse.model';

@Component({
  selector: 'app-inventory-operations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-operations.component.html',
  styleUrls: ['./inventory-operations.component.css']
})
export class InventoryOperationsComponent {
  // AJOUTEZ 'create' AUX TABS DISPONIBLES
  activeTab: 'create' | 'reserve' | 'inbound' | 'outbound' | 'adjustment' | 'allocation' = 'create';
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  allocationResult: AllocationResponse | null = null;

  products: Product[] = [];
  warehouses: Warehouse[] = [];
  loadingData = false;


  // NOUVEAU FORMULAIRE POUR CRÉATION D'INVENTAIRE
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

  // Formulaires existants
  reservationForm: ReservationRequest = {
    productId: null as any,
    warehouseId: null as any,
    quantity: null as any,
    referenceDoc: ''
  };

  movementForm: MovementRequest = {
    productId: 0,
    warehouseId: 0,
    quantity: 0,
    referenceDoc: '',
    description: ''
  };

  adjustmentForm: AdjustmentRequest = {
    productId: 0,
    warehouseId: 0,
    adjustmentQuantity: 0,
    referenceDoc: '',
    reason: ''
  };

  allocationForm: AllocationRequest = {
    productId: 0,
    totalQuantity: 0,
    warehouseIdsByPriority: []
  };

  warehouseIdsInput: string = '';

  constructor(
    private inventoryService: InventoryService,
    private productService: ProductService, // NOUVEAU
    private warehouseService: WarehouseService,
    protected router: Router
  ) {}

  // MODIFIEZ POUR INCLURE 'create'
  setTab(tab: 'create' | 'reserve' | 'inbound' | 'outbound' | 'adjustment' | 'allocation'): void {
    this.activeTab = tab;
    this.resetMessages();
  }

  ngOnInit(): void {
    this.loadProductsAndWarehouses();
  }
  // CHARGER LES PRODUITS ET ENTREPÔTS
  loadProductsAndWarehouses(): void {
    this.loadingData = true;

    // Charger les produits
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

    // Charger les entrepôts
    this.warehouseService.getAllWarehouses().subscribe({
      next: (warehouses) => {
        this.warehouses = warehouses;
      },
      error: (err) => {
        console.error('Erreur chargement entrepôts:', err);
      }
    });
  }

  // QUAND UN PRODUIT EST SÉLECTIONNÉ
  onProductSelected(event: any): void {
    const productId = Number(event.target.value);
    const selectedProduct = this.products.find(p => p.id === productId);

    if (selectedProduct) {
      // @ts-ignore
      this.newInventoryForm.productId = selectedProduct.id;
      this.newInventoryForm.productName = selectedProduct.name;
      this.newInventoryForm.productCode = selectedProduct.code;
      this.newInventoryForm.productDescription = selectedProduct.description || '';
    }
  }

  // QUAND UN ENTREPÔT EST SÉLECTIONNÉ
  onWarehouseSelected(event: any): void {
    const warehouseId = Number(event.target.value);
    const selectedWarehouse = this.warehouses.find(w => w.id === warehouseId);

    if (selectedWarehouse) {
      // @ts-ignore
      this.newInventoryForm.warehouseId = selectedWarehouse.id;
      this.newInventoryForm.warehouseName = selectedWarehouse.name;
      this.newInventoryForm.warehouseCode = selectedWarehouse.code;
    }
  }


  // =============== NOUVELLE MÉTHODE : CRÉER INVENTAIRE ===============
  createInventory(): void {
    console.log('Données envoyées:', this.newInventoryForm);

    // Validation
    if (!this.newInventoryForm.productId || !this.newInventoryForm.warehouseId) {
      this.error = 'Les champs ID Produit et ID Entrepôt sont obligatoires';
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

    // Vérifier que qtyReserved <= qtyOnHand
    if (this.newInventoryForm.qtyReserved > this.newInventoryForm.qtyOnHand) {
      this.error = 'La quantité réservée ne peut pas dépasser la quantité en main';
      return;
    }

    this.loading = true;
    this.resetMessages();

    this.inventoryService.createInventory(this.newInventoryForm).subscribe({
      next: (response) => {
        console.log('Inventaire créé:', response);
        this.successMessage = 'Inventaire créé avec succès!';

        // Réinitialiser le formulaire
        this.resetNewInventoryForm();
        this.loading = false;

        // Rediriger vers la liste après 2 secondes
        setTimeout(() => {
          this.router.navigate(['/inventory']);
        }, 2000);
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = err.error?.message || 'Erreur lors de la création de l\'inventaire';
        this.loading = false;
      }
    });
  }

  // =============== MÉTHODES EXISTANTES (MODIFIÉES POUR VÉRIFIER L'INVENTAIRE) ===============

  // Réservation de stock
  reserveStock(): void {
    if (!this.reservationForm.productId || !this.reservationForm.warehouseId ||
      !this.reservationForm.quantity || !this.reservationForm.referenceDoc) {
      this.error = 'Tous les champs sont obligatoires';
      return;
    }

    this.loading = true;
    this.resetMessages();

    // Vérifier si l'inventaire existe
    this.checkInventoryExists().then(exists => {
      if (!exists) {
        this.error = `Aucun inventaire trouvé pour produit ${this.reservationForm.productId} et entrepôt ${this.reservationForm.warehouseId}. Créez d'abord l'inventaire.`;
        this.loading = false;
        this.setTab('create');
        return;
      }

      // Si l'inventaire existe, faire la réservation
      this.inventoryService.reserveStock(this.reservationForm).subscribe({
        next: (response) => {
          console.log('Réponse du serveur:', response);
          if (response.error) {
            this.error = response.error;
            this.loading = false;
          } else {
            this.successMessage = `Stock réservé avec succès! Quantité: ${response.quantityReserved || this.reservationForm.quantity}`;
            this.resetReservationForm();
            this.loading = false;

            setTimeout(() => {
              this.router.navigate(['/inventory']);
            }, 2000);
          }
          this.clearMessageAfterDelay();
        },
        error: (err) => {
          console.error('Erreur complète:', err);
          this.error = err.error?.error || 'Erreur lors de la réservation';
          this.loading = false;
        }
      });
    }).catch(() => {
      this.error = 'Erreur lors de la vérification de l\'inventaire';
      this.loading = false;
    });
  }

  // Libérer réservation
  releaseReservation(): void {
    if (!this.reservationForm.productId || !this.reservationForm.warehouseId ||
      !this.reservationForm.quantity || !this.reservationForm.referenceDoc) {
      this.error = 'Tous les champs sont obligatoires';
      return;
    }

    this.loading = true;
    this.resetMessages();

    // Vérifier si l'inventaire existe
    this.checkInventoryExists().then(exists => {
      if (!exists) {
        this.error = `Aucun inventaire trouvé pour ce produit et entrepôt.`;
        this.loading = false;
        return;
      }

      this.inventoryService.releaseReservation(this.reservationForm).subscribe({
        next: (response) => {
          this.successMessage = `Réservation libérée avec succès!`;
          this.resetReservationForm();
          this.loading = false;

          setTimeout(() => {
            this.router.navigate(['/inventory']);
          }, 2000);
          this.clearMessageAfterDelay();
        },
        error: (err) => {
          this.error = 'Erreur lors de la libération';
          this.loading = false;
        }
      });
    }).catch(() => {
      this.error = 'Erreur lors de la vérification de l\'inventaire';
      this.loading = false;
    });
  }

  // Entrée de stock
  recordInbound(): void {
    if (!this.movementForm.productId || !this.movementForm.warehouseId || !this.movementForm.quantity) {
      this.error = 'Les champs productId, warehouseId et quantity sont obligatoires';
      return;
    }

    this.loading = true;
    this.resetMessages();

    // Vérifier si l'inventaire existe
    this.checkInventoryExists(this.movementForm.productId, this.movementForm.warehouseId).then(exists => {
      if (!exists) {
        this.error = `Aucun inventaire trouvé. Créez d'abord l'inventaire.`;
        this.loading = false;
        this.setTab('create');
        return;
      }

      this.inventoryService.recordInbound(this.movementForm).subscribe({
        next: () => {
          this.successMessage = `Entrée de stock enregistrée! Quantité: ${this.movementForm.quantity}`;
          this.resetMovementForm();
          this.loading = false;

          setTimeout(() => {
            this.router.navigate(['/inventory']);
          }, 2000);
          this.clearMessageAfterDelay();
        },
        error: (err) => {
          this.error = 'Erreur lors de l\'enregistrement';
          this.loading = false;
        }
      });
    }).catch(() => {
      this.error = 'Erreur lors de la vérification de l\'inventaire';
      this.loading = false;
    });
  }

  // Sortie de stock
  recordOutbound(): void {
    if (!this.movementForm.productId || !this.movementForm.warehouseId || !this.movementForm.quantity) {
      this.error = 'Les champs productId, warehouseId et quantity sont obligatoires';
      return;
    }

    this.loading = true;
    this.resetMessages();

    // Vérifier si l'inventaire existe
    this.checkInventoryExists(this.movementForm.productId, this.movementForm.warehouseId).then(exists => {
      if (!exists) {
        this.error = `Aucun inventaire trouvé. Créez d'abord l'inventaire.`;
        this.loading = false;
        this.setTab('create');
        return;
      }

      this.inventoryService.recordOutbound(this.movementForm).subscribe({
        next: () => {
          this.successMessage = `Sortie de stock enregistrée! Quantité: ${this.movementForm.quantity}`;
          this.resetMovementForm();
          this.loading = false;

          setTimeout(() => {
            this.router.navigate(['/inventory']);
          }, 2000);
          this.clearMessageAfterDelay();
        },
        error: (err) => {
          this.error = 'Erreur lors de l\'enregistrement';
          this.loading = false;
        }
      });
    }).catch(() => {
      this.error = 'Erreur lors de la vérification de l\'inventaire';
      this.loading = false;
    });
  }

  // Ajustement de stock
  recordAdjustment(): void {
    if (!this.adjustmentForm.productId || !this.adjustmentForm.warehouseId ||
      this.adjustmentForm.adjustmentQuantity === 0) {
      this.error = 'Tous les champs obligatoires doivent être remplis';
      return;
    }

    this.loading = true;
    this.resetMessages();

    // Vérifier si l'inventaire existe
    this.checkInventoryExists(this.adjustmentForm.productId, this.adjustmentForm.warehouseId).then(exists => {
      if (!exists) {
        this.error = `Aucun inventaire trouvé. Créez d'abord l'inventaire.`;
        this.loading = false;
        this.setTab('create');
        return;
      }

      this.inventoryService.recordAdjustment(this.adjustmentForm).subscribe({
        next: (response) => {
          if (response.error) {
            this.error = response.error;
            this.loading = false;
          } else {
            this.successMessage = `Ajustement enregistré! Quantité: ${this.adjustmentForm.adjustmentQuantity}`;
            this.resetAdjustmentForm();
            this.loading = false;

            setTimeout(() => {
              this.router.navigate(['/inventory']);
            }, 2000);
          }
          this.clearMessageAfterDelay();
        },
        error: (err) => {
          this.error = err.error?.error || 'Erreur lors de l\'ajustement';
          this.loading = false;
        }
      });
    }).catch(() => {
      this.error = 'Erreur lors de la vérification de l\'inventaire';
      this.loading = false;
    });
  }

  // Allocation multi-entrepôts
  allocateStock(): void {
    if (!this.allocationForm.productId || !this.allocationForm.totalQuantity) {
      this.error = 'Les champs ID Produit et Quantité Totale sont obligatoires';
      return;
    }

    this.loading = true;
    this.resetMessages();
    this.allocationResult = null;

    // Parser les IDs d'entrepôts
    this.allocationForm.warehouseIdsByPriority = this.warehouseIdsInput
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => !isNaN(id));

    if (this.allocationForm.warehouseIdsByPriority.length === 0) {
      this.error = 'Veuillez entrer au moins un ID d\'entrepôt';
      this.loading = false;
      return;
    }

    this.inventoryService.allocateFromMultipleWarehouses(this.allocationForm).subscribe({
      next: (response) => {
        this.allocationResult = response;
        if (response.fullyAllocated) {
          this.successMessage = 'Allocation réussie à 100%';
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

  // =============== MÉTHODE UTILITAIRE POUR VÉRIFIER L'EXISTENCE D'INVENTAIRE ===============
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

  // =============== MÉTHODES DE RESET ===============
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
      productId: null as any,
      warehouseId: null as any,
      quantity: null as any,
      referenceDoc: ''
    };
  }

  resetMovementForm(): void {
    this.movementForm = { productId: 0, warehouseId: 0, quantity: 0, referenceDoc: '', description: '' };
  }

  resetAdjustmentForm(): void {
    this.adjustmentForm = { productId: 0, warehouseId: 0, adjustmentQuantity: 0, referenceDoc: '', reason: '' };
  }

  resetAllocationForm(): void {
    this.allocationForm = { productId: 0, totalQuantity: 0, warehouseIdsByPriority: [] };
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

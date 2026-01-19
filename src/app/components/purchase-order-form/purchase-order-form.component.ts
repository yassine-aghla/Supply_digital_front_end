// components/purchase-order-form/purchase-order-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PurchaseOrderService } from '../../services/purchase-order.service';
import { SupplierService, Supplier } from '../../services/supplier.service';
import { ProductService } from '../../services/product.service';
import { UserService } from '../../services/user.service';
import { Product } from '../../models/product.model';
import { User, Role } from '../../models/user.model';
import { PurchaseOrderLineRequest } from '../../models/purchase-order.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './purchase-order-form.component.html',
  styleUrls: ['./purchase-order-form.component.css']
})
export class PurchaseOrderFormComponent implements OnInit {
  loading = false;
  submitting = false;
  error: string | null = null;
  loadingSuppliers = false;
  loadingProducts = false;
  loadingManagers = false;

  // Form data
  supplierId: number | null = null;
  warehouseManagerId: number | null = null;
  expectedDelivery: string = '';
  orderLines: OrderLineForm[] = [];

  // Data from services
  suppliers: Supplier[] = [];
  products: Product[] = [];
  activeProducts: Product[] = [];
  warehouseManagers: User[] = [];
  protected new: any;

  constructor(
    private purchaseOrderService: PurchaseOrderService,
    private supplierService: SupplierService,
    private productService: ProductService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.addOrderLine();

    // Set default expected delivery to 7 days from now
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    this.expectedDelivery = futureDate.toISOString().split('T')[0];
  }

  loadInitialData(): void {
    this.loadingSuppliers = true;
    this.loadingProducts = true;
    this.loadingManagers = true;

    forkJoin({
      suppliers: this.supplierService.getAll(),
      products: this.productService.getAllProducts(),
      users: this.userService.getAllUsers()
    }).subscribe({
      next: (data) => {
        // Suppliers
        this.suppliers = data.suppliers;

        // Products
        this.products = data.products;
        this.activeProducts = data.products.filter(p => p.active);

        // Warehouse Managers (users with WAREHOUSE_MANAGER role)
        this.warehouseManagers = data.users.filter(u => u.role === Role.WAREHOUSE_MANAGER);

        this.loadingSuppliers = false;
        this.loadingProducts = false;
        this.loadingManagers = false;

        console.log('Données chargées:', {
          suppliers: this.suppliers.length,
          activeProducts: this.activeProducts.length,
          warehouseManagers: this.warehouseManagers.length
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
        this.error = 'Erreur lors du chargement des données';
        this.loadingSuppliers = false;
        this.loadingProducts = false;
        this.loadingManagers = false;
      }
    });
  }

  addOrderLine(): void {
    this.orderLines.push({
      productId: null,
      quantity: 1,
      unitPrice: 0
    });
  }

  removeOrderLine(index: number): void {
    if (this.orderLines.length > 1) {
      this.orderLines.splice(index, 1);
    } else {
      alert('Un bon de commande doit contenir au moins une ligne');
    }
  }

  onProductChange(index: number): void {
    const line = this.orderLines[index];
    if (line.productId) {
      const product = this.products.find(p => p.id === line.productId);

    }
  }

  getProductName(productId: number | null): string {
    if (!productId) return '';
    const product = this.products.find(p => p.id === productId);
    return product ? product.name : '';
  }

  getProductSku(productId: number | null): string {
    if (!productId) return '';
    const product = this.products.find(p => p.id === productId);
    return product ? product.code : '';
  }

  getSupplierName(supplierId: number | null): string {
    if (!supplierId) return '';
    const supplier = this.suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : '';
  }

  getManagerName(managerId: number | null): string {
    if (!managerId) return '';
    const manager = this.warehouseManagers.find(m => m.id === managerId);
    return manager ? `${manager.username} (${manager.email})` : '';
  }

  getLineTotal(line: OrderLineForm): number {
    return line.quantity * line.unitPrice;
  }

  getGrandTotal(): number {
    return this.orderLines.reduce((sum, line) => sum + this.getLineTotal(line), 0);
  }

  validateForm(): boolean {
    this.error = null;

    if (!this.supplierId) {
      this.error = 'Veuillez sélectionner un fournisseur';
      return false;
    }

    if (!this.warehouseManagerId) {
      this.error = 'Veuillez sélectionner un gestionnaire d\'entrepôt';
      return false;
    }

    if (!this.expectedDelivery) {
      this.error = 'Veuillez sélectionner une date de livraison prévue';
      return false;
    }

    if (this.orderLines.length === 0) {
      this.error = 'Veuillez ajouter au moins une ligne de commande';
      return false;
    }

    for (let i = 0; i < this.orderLines.length; i++) {
      const line = this.orderLines[i];

      if (!line.productId) {
        this.error = `Ligne ${i + 1}: Veuillez sélectionner un produit`;
        return false;
      }

      if (line.quantity <= 0) {
        this.error = `Ligne ${i + 1}: La quantité doit être supérieure à 0`;
        return false;
      }

      if (line.unitPrice < 0) {
        this.error = `Ligne ${i + 1}: Le prix unitaire ne peut pas être négatif`;
        return false;
      }
    }

    return true;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    this.submitting = true;
    this.error = null;

    const orderData = {
      supplierId: this.supplierId!,
      warehouseManagerId: this.warehouseManagerId!,
      expectedDelivery: this.expectedDelivery
        ? `${this.expectedDelivery}T00:00:00`
        : undefined,
      orderLines: this.orderLines.map(line => ({
        productId: line.productId!,
        quantity: line.quantity,
        unitPrice: line.unitPrice
      } as PurchaseOrderLineRequest))
    };

    this.purchaseOrderService.createPurchaseOrder(orderData).subscribe({
      next: (order) => {
        this.submitting = false;
        console.log('Bon de commande créé:', order);
        this.router.navigate(['/purchase-orders', order.id]);
      },
      error: (err) => {
        console.error('Erreur lors de la création:', err);
        this.error = err.error?.message || 'Erreur lors de la création du bon de commande';
        this.submitting = false;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  cancel(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications non enregistrées seront perdues.')) {
      this.router.navigate(['/purchase-orders']);
    }
  }


  getProductCategory(productId: number | null): string {
    if (!productId) return '';
    const product = this.products.find(p => p.id === productId);
    return product?.category || '';
  }
}

interface OrderLineForm {
  productId: number | null;
  quantity: number;
  unitPrice: number;
}

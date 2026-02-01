// components/order-form/order-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SalesOrderService } from '../../services/sales-order.service';
import { UserService } from '../../services/user.service';
import { ProductService } from '../../services/product.service';
import { SalesOrderLineCreate } from '../../models/sales-order.model';
import { User, Role } from '../../models/user.model';
import { Product } from '../../models/product.model';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.css']
})
export class OrderFormComponent implements OnInit {
  isEditMode = false;
  orderId: number | null = null;
  loading = false;
  submitting = false;
  error: string | null = null;
  loadingClients = false;
  loadingProducts = false;

  // Form data
  clientId: number | null = null;
  orderLines: OrderLineForm[] = [];

  // Data from services
  clients: User[] = [];
  products: Product[] = [];
  activeProducts: Product[] = [];

  constructor(
    private orderService: SalesOrderService,
    private userService: UserService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadInitialData();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.orderId = +id;
      // Attendre que les données soient chargées avant de charger la commande
      setTimeout(() => this.loadOrder(+id), 500);
    } else {
      this.addOrderLine();
    }
  }

  loadInitialData(): void {
    this.loadingClients = true;
    this.loadingProducts = true;

    // Charger clients et produits en parallèle
    forkJoin({
      users: this.userService.getAllUsers(),
      products: this.productService.getAllProducts()
    }).subscribe({
      next: (data) => {
        // Filtrer uniquement les clients (role = CLIENT)
        this.clients = data.users.filter(user => user.role === Role.CLIENT);

        // Tous les produits
        this.products = data.products;

        // Filtrer les produits actifs pour la sélection
        this.activeProducts = data.products.filter(p => p.active);

        this.loadingClients = false;
        this.loadingProducts = false;

        console.log('Clients chargés:', this.clients.length);
        console.log('Produits actifs chargés:', this.activeProducts.length);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données:', err);
        this.error = 'Erreur lors du chargement des données';
        this.loadingClients = false;
        this.loadingProducts = false;
      }
    });
  }

  loadOrder(id: number): void {
    this.loading = true;
    this.orderService.getOrderById(id).subscribe({
      next: (order) => {
        this.clientId = order.clientId;
        this.orderLines = order.orderLines.map(line => ({
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          backordered: line.backordered || false
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur:', err);
        this.error = 'Erreur lors du chargement de la commande';
        this.loading = false;
      }
    });
  }

  addOrderLine(): void {
    this.orderLines.push({
      productId: null,
      quantity: 1,
      unitPrice: 0,
      backordered: false
    });
  }

  removeOrderLine(index: number): void {
    if (this.orderLines.length > 1) {
      this.orderLines.splice(index, 1);
    } else {
      alert('Une commande doit contenir au moins une ligne');
    }
  }

  onProductChange(index: number): void {
    const line = this.orderLines[index];
    if (line.productId) {
      const product = this.products.find(p => p.id === line.productId);

      if (product && product.price) {
        line.unitPrice = product.price;
        console.log(`Prix automatiquement défini pour ${product.name}: ${product.price} MAD`);
      } else {
        line.unitPrice = 0;
      }
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

  getClientName(clientId: number | null): string {
    if (!clientId) return '';
    const client = this.clients.find(c => c.id === clientId);
    return client ? `${client.username} (${client.email})` : '';
  }

  getLineTotal(line: OrderLineForm): number {
    return line.quantity * line.unitPrice;
  }

  getGrandTotal(): number {
    return this.orderLines.reduce((sum, line) => sum + this.getLineTotal(line), 0);
  }

  validateForm(): boolean {
    this.error = null;

    if (!this.clientId) {
      this.error = 'Veuillez sélectionner un client';
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


    }

    return true;
  }

  onSubmit(): void {
    if (!this.validateForm()) {
      return;
    }

    this.submitting = true;
    this.error = null;

    const orderData = {
      clientId: this.clientId!,
      orderLines: this.orderLines.map(line => ({
        productId: line.productId!,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        backordered: line.backordered
      } as SalesOrderLineCreate))
    };

    const request = this.isEditMode && this.orderId
      ? this.orderService.updateOrder(this.orderId, orderData)
      : this.orderService.createOrder(orderData);

    request.subscribe({
      next: (order) => {
        this.submitting = false;
        console.log('Commande enregistrée:', order);
        this.router.navigate(['/sales-orders', order.id]);
      },
      error: (err) => {
        console.error('Erreur lors de l\'enregistrement:', err);
        this.error = err.error?.message || 'Erreur lors de l\'enregistrement de la commande';
        this.submitting = false;

        // Scroll vers le haut pour voir l'erreur
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  cancel(): void {
    if (confirm('Êtes-vous sûr de vouloir annuler ? Les modifications non enregistrées seront perdues.')) {
      this.router.navigate(['/sales-orders']);
    }
  }



  // Méthode pour obtenir la catégorie d'un produit
  getProductCategory(productId: number | null): string {
    if (!productId) return '';
    const product = this.products.find(p => p.id === productId);
    return product?.category || '';
  }

  getProductPrice(productId: number | null): number {
    if (!productId) return 0;
    const product = this.products.find(p => p.id === productId);
    return product?.price || 0;
  }
}

interface OrderLineForm {
  productId: number | null;
  quantity: number;
  unitPrice: number;
  backordered: boolean;
}

// pages/client/home/home.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { SalesOrderCreate, SalesOrderLineCreate } from '../../models/sales-order.model';
import {LayoutService} from '../../services/layout.service';

interface CartItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: Product;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  cart: CartItem[] = [];
  searchQuery = '';
  selectedCategory = 'all';
  categories: string[] = ['all'];

  showCart = false;
  showCheckout = false;
  checkoutForm = {
    deliveryAddress: '',
    notes: ''
  };

  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  currentUser: any = null;

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private authService: AuthService,
    private router: Router,
    private layoutService: LayoutService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadProducts();
    this.layoutService.hideLayout();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getActiveProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.extractCategories();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.error = 'Erreur lors du chargement des produits';
        this.loading = false;
      }
    });
  }

  extractCategories(): void {
    const cats = new Set(
      this.products
        .map(p => p.category)
        .filter((c): c is string => c !== undefined && c !== null && c.trim() !== '')
    );
    this.categories = ['all', ...Array.from(cats)];
  }

  filterProducts(): void {
    let filtered = this.products;

    // Filtre par recherche
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query)
      );
    }

    // Filtre par catégorie
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    this.filteredProducts = filtered;
  }

  addToCart(product: Product): void {
    const productStock = product.stockQuantity || 0;
    const existing = this.cart.find(item => item.productId === product.id!);

    if (existing) {
      if (existing.quantity < productStock) {
        existing.quantity++;
        existing.totalPrice = existing.quantity * existing.unitPrice;
        this.showSuccessMessage('Quantité mise à jour');
      } else {
        this.showError('Stock insuffisant');
      }
    } else {
      if (productStock <= 0) {
        this.showError('Produit en rupture de stock');
        return;
      }

      const price = product.price || 0;

      this.cart.push({
        productId: product.id!,
        productName: product.name,
        quantity: 1,
        unitPrice: price,
        totalPrice: price,
        product: product
      });
      this.showSuccessMessage('Produit ajouté au panier');
    }
  }

  removeFromCart(item: CartItem): void {
    const index = this.cart.indexOf(item);
    if (index > -1) {
      this.cart.splice(index, 1);
    }
  }

  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      this.removeFromCart(item);
      return;
    }

    const productStock = item.product.stockQuantity || 0;

    if (newQuantity > productStock) {
      this.showError('Stock insuffisant');
      return;
    }

    item.quantity = newQuantity;
    item.totalPrice = item.quantity * item.unitPrice;
  }

  getCartTotal(): number {
    return this.cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  getCartItemCount(): number {
    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  proceedToCheckout(): void {
    if (this.cart.length === 0) {
      this.showError('Votre panier est vide');
      return;
    }
    this.showCheckout = true;
    this.showCart = false;
  }

  submitOrder(): void {
    if (!this.checkoutForm.deliveryAddress.trim()) {
      this.showError('Veuillez entrer une adresse de livraison');
      return;
    }

    // Récupérer l'ID du client connecté
    const clientId = this.currentUser?.id;

    if (!clientId) {
      this.showError('Erreur: utilisateur non identifié');
      return;
    }

    // Créer la commande avec votre modèle SalesOrderCreate
    const orderLines: SalesOrderLineCreate[] = this.cart.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      backordered: false
    }));

    const orderRequest: SalesOrderCreate = {
      clientId: clientId,
      orderLines: orderLines
    };

    console.log('Creating order:', orderRequest);

    this.loading = true;
    this.error = null;

    this.orderService.createOrder(orderRequest).subscribe({
      next: (order) => {
        console.log('Order created successfully:', order);
        this.showSuccessMessage('Commande créée avec succès!');
        this.cart = [];
        this.showCheckout = false;
        this.checkoutForm = { deliveryAddress: '', notes: '' };
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/my-orders']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error creating order:', error);
        this.showError(error.error?.message || 'Erreur lors de la création de la commande');
        this.loading = false;
      }
    });
  }

  viewMyOrders(): void {
    this.router.navigate(['/my-orders']);
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
    setTimeout(() => this.error = null, 3000);
  }

  // Méthodes utilitaires pour l'affichage
  getProductStock(product: Product): number {
    return product.stockQuantity || 0;
  }

  getProductPrice(product: Product): number {
    return product.price || 0;
  }

  isProductAvailable(product: Product): boolean {
    return (product.active === true || product.active === undefined) &&
      this.getProductStock(product) > 0;
  }

  getStockBadge(product: Product): string | null {
    const stock = this.getProductStock(product);
    if (stock === 0) return 'Rupture de stock';
    if (stock < 10) return 'Stock limité';
    return null;
  }

  ngOnDestroy() {
    this.layoutService.showLayout();
  }

}

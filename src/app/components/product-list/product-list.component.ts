import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error: string | null = null;
  selectedCategory: string = '';
  successMessage: string | null = null;

  // PROPRIÉTÉS POUR LE POPUP DE FORMULAIRE
  showFormPopup = false;
  isEditing = false;
  currentProduct: Product = this.getEmptyProduct();

  // Options pour les listes déroulantes
  statusOptions = ['ACTIVE', 'INACTIVE', 'DRAFT', 'PUBLISHED'];
  categoryOptions = ['ELECTRONICS', 'CLOTHING', 'FOOD', 'BOOKS', 'SPORTS', 'HOME', 'OTHER'];
  mainStyleOptions = ['CLASSIC', 'MODERN', 'VINTAGE', 'SPORT', 'CASUAL', 'FORMAL'];

  constructor(private productService: ProductService) {
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = null;

    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des produits';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  // =============== MÉTHODES POPUP FORMULAIRE ===============

  openCreatePopup(): void {
    this.currentProduct = this.getEmptyProduct();
    this.isEditing = false;
    this.showFormPopup = true;
    this.error = null;
  }

  openEditPopup(product: Product): void {
    this.currentProduct = {...product};
    this.isEditing = true;
    this.showFormPopup = true;
    this.error = null;
  }

  closePopup(): void {
    this.showFormPopup = false;
    this.currentProduct = this.getEmptyProduct();
  }

  saveProduct(): void {
    // Validation
    if (!this.currentProduct.code || !this.currentProduct.name) {
      this.error = 'Le code et le nom du produit sont obligatoires';
      return;
    }

    this.loading = true;

    if (this.isEditing && this.currentProduct.id) {
      this.updateProduct(this.currentProduct.id, this.currentProduct);
    } else {
      this.createProduct(this.currentProduct);
    }
  }

  createProduct(product: Product): void {
    this.productService.createProduct(product).subscribe({
      next: (newProduct) => {
        this.products.push(newProduct);
        this.successMessage = 'Produit créé avec succès!';
        this.closePopup();
        this.loading = false;
        this.clearMessageAfterDelay();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la création du produit';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  updateProduct(id: number, product: Product): void {
    this.productService.updateProduct(id, product).subscribe({
      next: (updatedProduct) => {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
          this.products[index] = updatedProduct;
        }
        this.successMessage = 'Produit mis à jour avec succès!';
        this.closePopup();
        this.loading = false;
        this.clearMessageAfterDelay();
      },
      error: (err) => {
        this.error = err.error?.message || 'Erreur lors de la mise à jour du produit';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  loadActiveProducts(): void {
    this.loading = true;
    this.productService.getActiveProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des produits actifs';
        this.loading = false;
      }
    });
  }

  filterByCategory(category: string): void {
    if (!category) {
      this.loadProducts();
      return;
    }

    this.loading = true;
    this.productService.getProductsByCategory(category).subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du filtrage par catégorie';
        this.loading = false;
      }
    });
  }

  activateProduct(id: number): void {
    this.productService.activateProduct(id).subscribe({
      next: () => {
        this.loadProducts();
      },
      error: (err) => {
        this.error = 'Erreur lors de l\'activation du produit';
        console.error('Error:', err);
      }
    });
  }

  deactivateProduct(id: number): void {
    this.productService.deactivateProduct(id).subscribe({
      next: (response) => {
        if (response.erro) {
          this.error = response.erro;
        } else {
          this.loadProducts();
        }
      },
      error: (err) => {
        this.error = 'Erreur lors de la désactivation du produit';
        console.error('Error:', err);
      }
    });
  }

  deleteProduct(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.loadProducts();
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression du produit';
          console.error('Error:', err);
        }
      });
    }
  }


  private getEmptyProduct(): Product {
    return {
      code: '',
      name: '',
      description: '',
      mainStyle: '',
      optionLevel: 1,
      category: '',
      configuration: '',
      base: '',
      actualEmail: '',
      active: true,
      index: false,
      profile: '',
      status: 'ACTIVE'
    };
  }

  clearMessageAfterDelay(): void {
    setTimeout(() => {
      this.successMessage = null;
      this.error = null;
    }, 3000);
  }
}

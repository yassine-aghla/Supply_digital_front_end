// components/supplier-list/supplier-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupplierService, Supplier } from '../../services/supplier.service';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-list.component.html',
  styleUrls: ['./supplier-list.component.css']
})
export class SupplierListComponent implements OnInit {
  suppliers: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];

  // Search
  searchTerm: string = '';

  // Popup modal
  showSupplierForm: boolean = false;
  isEditMode: boolean = false;
  currentSupplier: Supplier = this.getEmptySupplier();

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Alerts
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';

  constructor(private supplierService: SupplierService) {}

  ngOnInit() {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.supplierService.getAll().subscribe({
      next: (data) => {
        this.suppliers = data;
        this.filteredSuppliers = [...data];
        this.applyFilters();
      },
      error: (error) => {
        this.showAlert('Erreur lors du chargement des fournisseurs', 'error');
      }
    });
  }

  applyFilters() {
    if (!this.searchTerm.trim()) {
      this.filteredSuppliers = [...this.suppliers];
    } else {
      const searchLower = this.searchTerm.toLowerCase();
      this.filteredSuppliers = this.suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchLower) ||
        supplier.contactInfo.toLowerCase().includes(searchLower)
      );
    }
    this.currentPage = 1;
  }

  // Modal methods
  openCreateForm() {
    this.isEditMode = false;
    this.currentSupplier = this.getEmptySupplier();
    this.showSupplierForm = true;
  }

  openEditForm(supplier: Supplier) {
    this.isEditMode = true;
    this.currentSupplier = { ...supplier };
    this.showSupplierForm = true;
  }

  closeForm() {
    this.showSupplierForm = false;
    this.currentSupplier = this.getEmptySupplier();
  }

  // CRUD operations
  saveSupplier() {
    if (this.isEditMode && this.currentSupplier.id) {
      this.supplierService.update(this.currentSupplier.id, this.currentSupplier).subscribe({
        next: () => {
          this.showAlert('Fournisseur modifié avec succès', 'success');
          this.loadSuppliers();
          this.closeForm();
        },
        error: (error) => {
          this.showAlert('Erreur lors de la modification', 'error');
        }
      });
    } else {
      this.supplierService.create(this.currentSupplier).subscribe({
        next: () => {
          this.showAlert('Fournisseur créé avec succès', 'success');
          this.loadSuppliers();
          this.closeForm();
        },
        error: (error) => {
          this.showAlert('Erreur lors de la création', 'error');
        }
      });
    }
  }

  deleteSupplier(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
      this.supplierService.delete(id).subscribe({
        next: () => {
          this.showAlert('Fournisseur supprimé avec succès', 'success');
          this.loadSuppliers();
        },
        error: (error) => {
          this.showAlert('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  viewDetails(supplier: Supplier) {
    // Vous pouvez ajouter une modal de détails si nécessaire
    console.log('Détails du fournisseur:', supplier);
  }

  private getEmptySupplier(): Supplier {
    return {
      name: '',
      contactInfo: ''
    };
  }

  private showAlert(message: string, type: 'success' | 'error') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 3000);
  }

  // Getters pour les statistiques
  get totalSuppliers(): number {
    return this.filteredSuppliers.length;
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.filteredSuppliers.length / this.itemsPerPage);
  }

  get paginatedSuppliers(): Supplier[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredSuppliers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Export functionality (optional)
  exportToCSV() {
    const csvContent = this.convertToCSV(this.filteredSuppliers);
    this.downloadCSV(csvContent, 'fournisseurs.csv');
  }

  private convertToCSV(suppliers: Supplier[]): string {
    const headers = ['ID', 'Nom', 'Contact'];
    const rows = suppliers.map(s => [
      s.id || '',
      `"${s.name}"`,
      `"${s.contactInfo}"`
    ]);

    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
  }

  private downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  protected readonly Math = Math;
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WarehouseService } from '../../services/warehouse.service';
import { Warehouse } from '../../models/warehouse.model';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './warehouse-list.component.html',
  styleUrls: ['./warehouse-list.component.css']
})
export class WarehouseListComponent implements OnInit {
  warehouses: Warehouse[] = [];
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;

  // Pour le formulaire de création/modification
  showForm = false;
  editMode = false;
  currentWarehouse: Warehouse = {
    name: '',
    code: '',
    active: true
  };

  constructor(private warehouseService: WarehouseService) {}

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.loading = true;
    this.error = null;

    this.warehouseService.getAllWarehouses().subscribe({
      next: (data) => {
        this.warehouses = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des entrepôts';
        this.loading = false;
        console.error('Error:', err);
      }
    });
  }

  openCreateForm(): void {
    this.editMode = false;
    this.currentWarehouse = {
      name: '',
      code: '',
      active: true
    };
    this.showForm = true;
    this.error = null;
    this.successMessage = null;
  }

  openEditForm(warehouse: Warehouse): void {
    this.editMode = true;
    this.currentWarehouse = { ...warehouse };
    this.showForm = true;
    this.error = null;
    this.successMessage = null;
  }

  closeForm(): void {
    this.showForm = false;
    this.currentWarehouse = {
      name: '',
      code: '',
      active: true
    };
  }

  saveWarehouse(): void {
    if (!this.currentWarehouse.name || !this.currentWarehouse.code) {
      this.error = 'Le nom et le code sont obligatoires';
      return;
    }

    this.loading = true;

    if (this.editMode && this.currentWarehouse.id) {
      // Mise à jour
      this.warehouseService.updateWarehouse(this.currentWarehouse.id, this.currentWarehouse).subscribe({
        next: () => {
          this.successMessage = 'Entrepôt modifié avec succès';
          this.loadWarehouses();
          this.closeForm();
          this.loading = false;
          this.clearMessageAfterDelay();
        },
        error: (err) => {
          this.error = 'Erreur lors de la modification de l\'entrepôt';
          this.loading = false;
          console.error('Error:', err);
        }
      });
    } else {
      // Création
      this.warehouseService.createWarehouse(this.currentWarehouse).subscribe({
        next: () => {
          this.successMessage = 'Entrepôt créé avec succès';
          this.loadWarehouses();
          this.closeForm();
          this.loading = false;
          this.clearMessageAfterDelay();
        },
        error: (err) => {
          this.error = 'Erreur lors de la création de l\'entrepôt';
          this.loading = false;
          console.error('Error:', err);
        }
      });
    }
  }

  deleteWarehouse(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet entrepôt ?')) {
      return;
    }

    this.warehouseService.deleteWarehouse(id).subscribe({
      next: (response) => {
        this.successMessage = response.succes || 'Entrepôt supprimé avec succès';
        this.loadWarehouses();
        this.clearMessageAfterDelay();
      },
      error: (err) => {
        this.error = 'Erreur lors de la suppression de l\'entrepôt';
        console.error('Error:', err);
      }
    });
  }



  Updatewarehousestatut(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir modifier statut de cet entrepôt ?')) {
      return;
    }

    this.warehouseService.updateWarehouseStatut(id).subscribe({
      next: (response) => {
        this.successMessage = response.succes || 'Statut d\'Entrepôt modifier avec succès';
        this.loadWarehouses();
        this.clearMessageAfterDelay();
      },
      error: (err) => {
        this.error = 'Erreur lors de la modification de statut de l\'entrepôt';
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

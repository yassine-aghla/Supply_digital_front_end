// components/carrier-list/carrier-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CarrierService, Carrier } from '../../services/carrier.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-carrier-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './carrier-list.component.html',
  styleUrls: ['./carrier-list.component.css']
})
export class CarrierListComponent implements OnInit {
  carriers: Carrier[] = [];
  filteredCarriers: Carrier[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'ALL';

  // Variables pour le popup
  showCarrierForm: boolean = false;
  isEditMode: boolean = false;
  currentCarrier: Carrier = this.getEmptyCarrier();

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Alert
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';

  constructor(private carrierService: CarrierService) {}

  ngOnInit() {
    this.loadCarriers();
  }

  loadCarriers() {
    this.carrierService.getAll().subscribe({
      next: (data) => {
        this.carriers = data;
        this.filteredCarriers = data;
        this.applyFilters();
      },
      error: (error) => {
        this.showAlert('Erreur lors du chargement des transporteurs', 'error');
      }
    });
  }

  applyFilters() {
    this.filteredCarriers = this.carriers.filter(carrier => {
      const matchesSearch = !this.searchTerm ||
        carrier.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        carrier.code.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        carrier.contactEmail.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.selectedStatus === 'ALL' || carrier.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });

    this.currentPage = 1;
  }

  // Méthodes pour le popup
  openCreateForm() {
    this.isEditMode = false;
    this.currentCarrier = this.getEmptyCarrier();
    this.showCarrierForm = true;
  }

  openEditForm(carrier: Carrier) {
    this.isEditMode = true;
    this.currentCarrier = { ...carrier };
    this.showCarrierForm = true;
  }

  closeForm() {
    this.showCarrierForm = false;
    this.currentCarrier = this.getEmptyCarrier();
  }

  saveCarrier() {
    if (this.isEditMode && this.currentCarrier.id) {
      this.carrierService.update(this.currentCarrier.id, this.currentCarrier).subscribe({
        next: () => {
          this.showAlert('Transporteur modifié avec succès', 'success');
          this.loadCarriers();
          this.closeForm();
        },
        error: (error) => {
          this.showAlert('Erreur lors de la modification', 'error');
        }
      });
    } else {
      this.carrierService.create(this.currentCarrier).subscribe({
        next: () => {
          this.showAlert('Transporteur créé avec succès', 'success');
          this.loadCarriers();
          this.closeForm();
        },
        error: (error) => {
          this.showAlert('Erreur lors de la création', 'error');
        }
      });
    }
  }

  updateStatus(carrier: Carrier, status: string) {
    if (carrier.id) {
      this.carrierService.updateStatus(carrier.id, status).subscribe({
        next: () => {
          this.showAlert('Statut mis à jour avec succès', 'success');
          this.loadCarriers();
        },
        error: (error) => {
          this.showAlert('Erreur lors de la mise à jour du statut', 'error');
        }
      });
    }
  }

  deleteCarrier(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce transporteur ?')) {
      this.carrierService.delete(id).subscribe({
        next: () => {
          this.showAlert('Transporteur supprimé avec succès', 'success');
          this.loadCarriers();
        },
        error: (error) => {
          this.showAlert('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  private getEmptyCarrier(): Carrier {
    return {
      code: '',
      name: '',
      contactEmail: '',
      contactPhone: '',
      baseShippingRate: 0,
      maxDailyCapacity: 0,
      currentDailyShipments: 0,
      cutOffTime: '17:00',
      status: 'ACTIVE'
    };
  }

  private showAlert(message: string, type: 'success' | 'error') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 3000);
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.filteredCarriers.length / this.itemsPerPage);
  }

  get paginatedCarriers(): Carrier[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCarriers.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  protected readonly Math = Math;
}

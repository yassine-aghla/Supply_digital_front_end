// components/shipment-list/shipment-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ShipmentService, Shipment, ShipmentCreateDTO, ShipmentUpdateDTO } from '../../services/shipment.service';
import { CarrierService, Carrier } from '../../services/carrier.service';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'app-shipment-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipment-list.component.html',
  styleUrls: ['./shipment-list.component.css']
})
export class ShipmentListComponent implements OnInit {
  shipments: Shipment[] = [];
  filteredShipments: Shipment[] = [];
  carriers: Carrier[] = [];

  // Search and filter
  searchTerm: string = '';
  selectedStatus: string = 'ALL';
  selectedCarrier: string = 'ALL';

  // Popup modal
  showShipmentForm: boolean = false;
  isEditMode: boolean = false;
  currentShipment: Shipment = this.getEmptyShipment();
  trackingDetails: any = null;
  showTrackingModal: boolean = false;

  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Alerts
  alertMessage: string = '';
  alertType: 'success' | 'error' = 'success';

  // Date formatting
  today: string = new Date().toISOString().split('T')[0];

  constructor(
    private shipmentService: ShipmentService,
    private carrierService: CarrierService
  ) {}



ngOnInit() {
  forkJoin({
    shipments: this.shipmentService.getAll(),
    carriers: this.carrierService.getAll()
  }).subscribe({
    next: (result) => {
      this.shipments = result.shipments;
      this.carriers = result.carriers;
      this.filteredShipments = [...this.shipments];
      this.applyFilters();

      // Debug: vérifier la correspondance
      const missingCarriers = this.shipments
        .filter(s => !this.carriers.some(c => c.id === s.carrierId))
        .map(s => s.carrierId);

      if (missingCarriers.length > 0) {
        console.warn('IDs de transporteurs manquants:', [...new Set(missingCarriers)]);
      }
    },
    error: (error) => {
      this.showAlert('Erreur lors du chargement des données', 'error');
    }
  });
}

  loadShipments() {
    this.shipmentService.getAll().subscribe({
      next: (data) => {
        this.shipments = data;
        this.filteredShipments = data;
        this.applyFilters();
      },
      error: (error) => {
        this.showAlert('Erreur lors du chargement des expéditions', 'error');
      }
    });
  }

  loadCarriers() {
    this.carrierService.getAll().subscribe({
      next: (data) => {
        this.carriers = data;
      },
      error: (error) => {
        console.error('Error loading carriers:', error);
      }
    });
  }

  applyFilters() {
    this.filteredShipments = this.shipments.filter(shipment => {
      // Search filter
      const matchesSearch = !this.searchTerm ||
        shipment.trackingNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        shipment.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        shipment.destinationAddress?.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Status filter
      const matchesStatus = this.selectedStatus === 'ALL' || shipment.status === this.selectedStatus;

      // Carrier filter
      const matchesCarrier = this.selectedCarrier === 'ALL' ||
        shipment.carrierId.toString() === this.selectedCarrier;

      return matchesSearch && matchesStatus && matchesCarrier;
    });

    this.currentPage = 1;
  }

  // Modal methods
  openCreateForm() {
    this.isEditMode = false;
    this.currentShipment = this.getEmptyShipment();
    this.showShipmentForm = true;
  }

  openEditForm(shipment: Shipment) {
    this.isEditMode = true;
    this.currentShipment = { ...shipment };
    this.showShipmentForm = true;
  }

  openTrackingModal(trackingNumber: string) {
    this.shipmentService.trackShipment(trackingNumber).subscribe({
      next: (tracking) => {
        this.trackingDetails = tracking;
        this.showTrackingModal = true;
      },
      error: (error) => {
        this.showAlert('Erreur lors du suivi de l\'expédition', 'error');
      }
    });
  }

  closeForm() {
    this.showShipmentForm = false;
    this.currentShipment = this.getEmptyShipment();
  }

  closeTrackingModal() {
    this.showTrackingModal = false;
    this.trackingDetails = null;
  }

  // CRUD operations
  saveShipment() {
    if (this.isEditMode && this.currentShipment.id) {
      const updateData: ShipmentUpdateDTO = {
        carrierId: this.currentShipment.carrierId,
        plannedDate: this.currentShipment.plannedDate,
        status: this.currentShipment.status,
        description: this.currentShipment.description,
        actualDeliveryDate: this.currentShipment.actualDeliveryDate
      };

      this.shipmentService.update(this.currentShipment.id, updateData).subscribe({
        next: () => {
          this.showAlert('Expédition modifiée avec succès', 'success');
          this.loadShipments();
          this.closeForm();
        },
        error: (error) => {
          this.showAlert('Erreur lors de la modification', 'error');
        }
      });
    } else {
      const createData: ShipmentCreateDTO = {
        trackingNumber: this.currentShipment.trackingNumber,
        carrierId: this.currentShipment.carrierId,
        plannedDate: this.currentShipment.plannedDate,
        status: this.currentShipment.status,
        description: this.currentShipment.description
      };

      this.shipmentService.create(createData).subscribe({
        next: () => {
          this.showAlert('Expédition créée avec succès', 'success');
          this.loadShipments();
          this.closeForm();
        },
        error: (error) => {
          this.showAlert('Erreur lors de la création', 'error');
        }
      });
    }
  }

  updateShipmentStatus(shipmentId: number, status: string) {
    this.shipmentService.updateStatus(shipmentId, status).subscribe({
      next: (response) => {
        this.showAlert(response.message, 'success');
        this.loadShipments();
      },
      error: (error) => {
        this.showAlert('Erreur lors de la mise à jour du statut', 'error');
      }
    });
  }

  deleteShipment(id: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette expédition ?')) {
      this.shipmentService.delete(id).subscribe({
        next: () => {
          this.showAlert('Expédition supprimée avec succès', 'success');
          this.loadShipments();
        },
        error: (error) => {
          this.showAlert('Erreur lors de la suppression', 'error');
        }
      });
    }
  }

  getCarrierName(carrierId: number): string {
    const carrier = this.carriers.find(c => c.id === carrierId);
    return carrier ? carrier.name : 'Inconnu';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'status-pending';
      case 'IN_TRANSIT': return 'status-transit';
      case 'DELIVERED': return 'status-delivered';
      case 'CANCELLED': return 'status-cancelled';
      case 'DELAYED': return 'status-delayed';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'En attente',
      'IN_TRANSIT': 'En transit',
      'DELIVERED': 'Livré',
      'CANCELLED': 'Annulé',
      'DELAYED': 'Retardé'
    };
    return statusMap[status] || status;
  }

  private getEmptyShipment(): Shipment {
    return {
      trackingNumber: this.generateTrackingNumber(),
      carrierId: 0,
      plannedDate: new Date().toISOString().slice(0, 16),
      status: 'PENDING',
      description: '',
      shippingCost: 0
    };
  }

  private generateTrackingNumber(): string {
    const prefix = 'SH';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${prefix}${timestamp}${random}`;
  }

  private showAlert(message: string, type: 'success' | 'error') {
    this.alertMessage = message;
    this.alertType = type;
    setTimeout(() => {
      this.alertMessage = '';
    }, 3000);
  }

  // Pagination
  get totalPages(): number {
    return Math.ceil(this.filteredShipments.length / this.itemsPerPage);
  }

  get paginatedShipments(): Shipment[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredShipments.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Quick actions
  quickStartTransit(shipment: Shipment) {
    if (shipment.id && shipment.status === 'PENDING') {
      this.updateShipmentStatus(shipment.id, 'IN_TRANSIT');
    }
  }

  quickDeliver(shipment: Shipment) {
    if (shipment.id && shipment.status === 'IN_TRANSIT') {
      this.updateShipmentStatus(shipment.id, 'DELIVERED');
    }
  }

  protected readonly Math = Math;
}

// Modèle principal Inventory
export interface Inventory {
  id?: number;
  qtyOnHand: number;
  qtyReserved: number;
  warehouseId: number;
  warehouseCode?: string;
  warehouseName?: string;
  productId: number;
  productDescription?: string;
  productName?: string;
  productCode?: string;
}

// Réservation de stock
export interface ReservationRequest {
  productId: number;
  warehouseId: number;
  quantity: number;
  referenceDoc: string;
}

export interface ReservationResponse {
  success: boolean;
  message: string;
  productId: number;
  warehouseId: number;
  quantityReserved: number;
  referenceDoc: string;
}

// Mouvements de stock
export interface MovementRequest {
  productId: number;
  warehouseId: number;
  quantity: number;
  referenceDoc?: string;
  description?: string;
}

export interface InventoryMovement {
  id?: number;
  movementType: string;
  quantity: number;
  referenceDoc?: string;
  description?: string;
  movementDate?: string;
  productId: number;
  warehouseId: number;
}

// Ajustement de stock
export interface AdjustmentRequest {
  productId: number;
  warehouseId: number;
  adjustmentQuantity: number;
  referenceDoc?: string;
  reason?: string;
}

// Allocation multi-entrepôts
export interface AllocationRequest {
  productId: number;
  totalQuantity: number;
  warehouseIdsByPriority: number[];
}

export interface AllocationResult {
  warehouseId: number;
  allocatedQuantity: number;
}

export interface AllocationResponse {
  productId: number;
  requestedQuantity: number;
  totalAllocated: number;
  shortage: number;
  fullyAllocated: boolean;
  allocations: AllocationResult[];
}

// Disponibilité
export interface AvailabilityResponse {
  inventoryId: number;
  availableQuantity: number;
}

// Statut de stock
export interface StockStatusResponse {
  productId: number;
  warehouseId: number;
  outOfStock: boolean;
  message: string;
}

// Types de mouvements
export enum MovementType {
  INBOUND = 'INBOUND',
  OUTBOUND = 'OUTBOUND',
  ADJUSTMENT = 'ADJUSTMENT',
  RESERVATION = 'RESERVATION',
  RELEASE = 'RELEASE'
}


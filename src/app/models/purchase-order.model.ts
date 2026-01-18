// models/purchase-order.model.ts

export interface PurchaseOrderLine {
  id?: number;
  productId: number;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

export interface PurchaseOrder {
  id?: number;
  supplierId: number;
  supplierName?: string;
  warehouseManagerId: number;
  warehouseManagerName?: string;
  status: PurchaseOrderStatus;
  createdAt?: string;
  expectedDelivery?: string;
  orderLines: PurchaseOrderLine[];
}

export interface CreatePurchaseOrderRequest {
  supplierId: number;
  warehouseManagerId: number;
  expectedDelivery?: string;
  orderLines: PurchaseOrderLineRequest[];
}

export interface PurchaseOrderLineRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface UpdatePurchaseOrderStatusRequest {
  status: PurchaseOrderStatus;
}

export enum PurchaseOrderStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED'
}

// Business Operations Results
export interface ReceiptResult {
  success: boolean;
  message: string;
  purchaseOrderId: number;
  warehouseId: number;
  receivedAt?: string;
  itemsReceived?: Array<{
    productId: number;
    productName: string;
    quantity: number;
    newStockLevel: number;
  }>;
}

export interface ApprovalResult {
  success: boolean;
  message: string;
  purchaseOrderId: number;
  approvedAt?: string;
  newStatus: string;
}

export interface CancellationResult {
  success: boolean;
  message: string;
  purchaseOrderId: number;
  cancelledAt?: string;
  reason: string;
}

export interface ReceptionStatus {
  purchaseOrderId: number;
  status: string;
  isReceived: boolean;
  isPending: boolean;
  canBeReceived: boolean;
  message: string;
  orderLines?: Array<{
    productId: number;
    productName: string;
    quantityOrdered: number;
    quantityReceived: number;
  }>;
}

export interface StockAvailabilityForPO {
  purchaseOrderId: number;
  warehouseId: number;
  items: Array<{
    productId: number;
    productName: string;
    quantityOrdered: number;
    currentStock: number;
    afterReceiptStock: number;
  }>;
  canBeReceived: boolean;
  message: string;
}

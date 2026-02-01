
export interface SalesOrderLine {
  id?: number;
  salesOrderId?: number;
  productId: number;
  productName?: string;
  productSku?: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  backordered?: boolean;
}

export interface SalesOrder {
  totalItems: number;
  id?: number;
  clientId: number;
  clientName?: string;
  createdAt?: string;
  reservedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  orderLines: SalesOrderLine[];
  totalAmount?: number;
}

export interface SalesOrderCreate {
  clientId: number;
  orderLines: SalesOrderLineCreate[];
}

export interface SalesOrderLineCreate {
  productId: number;
  quantity: number;
  unitPrice: number;
  backordered?: boolean;
}

export interface SalesOrderUpdate {
  clientId?: number;
  orderLines?: SalesOrderLineUpdate[];
}

export interface SalesOrderLineUpdate {
  productId?: number;
  quantity?: number;
  unitPrice?: number;
  backordered?: boolean;
}

export interface ReservationResult {
  success: boolean;
  message: string;
  orderId: number;
  reservedAt?: string;
  failedItems?: Array<{
    productId: number;
    productName: string;
    requested: number;
    available: number;
  }>;
}

export interface AvailabilityCheck {
  available: boolean;
  message: string;
  orderId: number;
  items: Array<{
    productId: number;
    productName: string;
    requested: number;
    available: number;
    sufficient: boolean;
  }>;
}

export interface ShipmentResult {
  success: boolean;
  message: string;
  orderId: number;
  shipmentId?: number;
  shippedAt?: string;
}

export interface CancellationResult {
  success: boolean;
  message: string;
  orderId: number;
  cancelledAt?: string;
  reason: string;
}

export interface DeliveryResponse {
  orderId: number;
  message: string;
}

export enum OrderStatus {
  CREATED = 'CREATED',
  RESERVED = 'RESERVED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

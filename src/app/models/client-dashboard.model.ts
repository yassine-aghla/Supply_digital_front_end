// models/client-dashboard.model.ts

export interface OrderKPIs {
  created: number;
  reserved: number;
  shipped: number;
  delivered: number;
  canceled: number;
}

export interface ReservationAlert {
  orderId: string;
  ttlRemaining: number; // en minutes
  expiresAt: Date;
}

export interface CutoffAlert {
  orderId: string;
  createdAt: Date;
  message: string;
}

export interface ClientAlert {
  id: string;
  type: 'reservation' | 'cutoff';
  orderId: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: Date;
  data?: any;
}

export interface DashboardData {
  kpis: OrderKPIs;
  alerts: ClientAlert[];
}

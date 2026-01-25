// app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { Role } from './models/user.model';

export const routes: Routes = [
  // Public routes
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },

  // Protected routes (require authentication)
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'client-home',
        loadComponent: () => import('./components/client-home/client-home.component').then(m => m.ClientHomeComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'users',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/user-list/user-list.component').then(m => m.UserListComponent)
          },
          {
            path: 'create',
            loadComponent: () => import('./components/user-form/user-form.component').then(m => m.UserFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./components/user-form/user-form.component').then(m => m.UserFormComponent)
          }
        ]
      },
      {
        path: 'inventory',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/inventory-list/inventory-list.component').then(m => m.InventoryListComponent)
          },
          {
            path: 'operations',
            loadComponent: () => import('./components/inventory-operations/inventory-operations.component').then(m => m.InventoryOperationsComponent)
          }
        ]
      },
      {
        path: 'products',
        loadComponent: () => import('./components/product-list/product-list.component').then(m => m.ProductListComponent)
      },
      {
        path: 'warehouses',
        loadComponent: () => import('./components/warehouse-list/warehouse-list.component').then(m => m.WarehouseListComponent)
      },
      {
        path: 'carriers',
        loadComponent: () => import('./components/carrier-list/carrier-list.component').then(m => m.CarrierListComponent)
      },
      {
        path: 'shipments',
        loadComponent: () => import('./components/shipment-list/shipment-list.component')
          .then(m => m.ShipmentListComponent)
      },
      {
        path: 'suppliers',
        loadComponent: () => import('./components/supplier-list/supplier-list.component')
          .then(m => m.SupplierListComponent)
      },
    ]
  },
  {
    path: 'sales-orders',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/order-list/order-list.component').then(m => m.OrderListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./components/order-form/order-form.component').then(m => m.OrderFormComponent)
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./components/order-form/order-form.component').then(m => m.OrderFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/order-detail/order-detail.component').then(m => m.OrderDetailComponent)
      }
    ]
  },
  {
    path: 'purchase-orders',
    children: [
      {
        path: '',
        loadComponent: () => import('./components/purchase-order-list/purchase-order-list.component')
          .then(m => m.PurchaseOrderListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./components/purchase-order-form/purchase-order-form.component')
          .then(m => m.PurchaseOrderFormComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/purchase-order-detail/purchase-order-detail.component')
          .then(m => m.PurchaseOrderDetailComponent)
      }
    ]
  },

  // Redirect
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];

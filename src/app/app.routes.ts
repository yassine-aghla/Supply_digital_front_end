// app.routes.ts - CORRIGÉ avec protection par rôle
import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { Role } from './models/user.model';

export const routes: Routes = [
  // ========== PUBLIC ROUTES ==========
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent)
  },

  // ========== PROTECTED ROUTES ==========
  {
    path: '',
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      // ========== ADMIN ROUTES ==========
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
        data: { roles: [Role.ADMIN] }  // ✅ Seulement ADMIN
      },

      // ========== WAREHOUSE MANAGER ROUTES ==========
      {
        path: 'warehouse/dashboard',
        loadComponent: () => import('./components/warehouse-dashboard/warehouse-dashboard.component')
          .then(m => m.WarehouseDashboardComponent),
        data: { roles: [Role.WAREHOUSE_MANAGER] }  // ✅ Seulement WAREHOUSE_MANAGER
      },

      // ========== CLIENT ROUTES ==========
      {
        path: 'home',
        loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
        data: { roles: [Role.CLIENT] }  // ✅ Seulement CLIENT
      },
      {
        path: 'my-orders',
        loadComponent: () => import('./components/my-orders/my-orders.component').then(m => m.MyOrdersComponent),
        data: { roles: [Role.CLIENT] }  // ✅ Seulement CLIENT
      },

      // ========== USERS MANAGEMENT (Admin only) ==========
      {
        path: 'users',
        data: { roles: [Role.ADMIN] },  // ✅ Protection au niveau parent
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

      // ========== INVENTORY (Admin + Warehouse Manager) ==========
      {
        path: 'inventory',
        data: { roles: [Role.ADMIN] },  // ✅ Protection au niveau parent
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

      // ========== PRODUCTS ==========
      {
        path: 'products',
        children: [
          {
            path: '',
            loadComponent: () => import('./components/product-list/product-list.component').then(m => m.ProductListComponent),
            data: { roles: [Role.ADMIN, Role.WAREHOUSE_MANAGER] }  // ⭐ CORRIGÉ - Retiré CLIENT
          },
          {
            path: 'create',
            loadComponent: () => import('./components/product-list/product-list.component').then(m => m.ProductListComponent),
            data: { roles: [Role.ADMIN] }  // ✅ Seulement ADMIN
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./components/product-list/product-list.component').then(m => m.ProductListComponent),
            data: { roles: [Role.ADMIN] }  // ✅ Seulement ADMIN
          }
        ]
      },

      // ========== WAREHOUSES (Admin + Warehouse Manager) ==========
      {
        path: 'warehouses',
        loadComponent: () => import('./components/warehouse-list/warehouse-list.component').then(m => m.WarehouseListComponent),
        data: { roles: [Role.ADMIN, Role.WAREHOUSE_MANAGER] }  // ⭐ AJOUTÉ - Protection
      },

      // ========== CARRIERS (Admin + Warehouse Manager) ==========
      {
        path: 'carriers',
        loadComponent: () => import('./components/carrier-list/carrier-list.component').then(m => m.CarrierListComponent),
        data: { roles: [Role.ADMIN, Role.WAREHOUSE_MANAGER] }  // ⭐ AJOUTÉ - Protection
      },

      // ========== SHIPMENTS (Admin + Warehouse Manager) ==========
      {
        path: 'shipments',
        loadComponent: () => import('./components/shipment-list/shipment-list.component')
          .then(m => m.ShipmentListComponent),
        data: { roles: [Role.ADMIN, Role.WAREHOUSE_MANAGER] }  // ⭐ AJOUTÉ - Protection
      },

      // ========== SUPPLIERS (Admin + Warehouse Manager) ==========
      {
        path: 'suppliers',
        loadComponent: () => import('./components/supplier-list/supplier-list.component')
          .then(m => m.SupplierListComponent),
        data: { roles: [Role.ADMIN, Role.WAREHOUSE_MANAGER] }  // ⭐ AJOUTÉ - Protection
      },

      // ========== SALES ORDERS (Admin + Warehouse Manager) ==========
      {
        path: 'sales-orders',
        data: { roles: [Role.ADMIN, Role.WAREHOUSE_MANAGER] },  // ⭐ AJOUTÉ - Protection au niveau parent
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

      // ========== PURCHASE ORDERS (Admin + Warehouse Manager) ==========
      {
        path: 'purchase-orders',
        data: { roles: [Role.ADMIN, Role.WAREHOUSE_MANAGER] },  // ⭐ AJOUTÉ - Protection au niveau parent
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

      // ========== DEFAULT REDIRECT ==========
      {
        path: '',
        pathMatch: 'full',
        redirectTo: '/login'
      },
    ]
  },

  // ========== FALLBACK ROUTES ==========
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];

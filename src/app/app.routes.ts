import { Routes } from '@angular/router';
import { ProductListComponent } from './components/product-list/product-list.component';
import {WarehouseListComponent} from './components/warehouse-list/warehouse-list.component';
import { InventoryListComponent } from './components/inventory-list/inventory-list.component';
import { InventoryOperationsComponent } from './components/inventory-operations/inventory-operations.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
export const routes: Routes = [
  // Route par défaut - redirige vers /products
  {
    path: '',
    component:DashboardComponent,
    pathMatch: 'full'
  },
  // Route pour la liste des produits
  {
    path: 'products',
    component: ProductListComponent,
    title: 'Liste des Produits'
  },
  {
    path:'warehouses',
    component:WarehouseListComponent,
    title:'Liste des intropots'
  },
  {
    path: 'inventory',
    component: InventoryListComponent,
    title: 'Gestion des Inventaires'
  },

  // Route pour les opérations d'inventaire
  {
    path: 'inventory/operations',
    component: InventoryOperationsComponent,
    title: 'Opérations d\'Inventaire'
  },




  // Route pour créer un nouveau produit (à créer plus tard)
  // {
  //   path: 'products/new',
  //   component: ProductFormComponent,
  //   title: 'Nouveau Produit'
  // },

  // Route pour modifier un produit (à créer plus tard)
  // {
  //   path: 'products/:id/edit',
  //   component: ProductFormComponent,
  //   title: 'Modifier Produit'
  // },

  // Route pour voir les détails d'un produit (à créer plus tard)
  // {
  //   path: 'products/:id',
  //   component: ProductDetailComponent,
  //   title: 'Détails du Produit'
  // },

  // Route 404 - page non trouvée
  {
    path: '**',
    redirectTo: '/products'
  }
];

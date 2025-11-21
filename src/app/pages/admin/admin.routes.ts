import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'productos',
    pathMatch: 'full'
  },
  {
    path: 'productos',
    loadComponent: () => import('./productos/productos.component').then(m => m.AdminProductosComponent)
  },
  {
    path: 'servicios',
    loadComponent: () => import('./servicios/servicios.component').then(m => m.GestionServiciosComponent)
  }
];

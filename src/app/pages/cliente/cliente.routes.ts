import { Routes } from '@angular/router';

export const clienteRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
  },
  {
    path: 'configuracion',
    loadComponent: () => import('./configuracion/configuracion.component').then(m => m.ConfiguracionComponent)
  }
];

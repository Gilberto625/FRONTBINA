import { Routes } from '@angular/router';

export const barberoRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./agenda/agenda.component').then(m => m.BarberoAgendaComponent)
  },
  {
    path: 'agenda',
    loadComponent: () => import('./agenda/agenda.component').then(m => m.BarberoAgendaComponent)
  }
];

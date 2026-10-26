import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inventory' },
  {
    path: 'inventory',
    title: 'Inventory · Card Trader',
    loadComponent: () => import('./cards/inventory').then((m) => m.Inventory),
  },
  {
    path: 'cards/:id',
    title: 'Card details · Card Trader',
    loadComponent: () => import('./cards/card-page').then((m) => m.CardPage),
  },
  { path: '**', redirectTo: 'inventory' },
];

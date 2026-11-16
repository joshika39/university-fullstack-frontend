import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inventory' },
  {
    path: 'inventory',
    title: 'Inventory · Card Trader',
    loadComponent: () => import('./cards/inventory').then((m) => m.Inventory),
  },
  {
    path: 'games',
    title: 'Math game · Card Trader',
    loadComponent: () => import('./games/math-game').then((m) => m.MathGame),
  },
  {
    path: 'login',
    title: 'Log in · Card Trader',
    loadComponent: () => import('./account/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Register · Card Trader',
    loadComponent: () => import('./account/register').then((m) => m.Register),
  },
  {
    path: 'profile',
    title: 'Profile · Card Trader',
    loadComponent: () => import('./account/profile').then((m) => m.Profile),
  },
  {
    path: 'cards/:id',
    title: 'Card details · Card Trader',
    loadComponent: () => import('./cards/card-page').then((m) => m.CardPage),
  },
  { path: '**', redirectTo: 'inventory' },
];

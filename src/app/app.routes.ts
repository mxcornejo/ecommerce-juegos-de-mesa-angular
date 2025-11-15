import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products').then((m) => m.Products),
  },
  {
    path: 'products/:category',
    loadComponent: () => import('./pages/products/products').then((m) => m.Products),
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./pages/product/product').then((m) => m.Product),
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart').then((m) => m.Cart),
  },
];

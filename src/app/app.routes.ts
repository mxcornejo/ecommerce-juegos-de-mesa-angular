import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard, adminGuestGuard } from './guards/auth.guard';

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
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout').then((m) => m.Checkout),
    canActivate: [authGuard],
  },
  {
    path: 'confirmation',
    loadComponent: () => import('./pages/confirmation/confirmation').then((m) => m.Confirmation),
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./pages/sign-in/sign-in').then((m) => m.SignIn),
    canActivate: [guestGuard],
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up/sign-up').then((m) => m.SignUp),
    canActivate: [guestGuard],
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then((m) => m.Profile),
    canActivate: [authGuard],
  },
  {
    path: 'edit-profile',
    loadComponent: () => import('./pages/edit-profile/edit-profile').then((m) => m.EditProfile),
    canActivate: [authGuard],
  },
  {
    path: 'recover-password',
    loadComponent: () =>
      import('./pages/recover-password/recover-password').then((m) => m.RecoverPassword),
    canActivate: [guestGuard],
  },
  // Rutas de Administrador
  {
    path: 'admin-login',
    loadComponent: () => import('./pages/admin-login/admin-login').then((m) => m.AdminLogin),
    canActivate: [adminGuestGuard],
  },
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./pages/admin-dashboard/admin-dashboard').then((m) => m.AdminDashboard),
    canActivate: [adminGuard],
  },
];

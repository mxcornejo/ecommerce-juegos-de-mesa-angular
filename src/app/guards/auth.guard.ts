import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Guard para proteger rutas que requieren autenticación
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL a la que intentaba acceder
  const returnUrl = state.url;

  // Redirigir al login
  router.navigate(['/sign-in'], {
    queryParams: { returnUrl },
  });

  return false;
};

/**
 * Guard para evitar que usuarios autenticados accedan a páginas de login/registro
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Si ya está autenticado, redirigir al perfil
  router.navigate(['/profile']);
  return false;
};

/**
 * Guard para proteger rutas de administrador
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdminAuthenticated()) {
    return true;
  }

  // Redirigir al login de admin
  router.navigate(['/admin-login']);
  return false;
};

/**
 * Guard para evitar que admins autenticados accedan al login de admin
 */
export const adminGuestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAdminAuthenticated()) {
    return true;
  }

  // Si ya está autenticado como admin, redirigir al dashboard
  router.navigate(['/admin-dashboard']);
  return false;
};

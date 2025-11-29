import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * Componente de perfil de usuario autenticado.
 * Muestra información personal y permite cerrar sesión.
 *
 * @example
 * // Ruta en app.routes.ts:
 * { path: 'profile', component: Profile }
 *
 * @usageNotes
 * - Requiere autenticación, redirige a /sign-in si no está logueado
 * - Usa signals y computed para datos reactivos
 * - Enlaza a /edit-profile para modificar datos
 */
@Component({
  selector: 'app-profile',
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  /** Servicio de autenticación para gestión de usuario */
  private authService = inject(AuthService);

  /** Router para navegación programática */
  private router = inject(Router);

  /** Signal del usuario actual desde AuthService */
  currentUser = this.authService.currentUser;

  /** Signal de estado de autenticación */
  isAuthenticated = this.authService.isAuthenticated;

  /**
   * Edad calculada del usuario actual.
   *
   * @example
   * // En template: {{ userAge() }} años
   *
   * @returns Edad en años o 0 si no hay usuario
   */
  userAge = computed(() => {
    const user = this.currentUser();
    return user ? this.authService.calculateAge(user.fechaNacimiento) : 0;
  });

  /**
   * Fecha de nacimiento formateada en español.
   *
   * @example
   * // Retorna: "15 de marzo de 1990"
   *
   * @returns Fecha formateada o string vacío si no hay usuario
   */
  formattedBirthDate = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    const date = new Date(user.fechaNacimiento);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });

  /**
   * Fecha de registro formateada.
   *
   * @example
   * // En template: Miembro desde {{ formattedRegistrationDate() }}
   *
   * @returns Fecha de registro formateada o string vacío
   */
  formattedRegistrationDate = computed(() => {
    const user = this.currentUser();
    return user ? this.authService.formatDate(user.fechaRegistro) : '';
  });

  /**
   * Verifica autenticación al iniciar y redirige si no está logueado.
   *
   * @example
   * // Si no está autenticado, navega a /sign-in
   *
   * @usageNotes
   * Se ejecuta automáticamente al cargar el componente
   */
  ngOnInit(): void {
    if (!this.isAuthenticated()) {
      this.router.navigate(['/sign-in']);
    }
  }

  /**
   * Cierra la sesión del usuario con confirmación.
   *
   * @example
   * // <button (click)="onLogout()">Cerrar sesión</button>
   *
   * @usageNotes
   * Muestra confirm() antes de ejecutar logout
   */
  onLogout(): void {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      this.authService.logout();
    }
  }
}

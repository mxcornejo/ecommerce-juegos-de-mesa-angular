import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * Componente de inicio de sesión para administradores.
 * Valida credenciales de admin y redirige al dashboard.
 *
 * @example
 * // Navegar al login de admin
 * this.router.navigate(['/admin-login']);
 *
 * @usageNotes
 * - Credenciales de admin predefinidas en AuthService
 * - Redirige a /admin-dashboard tras login exitoso
 * - Muestra mensaje de error en credenciales inválidas
 */
@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.scss',
})
export class AdminLogin {
  /** FormBuilder para crear formularios reactivos */
  private fb = inject(FormBuilder);

  /** Servicio de autenticación */
  private authService = inject(AuthService);

  /** Router para navegación */
  private router = inject(Router);

  /** Formulario reactivo de login */
  loginForm: FormGroup;

  /** Mensaje de error a mostrar al usuario */
  errorMessage = signal<string>('');

  /** Indica si el login está en proceso */
  isLoading = signal<boolean>(false);

  /**
   * Inicializa el formulario con validaciones.
   * Campos requeridos: usuario y password.
   */
  constructor() {
    this.loginForm = this.fb.group({
      usuario: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  /**
   * Procesa el envío del formulario de login.
   * Valida campos, autentica con AuthService y redirige si es exitoso.
   *
   * @example
   * // En el template
   * <form (ngSubmit)="onSubmit()">
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { usuario, password } = this.loginForm.value;
    const result = this.authService.adminLogin(usuario, password);

    this.isLoading.set(false);

    if (result.success) {
      this.router.navigate(['/admin-dashboard']);
    } else {
      this.errorMessage.set(result.message);
    }
  }

  /**
   * Getter para el control del campo usuario.
   *
   * @returns FormControl del campo usuario
   */
  get usuario() {
    return this.loginForm.get('usuario');
  }

  /**
   * Getter para el control del campo password.
   *
   * @returns FormControl del campo password
   */
  get password() {
    return this.loginForm.get('password');
  }
}

import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * Componente de inicio de sesión para usuarios registrados.
 * Permite autenticarse con email/usuario y contraseña.
 *
 * @example
 * // Ruta en app.routes.ts:
 * { path: 'sign-in', component: SignIn }
 *
 * @usageNotes
 * - Redirige a /profile si ya está autenticado
 * - Soporta "Recordarme" guardando usuario en localStorage
 * - Compatible con SSR (verifica plataforma browser)
 * - Enlaza a /sign-up y /recover-password
 */
@Component({
  selector: 'app-sign-in',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn implements OnInit {
  /** FormBuilder para crear formularios reactivos */
  private fb = inject(FormBuilder);

  /** Servicio de autenticación */
  private authService = inject(AuthService);

  /** Router para navegación */
  private router = inject(Router);

  /** ID de la plataforma para detección SSR */
  private platformId = inject(PLATFORM_ID);

  /** Indica si se ejecuta en navegador (no SSR) */
  private isBrowser = isPlatformBrowser(this.platformId);

  /** Formulario reactivo de inicio de sesión */
  signInForm!: FormGroup;

  /** Mensaje de error a mostrar */
  errorMessage = '';

  /** Estado de carga durante autenticación */
  isLoading = false;

  /** Estado del checkbox "recordarme" */
  rememberMe = false;

  /**
   * Inicializa el componente verificando autenticación y cargando datos.
   *
   * @example
   * // Si ya está logueado, redirige a /profile
   * // Si hay usuario guardado, lo precarga en el formulario
   *
   * @usageNotes
   * Se ejecuta automáticamente al cargar el componente
   */
  ngOnInit(): void {
    // Si ya está autenticado, redirigir al perfil
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/profile']);
      return;
    }

    this.initForm();
    this.loadRememberedUser();
  }

  /**
   * Inicializa el formulario de inicio de sesión.
   *
   * @example
   * // Campos: emailUsuario, password, recordarme
   */
  private initForm(): void {
    this.signInForm = this.fb.group({
      emailUsuario: ['', [Validators.required]],
      password: ['', [Validators.required]],
      recordarme: [false],
    });
  }

  /**
   * Carga el usuario guardado en localStorage si existe.
   *
   * @example
   * // Si existe 'ww_remembered_user', precarga el email/usuario
   *
   * @usageNotes
   * Solo se ejecuta en navegador (no en SSR)
   */
  private loadRememberedUser(): void {
    if (!this.isBrowser) return;

    const rememberedUser = localStorage.getItem('ww_remembered_user');
    if (rememberedUser) {
      this.signInForm.patchValue({
        emailUsuario: rememberedUser,
        recordarme: true,
      });
      this.rememberMe = true;
    }
  }

  /**
   * Procesa el envío del formulario de login.
   *
   * @example
   * // <form (ngSubmit)="onSubmit()">
   *
   * @usageNotes
   * - Valida campos antes de enviar
   * - Guarda/elimina usuario en localStorage según "recordarme"
   * - Redirige a /profile en éxito
   * - Limpia contraseña en error
   */
  onSubmit(): void {
    this.errorMessage = '';

    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos.';
      return;
    }

    this.isLoading = true;
    const formValue = this.signInForm.value;

    const result = this.authService.login({
      emailOrUsername: formValue.emailUsuario,
      password: formValue.password,
    });

    this.isLoading = false;

    if (result.success) {
      // Guardar usuario si marcó "recordarme"
      if (this.isBrowser) {
        if (formValue.recordarme) {
          localStorage.setItem('ww_remembered_user', formValue.emailUsuario);
        } else {
          localStorage.removeItem('ww_remembered_user');
        }
      }

      // Redirigir al perfil
      this.router.navigate(['/profile']);
    } else {
      this.errorMessage = result.message;
      // Limpiar contraseña en caso de error
      this.signInForm.patchValue({ password: '' });
    }
  }

  /**
   * Verifica si un campo del formulario es inválido.
   *
   * @example
   * // <div *ngIf="isFieldInvalid('password')">Campo requerido</div>
   *
   * @param fieldName - Nombre del campo a validar
   * @returns true si el campo es inválido y fue tocado/modificado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signInForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}

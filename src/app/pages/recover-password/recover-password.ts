import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * Componente de recuperación de contraseña en dos pasos.
 * Permite solicitar código de verificación y restablecer contraseña.
 *
 * @example
 * // Ruta en app.routes.ts:
 * { path: 'recover-password', component: RecoverPassword }
 *
 * @usageNotes
 * Flujo de 2 pasos:
 * 1. Ingresa email → recibe código de 6 dígitos (válido 10 min)
 * 2. Ingresa código + nueva contraseña → restablece y redirige a sign-in
 */
@Component({
  selector: 'app-recover-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.scss',
})
export class RecoverPassword implements OnInit {
  /** FormBuilder para crear formularios reactivos */
  private fb = inject(FormBuilder);

  /** Servicio de autenticación */
  private authService = inject(AuthService);

  /** Router para navegación */
  private router = inject(Router);

  /** Formulario para solicitar código por email */
  emailForm!: FormGroup;

  /** Formulario para cambiar contraseña con código */
  passwordForm!: FormGroup;

  /** Paso actual del proceso: 'email' o 'code' */
  currentStep: 'email' | 'code' = 'email';

  /** Mensaje de error a mostrar */
  errorMessage = '';

  /** Mensaje de éxito a mostrar */
  successMessage = '';

  /** Mensaje informativo (código en dev) */
  infoMessage = '';

  /** Estado de carga durante operaciones */
  isLoading = false;

  /** Email del usuario para recuperación */
  userEmail = '';

  /** Código de verificación generado */
  generatedCode = '';

  /**
   * Inicializa los formularios al cargar el componente.
   */
  ngOnInit(): void {
    this.initForms();
  }

  /**
   * Crea los formularios reactivos con sus validadores.
   *
   * @example
   * // emailForm: solo requiere email válido
   * // passwordForm: código 6 dígitos, contraseña fuerte, confirmación
   *
   * @usageNotes
   * Requisitos de contraseña: 8-20 chars, mayúscula, número, especial
   */
  private initForms(): void {
    // Formulario para solicitar código
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    // Formulario para cambiar contraseña
    this.passwordForm = this.fb.group(
      {
        code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
        newPassword: ['', [Validators.required, this.passwordValidator]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  /**
   * Validador de fortaleza de contraseña.
   *
   * @example
   * // Contraseña válida: "Password1!"
   * // Inválida: "password" (falta mayúscula, número, especial)
   *
   * @param control - Control del formulario a validar
   * @returns null si válido, { passwordStrength: true } si no cumple requisitos
   */
  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);
    const isValidLength = value.length >= 8 && value.length <= 20;

    const passwordValid = hasUpperCase && hasNumber && hasSpecial && isValidLength;

    return passwordValid ? null : { passwordStrength: true };
  }

  /**
   * Validador de coincidencia de contraseñas.
   *
   * @param group - Grupo de formulario con newPassword y confirmPassword
   * @returns null si coinciden, { passwordMismatch: true } si no
   */
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * Paso 1: Solicita código de verificación por email.
   *
   * @example
   * // <form (ngSubmit)="onRequestCode()">
   *
   * @usageNotes
   * - Valida email antes de enviar
   * - En desarrollo muestra el código en pantalla
   * - El código es válido por 10 minutos
   */
  onRequestCode(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.infoMessage = '';

    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      this.errorMessage = 'Por favor, ingresa un email válido.';
      return;
    }

    this.isLoading = true;
    const email = this.emailForm.value.email;

    const result = this.authService.sendVerificationCode(email);

    this.isLoading = false;

    if (result.success) {
      this.userEmail = email;
      this.generatedCode = result.code || '';
      this.currentStep = 'code';
      this.successMessage = result.message;
      // Mostrar el código en modo desarrollo (en producción se enviaría por email)
      this.infoMessage = `Código de verificación: ${this.generatedCode} (válido por 10 minutos)`;
    } else {
      this.errorMessage = result.message;
    }
  }

  /**
   * Paso 2: Cambia la contraseña con el código de verificación.
   *
   * @example
   * // <form (ngSubmit)="onChangePassword()">
   *
   * @usageNotes
   * - Valida código y contraseñas antes de enviar
   * - Redirige a /sign-in después de 2 segundos en éxito
   */
  onChangePassword(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.isLoading = true;
    const formValue = this.passwordForm.value;

    const result = this.authService.resetPassword(
      this.userEmail,
      formValue.code,
      formValue.newPassword
    );

    this.isLoading = false;

    if (result.success) {
      this.successMessage = result.message;
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        this.router.navigate(['/sign-in']);
      }, 2000);
    } else {
      this.errorMessage = result.message;
    }
  }

  /**
   * Reinicia todo el proceso de recuperación.
   *
   * @example
   * // <button (click)="onReset()">Volver a intentar</button>
   *
   * @usageNotes
   * Limpia formularios, mensajes y vuelve al paso 1
   */
  onReset(): void {
    this.currentStep = 'email';
    this.emailForm.reset();
    this.passwordForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
    this.infoMessage = '';
    this.userEmail = '';
    this.generatedCode = '';
  }

  /**
   * Verifica si un campo del formulario es inválido.
   *
   * @example
   * // <div *ngIf="isFieldInvalid(emailForm, 'email')">
   *
   * @param form - Formulario que contiene el campo
   * @param fieldName - Nombre del campo a validar
   * @returns true si el campo es inválido y fue tocado/modificado
   */
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo específico.
   *
   * @example
   * // <span>{{ getFieldError(passwordForm, 'code') }}</span>
   *
   * @param form - Formulario que contiene el campo
   * @param fieldName - Nombre del campo
   * @returns Mensaje de error traducido o string vacío
   */
  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es obligatorio';
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['pattern']) return 'Debe ser un código de 6 dígitos';
    if (field.errors['passwordStrength'])
      return 'La contraseña no cumple los requisitos de seguridad';

    return '';
  }

  /**
   * Verifica si hay error de contraseñas no coincidentes.
   *
   * @example
   * // <div *ngIf="isPasswordMismatch()">Las contraseñas no coinciden</div>
   *
   * @returns true si las contraseñas no coinciden y confirmPassword fue tocado
   */
  isPasswordMismatch(): boolean {
    return (
      (this.passwordForm.hasError('passwordMismatch') &&
        this.passwordForm.get('confirmPassword')?.touched) ||
      false
    );
  }
}

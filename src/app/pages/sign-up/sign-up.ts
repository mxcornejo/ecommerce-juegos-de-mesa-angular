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
 * Componente de registro de nuevos usuarios.
 * Permite crear una cuenta con validaciones de datos personales y contraseña.
 *
 * @example
 * // Ruta en app.routes.ts:
 * { path: 'sign-up', component: SignUp }
 *
 * @usageNotes
 * - Redirige a /profile si ya está autenticado
 * - Validaciones: nombre (min 3), usuario (alfanumérico), email, edad (13+)
 * - Contraseña: 6-18 chars, mayúscula, número
 * - Campos opcionales: direccionDespacho, comentarios
 */
@Component({
  selector: 'app-sign-up',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp implements OnInit {
  /** FormBuilder para crear formularios reactivos */
  private fb = inject(FormBuilder);

  /** Servicio de autenticación */
  private authService = inject(AuthService);

  /** Router para navegación */
  private router = inject(Router);

  /** Formulario reactivo de registro */
  signUpForm!: FormGroup;

  /** Mensaje de error a mostrar */
  errorMessage = '';

  /** Mensaje de éxito después de registrar */
  successMessage = '';

  /** Estado de carga durante el registro */
  isLoading = false;

  /**
   * Inicializa el componente verificando autenticación.
   *
   * @example
   * // Si ya está logueado, redirige a /profile
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
  }

  /**
   * Inicializa el formulario de registro con validadores.
   *
   * @example
   * // Campos requeridos: nombre, usuario, email, fechaNacimiento, password
   * // Campos opcionales: direccionDespacho, comentarios
   *
   * @usageNotes
   * Incluye validador de grupo para coincidencia de contraseñas
   */
  private initForm(): void {
    this.signUpForm = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        usuario: [
          '',
          [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)],
        ],
        email: ['', [Validators.required, Validators.email]],
        fechaNacimiento: ['', [Validators.required, this.ageValidator]],
        password: ['', [Validators.required, this.passwordValidator]],
        confirmarPassword: ['', [Validators.required]],
        direccionDespacho: [''], // Campo opcional
        comentarios: [''],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  /**
   * Validador de fortaleza de contraseña.
   *
   * @example
   * // Válida: "Pass123" (6-18 chars, mayúscula, número)
   * // Inválida: "password" (falta mayúscula y número)
   *
   * @param control - Control del formulario a validar
   * @returns null si válido, { passwordStrength: true } si no cumple
   */
  private passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const isValidLength = value.length >= 6 && value.length <= 18;

    const passwordValid = hasUpperCase && hasNumber && isValidLength;

    return passwordValid ? null : { passwordStrength: true };
  }

  /**
   * Validador de edad mínima (13 años).
   *
   * @example
   * // Calcula edad a partir de fecha de nacimiento
   *
   * @param control - Control con fecha de nacimiento
   * @returns null si tiene 13+, { minAge: true } si es menor
   */
  private ageValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const birthDate = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= 13 ? null : { minAge: true };
  }

  /**
   * Validador de coincidencia de contraseñas.
   *
   * @param group - Grupo de formulario con password y confirmarPassword
   * @returns null si coinciden, { passwordMismatch: true } si no
   */
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmarPassword = group.get('confirmarPassword')?.value;

    return password === confirmarPassword ? null : { passwordMismatch: true };
  }

  /**
   * Procesa el envío del formulario de registro.
   *
   * @example
   * // <form (ngSubmit)="onSubmit()">
   *
   * @usageNotes
   * - Valida formulario antes de enviar
   * - Registra usuario via AuthService
   * - Redirige a /profile después de 1 segundo en éxito
   */
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.isLoading = true;
    const formValue = this.signUpForm.value;

    const result = this.authService.register({
      nombre: formValue.nombre,
      usuario: formValue.usuario,
      email: formValue.email,
      fechaNacimiento: formValue.fechaNacimiento,
      password: formValue.password,
      direccionDespacho: formValue.direccionDespacho,
      comentarios: formValue.comentarios,
    });

    this.isLoading = false;

    if (result.success) {
      this.successMessage = result.message;
      // Redirigir al perfil después de 1 segundo
      setTimeout(() => {
        this.router.navigate(['/profile']);
      }, 1000);
    } else {
      this.errorMessage = result.message;
    }
  }

  /**
   * Reinicia el formulario y limpia mensajes.
   *
   * @example
   * // <button type="button" (click)="onReset()">Limpiar</button>
   */
  onReset(): void {
    this.signUpForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Verifica si un campo del formulario es inválido.
   *
   * @example
   * // <div *ngIf="isFieldInvalid('email')">Error</div>
   *
   * @param fieldName - Nombre del campo a validar
   * @returns true si el campo es inválido y fue tocado/modificado
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signUpForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo específico.
   *
   * @example
   * // <span>{{ getFieldError('password') }}</span>
   *
   * @param fieldName - Nombre del campo
   * @returns Mensaje de error traducido o string vacío
   */
  getFieldError(fieldName: string): string {
    const field = this.signUpForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es obligatorio';
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['minlength'])
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['pattern']) return 'Solo letras, números y guiones bajos';
    if (field.errors['passwordStrength'])
      return 'La contraseña no cumple los requisitos de seguridad';
    if (field.errors['minAge']) return 'Debes tener al menos 13 años';

    return '';
  }

  /**
   * Verifica si hay error de contraseñas no coincidentes.
   *
   * @example
   * // <div *ngIf="isPasswordMismatch()">Las contraseñas no coinciden</div>
   *
   * @returns true si las contraseñas no coinciden y confirmación fue tocada
   */
  isPasswordMismatch(): boolean {
    return (
      (this.signUpForm.hasError('passwordMismatch') &&
        this.signUpForm.get('confirmarPassword')?.touched) ||
      false
    );
  }
}

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

@Component({
  selector: 'app-recover-password',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recover-password.html',
  styleUrl: './recover-password.scss',
})
export class RecoverPassword implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Formularios
  emailForm!: FormGroup;
  passwordForm!: FormGroup;

  // Estados
  currentStep: 'email' | 'code' = 'email';
  errorMessage = '';
  successMessage = '';
  infoMessage = '';
  isLoading = false;

  // Datos temporales
  userEmail = '';
  generatedCode = '';

  ngOnInit(): void {
    this.initForms();
  }

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

  // Validador de contraseña fuerte
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

  // Validador para que las contraseñas coincidan
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Paso 1: Solicitar código de verificación
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

  // Paso 2: Cambiar contraseña
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

  // Reiniciar el proceso
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

  // Helpers para el template
  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

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

  isPasswordMismatch(): boolean {
    return (
      (this.passwordForm.hasError('passwordMismatch') &&
        this.passwordForm.get('confirmPassword')?.touched) ||
      false
    );
  }
}

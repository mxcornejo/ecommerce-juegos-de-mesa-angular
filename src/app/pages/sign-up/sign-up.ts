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
  selector: 'app-sign-up',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  signUpForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al perfil
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/profile']);
      return;
    }

    this.initForm();
  }

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
        comentarios: [''],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // Validador personalizado para contraseña
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

  // Validador personalizado para edad mínima
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

  // Validador para que las contraseñas coincidan
  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmarPassword = group.get('confirmarPassword')?.value;

    return password === confirmarPassword ? null : { passwordMismatch: true };
  }

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

  onReset(): void {
    this.signUpForm.reset();
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Helpers para el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signUpForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

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

  isPasswordMismatch(): boolean {
    return (
      (this.signUpForm.hasError('passwordMismatch') &&
        this.signUpForm.get('confirmarPassword')?.touched) ||
      false
    );
  }
}

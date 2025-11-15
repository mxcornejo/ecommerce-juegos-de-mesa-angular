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
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.scss',
})
export class EditProfile implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  editProfileForm!: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  ngOnInit(): void {
    // Si no está autenticado, redirigir al sign-in
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/sign-in']);
      return;
    }

    this.initForm();
    this.loadUserData();
  }

  private initForm(): void {
    this.editProfileForm = this.fb.group(
      {
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        usuario: [
          '',
          [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-zA-Z0-9_]+$/)],
        ],
        email: ['', [Validators.required, Validators.email]],
        fechaNacimiento: ['', [Validators.required, this.ageValidator]],
        comentarios: [''],
        // Campos de contraseña (opcionales)
        passwordActual: [''],
        passwordNueva: [''],
        passwordConfirmar: [''],
      },
      { validators: this.passwordGroupValidator }
    );
  }

  private loadUserData(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.editProfileForm.patchValue({
        nombre: user.nombre,
        usuario: user.usuario,
        email: user.email,
        fechaNacimiento: user.fechaNacimiento,
        comentarios: user.comentarios || '',
      });
    }
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

  // Validador de grupo para contraseñas
  private passwordGroupValidator(group: AbstractControl): ValidationErrors | null {
    const passwordActual = group.get('passwordActual')?.value;
    const passwordNueva = group.get('passwordNueva')?.value;
    const passwordConfirmar = group.get('passwordConfirmar')?.value;

    // Si se intenta cambiar la contraseña
    if (passwordNueva || passwordConfirmar) {
      // Validar que se haya ingresado la contraseña actual
      if (!passwordActual) {
        return { currentPasswordRequired: true };
      }

      // Validar fortaleza de la nueva contraseña
      if (passwordNueva) {
        const hasUpperCase = /[A-Z]/.test(passwordNueva);
        const hasNumber = /[0-9]/.test(passwordNueva);
        const hasSpecial = /[!@#$%^&*]/.test(passwordNueva);
        const isValidLength = passwordNueva.length >= 8 && passwordNueva.length <= 20;

        if (!hasUpperCase || !hasNumber || !hasSpecial || !isValidLength) {
          return { passwordStrength: true };
        }
      }

      // Validar que las contraseñas coincidan
      if (passwordNueva !== passwordConfirmar) {
        return { passwordMismatch: true };
      }

      // Validar contraseña actual
      const currentUser = group.parent?.value;
      const user = this.authService.currentUser();
      if (user && passwordActual !== user.password) {
        return { incorrectPassword: true };
      }
    }

    return null;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.editProfileForm.invalid) {
      this.editProfileForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    // Validar contraseña actual si se intenta cambiar
    const formValue = this.editProfileForm.value;
    const user = this.authService.currentUser();

    if (formValue.passwordNueva && user && formValue.passwordActual !== user.password) {
      this.errorMessage = 'La contraseña actual es incorrecta.';
      return;
    }

    this.isLoading = true;

    const updateData: any = {
      nombre: formValue.nombre,
      usuario: formValue.usuario,
      email: formValue.email,
      fechaNacimiento: formValue.fechaNacimiento,
      comentarios: formValue.comentarios,
    };

    // Si se cambia la contraseña, incluirla
    if (formValue.passwordNueva) {
      updateData.password = formValue.passwordNueva;
    }

    const result = this.authService.updateProfile(updateData);

    this.isLoading = false;

    if (result.success) {
      this.successMessage = result.message;
      // Limpiar campos de contraseña
      this.editProfileForm.patchValue({
        passwordActual: '',
        passwordNueva: '',
        passwordConfirmar: '',
      });

      // Redirigir al perfil después de 1.5 segundos
      setTimeout(() => {
        this.router.navigate(['/profile']);
      }, 1500);
    } else {
      this.errorMessage = result.message;
    }
  }

  onCancel(): void {
    this.router.navigate(['/profile']);
  }

  // Helpers para el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editProfileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.editProfileForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'Este campo es obligatorio';
    if (field.errors['email']) return 'Email inválido';
    if (field.errors['minlength'])
      return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
    if (field.errors['pattern']) return 'Solo letras, números y guiones bajos';
    if (field.errors['minAge']) return 'Debes tener al menos 13 años';

    return '';
  }

  hasPasswordErrors(): boolean {
    return (
      this.editProfileForm.hasError('passwordStrength') ||
      this.editProfileForm.hasError('passwordMismatch') ||
      this.editProfileForm.hasError('currentPasswordRequired') ||
      this.editProfileForm.hasError('incorrectPassword')
    );
  }

  getPasswordError(): string {
    if (this.editProfileForm.hasError('currentPasswordRequired')) {
      return 'Debes ingresar tu contraseña actual para cambiarla';
    }
    if (this.editProfileForm.hasError('incorrectPassword')) {
      return 'La contraseña actual es incorrecta';
    }
    if (this.editProfileForm.hasError('passwordStrength')) {
      return 'La nueva contraseña no cumple con los requisitos de seguridad';
    }
    if (this.editProfileForm.hasError('passwordMismatch')) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }
}

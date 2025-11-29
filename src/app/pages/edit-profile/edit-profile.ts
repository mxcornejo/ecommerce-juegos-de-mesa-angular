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

/**
 * Componente para edición del perfil de usuario autenticado.
 * Permite modificar datos personales y cambiar contraseña.
 *
 * @example
 * // Navegar a edición de perfil
 * this.router.navigate(['/edit-profile']);
 *
 * @usageNotes
 * - Requiere autenticación, redirige a sign-in si no está logueado
 * - Validaciones: nombre (min 3), usuario (alfanumérico), email, edad (13+)
 * - Cambio de contraseña opcional con validación de fortaleza
 * - Redirige a /profile después de guardar exitosamente
 */
@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.scss',
})
export class EditProfile implements OnInit {
  /** FormBuilder para crear formularios reactivos */
  private fb = inject(FormBuilder);

  /** Servicio de autenticación para gestión de usuario */
  private authService = inject(AuthService);

  /** Router para navegación programática */
  private router = inject(Router);

  /** Formulario reactivo de edición de perfil */
  editProfileForm!: FormGroup;

  /** Mensaje de error a mostrar al usuario */
  errorMessage = '';

  /** Mensaje de éxito después de guardar */
  successMessage = '';

  /** Estado de carga durante el envío del formulario */
  isLoading = false;

  /**
   * Inicializa el componente verificando autenticación y cargando datos.
   *
   * @example
   * // Se ejecuta automáticamente al cargar
   * // Verifica auth → inicializa form → carga datos usuario
   *
   * @usageNotes
   * Redirige a /sign-in si el usuario no está autenticado
   */
  ngOnInit(): void {
    // Si no está autenticado, redirigir al sign-in
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/sign-in']);
      return;
    }

    this.initForm();
    this.loadUserData();
  }

  /**
   * Inicializa el formulario con validadores y estructura de campos.
   *
   * @example
   * // Campos del formulario:
   * // nombre, usuario, email, fechaNacimiento, comentarios
   * // passwordActual, passwordNueva, passwordConfirmar (opcionales)
   *
   * @usageNotes
   * Incluye validador de grupo para contraseñas
   */
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

  /**
   * Carga los datos del usuario actual en el formulario.
   *
   * @example
   * // Obtiene usuario de AuthService y llena el formulario
   * this.loadUserData();
   *
   * @usageNotes
   * Se ejecuta después de initForm() en ngOnInit
   */
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

  /**
   * Validador personalizado para verificar edad mínima de 13 años.
   *
   * @example
   * // Uso en FormControl:
   * // fechaNacimiento: ['', [Validators.required, this.ageValidator]]
   *
   * @param control - Control del formulario con fecha de nacimiento
   * @returns null si válido, { minAge: true } si es menor de 13
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
   * Validador de grupo para cambio de contraseña.
   *
   * @example
   * // Errores posibles:
   * // { currentPasswordRequired: true } - Falta contraseña actual
   * // { passwordStrength: true } - No cumple requisitos
   * // { passwordMismatch: true } - No coinciden
   * // { incorrectPassword: true } - Contraseña actual incorrecta
   *
   * @param group - Grupo de formulario a validar
   * @returns null si válido, objeto con error específico si no
   *
   * @usageNotes
   * Requisitos de contraseña: 8-20 chars, mayúscula, número, especial (!@#$%^&*)
   */
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

  /**
   * Procesa el envío del formulario de edición.
   *
   * @example
   * // En el template:
   * // <form (ngSubmit)="onSubmit()">
   *
   * @usageNotes
   * - Valida formulario completo antes de enviar
   * - Actualiza perfil via AuthService
   * - Redirige a /profile después de 1.5s en éxito
   * - Limpia campos de contraseña después de actualizar
   */
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

  /**
   * Cancela la edición y regresa al perfil.
   *
   * @example
   * // <button (click)="onCancel()">Cancelar</button>
   */
  onCancel(): void {
    this.router.navigate(['/profile']);
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
    const field = this.editProfileForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Obtiene el mensaje de error para un campo específico.
   *
   * @example
   * // <span>{{ getFieldError('nombre') }}</span>
   * // Retorna: "Mínimo 3 caracteres"
   *
   * @param fieldName - Nombre del campo
   * @returns Mensaje de error traducido o string vacío
   */
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

  /**
   * Verifica si hay errores de validación de contraseña a nivel de grupo.
   *
   * @example
   * // <div *ngIf="hasPasswordErrors()">{{ getPasswordError() }}</div>
   *
   * @returns true si hay algún error de contraseña
   */
  hasPasswordErrors(): boolean {
    return (
      this.editProfileForm.hasError('passwordStrength') ||
      this.editProfileForm.hasError('passwordMismatch') ||
      this.editProfileForm.hasError('currentPasswordRequired') ||
      this.editProfileForm.hasError('incorrectPassword')
    );
  }

  /**
   * Obtiene el mensaje de error de validación de contraseña.
   *
   * @example
   * // <span class="error">{{ getPasswordError() }}</span>
   * // Retorna: "Las contraseñas no coinciden"
   *
   * @returns Mensaje de error traducido o string vacío
   */
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

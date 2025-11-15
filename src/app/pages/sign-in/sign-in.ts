import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-sign-in',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  signInForm!: FormGroup;
  errorMessage = '';
  isLoading = false;
  rememberMe = false;

  ngOnInit(): void {
    // Si ya está autenticado, redirigir al perfil
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/profile']);
      return;
    }

    this.initForm();
    this.loadRememberedUser();
  }

  private initForm(): void {
    this.signInForm = this.fb.group({
      emailUsuario: ['', [Validators.required]],
      password: ['', [Validators.required]],
      recordarme: [false],
    });
  }

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

  // Helpers para el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.signInForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}

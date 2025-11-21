import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, UrlTree } from '@angular/router';
import { SignUp } from './sign-up';
import { AuthService } from '../../services/auth';
import { of } from 'rxjs';

describe('SignUp - Formulario de Registro', () => {
  let component: SignUp;
  let fixture: ComponentFixture<SignUp>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register', 'isAuthenticated']);
    const routerSpy = jasmine.createSpyObj(
      'Router',
      ['navigate', 'createUrlTree', 'serializeUrl'],
      {
        events: of({}),
      }
    );
    routerSpy.createUrlTree.and.returnValue({} as UrlTree);
    routerSpy.serializeUrl.and.returnValue('');

    const activatedRouteMock = {
      params: of({}),
      snapshot: { params: {} },
    };

    await TestBed.configureTestingModule({
      imports: [SignUp, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUp);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;

    authService.isAuthenticated.and.returnValue(false);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('debe verificar que el formulario es válido con datos correctos y llamar a authService.register', () => {
    component.signUpForm.patchValue({
      nombre: 'Juan Pérez',
      usuario: 'juanperez',
      email: 'juan@email.com',
      fechaNacimiento: '2000-01-01',
      password: 'Contraseña123!',
      confirmarPassword: 'Contraseña123!',
      comentarios: 'Test',
    });

    expect(component.signUpForm.valid).toBeTruthy();

    authService.register.and.returnValue({
      success: true,
      message: 'Usuario registrado exitosamente',
    });

    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      nombre: 'Juan Pérez',
      usuario: 'juanperez',
      email: 'juan@email.com',
      fechaNacimiento: '2000-01-01',
      password: 'Contraseña123!',
      direccionDespacho: '',
      comentarios: 'Test',
    });
  });

  it('debe invalidar el formulario cuando los campos requeridos están vacíos', () => {
    // Verificar que el formulario está vacío inicialmente
    expect(component.signUpForm.valid).toBeFalsy();

    // Verificar que todos los campos requeridos están inválidos
    expect(component.signUpForm.get('nombre')?.valid).toBeFalsy();
    expect(component.signUpForm.get('usuario')?.valid).toBeFalsy();
    expect(component.signUpForm.get('email')?.valid).toBeFalsy();
    expect(component.signUpForm.get('fechaNacimiento')?.valid).toBeFalsy();
    expect(component.signUpForm.get('password')?.valid).toBeFalsy();
    expect(component.signUpForm.get('confirmarPassword')?.valid).toBeFalsy();

    // Verificar que el campo direccionDespacho es opcional (válido aunque esté vacío)
    expect(component.signUpForm.get('direccionDespacho')?.valid).toBeTruthy();

    // Verificar que comentarios es opcional
    expect(component.signUpForm.get('comentarios')?.valid).toBeTruthy();

    // Intentar enviar formulario inválido
    component.onSubmit();

    // Verificar que NO se llamó al servicio de registro
    expect(authService.register).not.toHaveBeenCalled();

    // Verificar que se muestra mensaje de error
    expect(component.errorMessage).toBe('Por favor, completa todos los campos correctamente.');
  });

  it('debe validar que la contraseña cumple con los requisitos (6-18 caracteres, mayúscula y número)', () => {
    const passwordControl = component.signUpForm.get('password');

    // Contraseña muy corta (menos de 6 caracteres)
    passwordControl?.setValue('Ab1');
    expect(passwordControl?.hasError('passwordStrength')).toBeTruthy();

    // Contraseña muy larga (más de 18 caracteres)
    passwordControl?.setValue('Abc1234567890123456');
    expect(passwordControl?.hasError('passwordStrength')).toBeTruthy();

    // Contraseña sin mayúscula
    passwordControl?.setValue('password123');
    expect(passwordControl?.hasError('passwordStrength')).toBeTruthy();

    // Contraseña sin número
    passwordControl?.setValue('Password');
    expect(passwordControl?.hasError('passwordStrength')).toBeTruthy();

    // Contraseña válida (6-18 caracteres, con mayúscula y número)
    passwordControl?.setValue('Pass123');
    expect(passwordControl?.hasError('passwordStrength')).toBeFalsy();

    // Otra contraseña válida
    passwordControl?.setValue('MiContraseña2024');
    expect(passwordControl?.hasError('passwordStrength')).toBeFalsy();
  });

  it('debe validar que las dos contraseñas coinciden', () => {
    component.signUpForm.patchValue({
      password: 'Password123',
      confirmarPassword: 'Password123',
    });

    expect(component.signUpForm.hasError('passwordMismatch')).toBeFalsy();

    // Cambiar confirmarPassword para que no coincida
    component.signUpForm.patchValue({
      confirmarPassword: 'DiferentePass123',
    });

    expect(component.signUpForm.hasError('passwordMismatch')).toBeTruthy();
  });

  it('debe validar que el usuario tiene al menos 13 años', () => {
    const fechaControl = component.signUpForm.get('fechaNacimiento');
    const hoy = new Date();

    // Usuario de 12 años (no válido)
    const fecha12 = new Date(hoy.getFullYear() - 12, hoy.getMonth(), hoy.getDate());
    fechaControl?.setValue(fecha12.toISOString().split('T')[0]);
    expect(fechaControl?.hasError('minAge')).toBeTruthy();

    // Usuario de 13 años (válido)
    const fecha13 = new Date(hoy.getFullYear() - 13, hoy.getMonth(), hoy.getDate());
    fechaControl?.setValue(fecha13.toISOString().split('T')[0]);
    expect(fechaControl?.hasError('minAge')).toBeFalsy();

    // Usuario de 25 años (válido)
    const fecha25 = new Date(hoy.getFullYear() - 25, hoy.getMonth(), hoy.getDate());
    fechaControl?.setValue(fecha25.toISOString().split('T')[0]);
    expect(fechaControl?.hasError('minAge')).toBeFalsy();
  });
});

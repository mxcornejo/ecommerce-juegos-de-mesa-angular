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
      comentarios: 'Test',
    });
  });
});

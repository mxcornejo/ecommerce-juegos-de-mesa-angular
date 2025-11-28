import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth';
import { RegisterData } from '../models/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUserData1: RegisterData = {
    nombre: 'Usuario Test',
    usuario: 'testuser1',
    email: 'test@correo.com',
    password: 'password123',
    fechaNacimiento: '1990-01-15',
    comentarios: 'Usuario de prueba',
  };

  const mockUserData2: RegisterData = {
    nombre: 'Usuario Test 2',
    usuario: 'testuser2',
    email: 'test2@correo.com',
    password: 'password456',
    fechaNacimiento: '1995-05-20',
    comentarios: 'Segundo usuario de prueba',
  };

  beforeEach(() => {
    localStorage.clear();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: Router, useValue: routerSpy },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Validación de correos duplicados en registro', () => {
    describe('Registro con email duplicado', () => {
      it('debería retornar false cuando se intenta registrar un correo que ya existe', () => {
        // Arrange
        const primerRegistro = service.register(mockUserData1);
        expect(primerRegistro.success).toBeTrue();
        expect(primerRegistro.user).toBeDefined();

        // Act
        const datosConEmailDuplicado: RegisterData = {
          nombre: 'Otro Usuario',
          usuario: 'otrousuario',
          email: 'test@correo.com',
          password: 'otrapassword',
          fechaNacimiento: '1985-03-10',
        };
        const segundoRegistro = service.register(datosConEmailDuplicado);

        // Assert
        expect(segundoRegistro.success).toBeFalse();
        expect(segundoRegistro.message).toBe('El email ya está registrado');
        expect(segundoRegistro.user).toBeUndefined();
      });

      it('debería detectar emails duplicados sin importar mayúsculas/minúsculas', () => {
        // Arrange
        service.register(mockUserData1);

        // Act
        const datosConEmailMayusculas: RegisterData = {
          nombre: 'Usuario Mayusculas',
          usuario: 'usermayus',
          email: 'TEST@CORREO.COM',
          password: 'password789',
          fechaNacimiento: '1992-07-25',
        };
        const resultado = service.register(datosConEmailMayusculas);

        // Assert
        expect(resultado.success).toBeFalse();
        expect(resultado.message).toBe('El email ya está registrado');
      });

      it('debería detectar emails duplicados con mayúsculas/minúsculas mezcladas', () => {
        // Arrange
        service.register(mockUserData1);

        // Act
        const datosConEmailMixto: RegisterData = {
          nombre: 'Usuario Mixto',
          usuario: 'usermixto',
          email: 'TeSt@CoRrEo.CoM',
          password: 'passwordmixto',
          fechaNacimiento: '1988-11-30',
        };
        const resultado = service.register(datosConEmailMixto);

        // Assert
        expect(resultado.success).toBeFalse();
        expect(resultado.message).toBe('El email ya está registrado');
      });

      it('NO debería crearse un nuevo usuario cuando el email está duplicado', () => {
        // Arrange
        service.register(mockUserData1);
        service.logout();

        // Act
        const datosConEmailDuplicado: RegisterData = {
          nombre: 'Intruso',
          usuario: 'intruso',
          email: 'test@correo.com',
          password: 'intrusopass',
          fechaNacimiento: '1995-01-01',
        };
        service.register(datosConEmailDuplicado);

        // Assert
        const usersJson = localStorage.getItem('ww_users');
        const users = usersJson ? JSON.parse(usersJson) : [];
        expect(users.length).toBe(1);
        expect(users[0].email).toBe('test@correo.com');
        expect(users[0].nombre).toBe('Usuario Test');
      });
    });

    describe('Registro con username duplicado', () => {
      it('debería retornar false cuando se intenta registrar un username que ya existe', () => {
        // Arrange
        service.register(mockUserData1);

        // Act
        const datosConUserDuplicado: RegisterData = {
          nombre: 'Otro Usuario',
          usuario: 'testuser1',
          email: 'otro@correo.com',
          password: 'otrapassword',
          fechaNacimiento: '1985-03-10',
        };
        const resultado = service.register(datosConUserDuplicado);

        // Assert
        expect(resultado.success).toBeFalse();
        expect(resultado.message).toBe('El nombre de usuario ya está en uso');
      });

      it('debería detectar usernames duplicados sin importar mayúsculas/minúsculas', () => {
        // Arrange
        service.register(mockUserData1);

        // Act
        const datosConUserMayusculas: RegisterData = {
          nombre: 'Usuario Mayus',
          usuario: 'TESTUSER1',
          email: 'nuevo@correo.com',
          password: 'password123',
          fechaNacimiento: '1990-01-01',
        };
        const resultado = service.register(datosConUserMayusculas);

        // Assert
        expect(resultado.success).toBeFalse();
        expect(resultado.message).toBe('El nombre de usuario ya está en uso');
      });
    });

    describe('Registro exitoso con datos únicos', () => {
      it('debería permitir registrar usuarios con emails diferentes', () => {
        // Arrange
        const primerRegistro = service.register(mockUserData1);
        expect(primerRegistro.success).toBeTrue();
        service.logout();

        // Act
        const segundoRegistro = service.register(mockUserData2);

        // Assert
        expect(segundoRegistro.success).toBeTrue();
        expect(segundoRegistro.user).toBeDefined();
        expect(segundoRegistro.user?.email).toBe('test2@correo.com');
      });

      it('debería tener dos usuarios registrados cuando los datos son únicos', () => {
        // Arrange
        service.register(mockUserData1);
        service.logout();

        // Act
        service.register(mockUserData2);

        // Assert
        const usersJson = localStorage.getItem('ww_users');
        const users = usersJson ? JSON.parse(usersJson) : [];
        expect(users.length).toBe(2);
      });
    });
  });

  describe('Validación de correos duplicados en actualización de perfil', () => {
    it('debería rechazar actualización si el nuevo email ya existe en otro usuario', () => {
      // Arrange
      service.register(mockUserData1);
      service.logout();
      service.register(mockUserData2);

      // Act
      const resultado = service.updateProfile({
        email: 'test@correo.com',
      });

      // Assert
      expect(resultado.success).toBeFalse();
      expect(resultado.message).toBe('El email ya está en uso');
    });

    it('debería permitir actualizar perfil sin cambiar el email', () => {
      // Arrange
      service.register(mockUserData1);

      // Act
      const resultado = service.updateProfile({
        nombre: 'Nombre Actualizado',
      });

      // Assert
      expect(resultado.success).toBeTrue();
      expect(service.currentUser()?.nombre).toBe('Nombre Actualizado');
    });

    it('debería permitir actualizar el email a uno que no existe', () => {
      // Arrange
      service.register(mockUserData1);

      // Act
      const resultado = service.updateProfile({
        email: 'nuevo.email@correo.com',
      });

      // Assert
      expect(resultado.success).toBeTrue();
      expect(service.currentUser()?.email).toBe('nuevo.email@correo.com');
    });
  });

  describe('Login de usuarios', () => {
    it('debería permitir login con email correcto', () => {
      // Arrange
      service.register(mockUserData1);
      service.logout();

      // Act
      const resultado = service.login({
        emailOrUsername: 'test@correo.com',
        password: 'password123',
      });

      // Assert
      expect(resultado.success).toBeTrue();
      expect(resultado.user?.email).toBe('test@correo.com');
    });

    it('debería permitir login con username correcto', () => {
      // Arrange
      service.register(mockUserData1);
      service.logout();

      // Act
      const resultado = service.login({
        emailOrUsername: 'testuser1',
        password: 'password123',
      });

      // Assert
      expect(resultado.success).toBeTrue();
      expect(resultado.user?.usuario).toBe('testuser1');
    });

    it('debería rechazar login con password incorrecta', () => {
      // Arrange
      service.register(mockUserData1);
      service.logout();

      // Act
      const resultado = service.login({
        emailOrUsername: 'test@correo.com',
        password: 'passwordIncorrecta',
      });

      // Assert
      expect(resultado.success).toBeFalse();
      expect(resultado.message).toBe('Credenciales incorrectas');
    });

    it('debería rechazar login con email que no existe', () => {
      // Arrange
      service.register(mockUserData1);
      service.logout();

      // Act
      const resultado = service.login({
        emailOrUsername: 'noexiste@correo.com',
        password: 'password123',
      });

      // Assert
      expect(resultado.success).toBeFalse();
      expect(resultado.message).toBe('Credenciales incorrectas');
    });
  });

  describe('Estado de autenticación', () => {
    it('debería estar autenticado después del registro', () => {
      // Arrange & Act
      service.register(mockUserData1);

      // Assert
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.currentUser()).not.toBeNull();
    });

    it('debería NO estar autenticado después del logout', () => {
      // Arrange
      service.register(mockUserData1);

      // Act
      service.logout();

      // Assert
      expect(service.isAuthenticated()).toBeFalse();
      expect(service.currentUser()).toBeNull();
    });

    it('debería estar autenticado después de login exitoso', () => {
      // Arrange
      service.register(mockUserData1);
      service.logout();

      // Act
      service.login({
        emailOrUsername: 'test@correo.com',
        password: 'password123',
      });

      // Assert
      expect(service.isAuthenticated()).toBeTrue();
    });
  });
});

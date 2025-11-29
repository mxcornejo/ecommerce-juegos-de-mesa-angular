import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { User, LoginCredentials, RegisterData } from '../models/user.interface';

/**
 * Servicio de autenticación y gestión de usuarios.
 * Maneja registro, login, recuperación de contraseña y administración.
 *
 * @example
 * // Inyectar el servicio
 * private authService = inject(AuthService);
 *
 * // Verificar autenticación
 * if (this.authService.isAuthenticated()) { ... }
 *
 * @usageNotes
 * - Usa signals para reactividad (currentUser, isAuthenticated)
 * - Almacena datos en localStorage (solo en browser, compatible SSR)
 * - Incluye funcionalidades de admin con credenciales separadas
 * - Claves localStorage: ww_users, ww_current_user, ww_admin_session
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /** Clave localStorage para lista de usuarios */
  private readonly USERS_KEY = 'ww_users';

  /** Clave localStorage para usuario actual */
  private readonly CURRENT_USER_KEY = 'ww_current_user';

  /** Clave localStorage para sesión admin */
  private readonly ADMIN_KEY = 'ww_admin_session';

  /** Credenciales de administrador (hardcoded para demo) */
  private readonly ADMIN_CREDENTIALS = { usuario: 'admin', password: '1234' };

  /** Router para navegación */
  private router = inject(Router);

  /** ID de plataforma para detección SSR */
  private platformId = inject(PLATFORM_ID);

  /** Indica si se ejecuta en navegador */
  private isBrowser = isPlatformBrowser(this.platformId);

  /** Signal interno del usuario actual */
  private currentUserSignal = signal<User | null>(null);

  /** Signal interno del estado de admin */
  private adminAuthenticatedSignal = signal<boolean>(false);

  /**
   * Computed que indica si hay usuario autenticado.
   *
   * @example
   * if (this.authService.isAuthenticated()) {
   *   // Usuario logueado
   * }
   */
  isAuthenticated = computed(() => this.currentUserSignal() !== null);

  /**
   * Signal de solo lectura del usuario actual.
   *
   * @example
   * const user = this.authService.currentUser();
   */
  currentUser = this.currentUserSignal.asReadonly();

  /**
   * Signal de solo lectura del estado de admin.
   *
   * @example
   * const isAdmin = this.authService.isAdminAuth();
   */
  isAdminAuth = this.adminAuthenticatedSignal.asReadonly();

  /**
   * Constructor que carga sesiones desde localStorage.
   *
   * @usageNotes
   * Solo carga datos si está en navegador (no SSR)
   */
  constructor() {
    // Cargar usuario actual al iniciar (solo en el navegador)
    if (this.isBrowser) {
      this.loadCurrentUser();
      this.loadAdminSession();
    }
  }

  /**
   * Carga el usuario actual desde localStorage.
   *
   * @usageNotes
   * Se ejecuta en constructor si está en browser
   */
  private loadCurrentUser(): void {
    if (!this.isBrowser) return;

    const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        this.currentUserSignal.set(user);
      } catch (error) {
        console.error('Error parsing current user:', error);
        localStorage.removeItem(this.CURRENT_USER_KEY);
      }
    }
  }

  /**
   * Obtiene todos los usuarios registrados desde localStorage.
   *
   * @returns Array de usuarios o array vacío si no hay/error
   */
  private getAllUsers(): User[] {
    if (!this.isBrowser) return [];

    const usersJson = localStorage.getItem(this.USERS_KEY);
    if (!usersJson) return [];

    try {
      return JSON.parse(usersJson);
    } catch (error) {
      console.error('Error parsing users:', error);
      return [];
    }
  }

  /**
   * Guarda la lista de usuarios en localStorage.
   *
   * @param users - Array de usuarios a guardar
   */
  private saveAllUsers(users: User[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  /**
   * Registra un nuevo usuario en el sistema.
   *
   * @example
   * const result = this.authService.register({
   *   nombre: 'Juan',
   *   usuario: 'juan123',
   *   email: 'juan@email.com',
   *   password: 'Pass123',
   *   fechaNacimiento: '1990-01-15'
   * });
   *
   * @param data - Datos de registro del usuario
   * @returns Objeto con success, message y user opcional
   *
   * @usageNotes
   * - Valida email y usuario únicos
   * - Auto-login después del registro exitoso
   */
  register(data: RegisterData): { success: boolean; message: string; user?: User } {
    const users = this.getAllUsers();

    // Validar que el email no exista
    if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { success: false, message: 'El email ya está registrado' };
    }

    // Validar que el usuario no exista
    if (users.some((u) => u.usuario.toLowerCase() === data.usuario.toLowerCase())) {
      return { success: false, message: 'El nombre de usuario ya está en uso' };
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: this.generateUserId(),
      nombre: data.nombre,
      usuario: data.usuario,
      email: data.email,
      password: data.password, // En producción, esto debería estar hasheado
      fechaNacimiento: data.fechaNacimiento,
      comentarios: data.comentarios,
      fechaRegistro: new Date().toISOString(),
    };

    // Guardar usuario
    users.push(newUser);
    this.saveAllUsers(users);

    // Auto-login después del registro
    this.setCurrentUser(newUser);

    return { success: true, message: 'Usuario registrado exitosamente', user: newUser };
  }

  /**
   * Inicia sesión con email/usuario y contraseña.
   *
   * @example
   * const result = this.authService.login({
   *   emailOrUsername: 'juan@email.com',
   *   password: 'Pass123'
   * });
   *
   * @param credentials - Credenciales de login
   * @returns Objeto con success, message y user opcional
   */
  login(credentials: LoginCredentials): { success: boolean; message: string; user?: User } {
    const users = this.getAllUsers();
    const { emailOrUsername, password } = credentials;

    // Buscar usuario por email o username
    const user = users.find(
      (u) =>
        (u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
          u.usuario.toLowerCase() === emailOrUsername.toLowerCase()) &&
        u.password === password
    );

    if (!user) {
      return { success: false, message: 'Credenciales incorrectas' };
    }

    this.setCurrentUser(user);
    return { success: true, message: 'Inicio de sesión exitoso', user };
  }

  /**
   * Cierra la sesión del usuario actual.
   *
   * @example
   * this.authService.logout();
   * // Redirige a /sign-in
   *
   * @usageNotes
   * Limpia localStorage y redirige a sign-in
   */
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
    this.currentUserSignal.set(null);
    this.router.navigate(['/sign-in']);
  }

  /**
   * Actualiza el perfil del usuario actual.
   *
   * @example
   * const result = this.authService.updateProfile({
   *   nombre: 'Juan Pérez',
   *   email: 'nuevo@email.com'
   * });
   *
   * @param updatedData - Datos parciales a actualizar
   * @returns Objeto con success y message
   *
   * @usageNotes
   * - Valida unicidad de email y usuario si cambian
   * - Mantiene id y fechaRegistro originales
   */
  updateProfile(updatedData: Partial<User>): { success: boolean; message: string } {
    const currentUser = this.currentUserSignal();
    if (!currentUser) {
      return { success: false, message: 'No hay sesión activa' };
    }

    const users = this.getAllUsers();
    const userIndex = users.findIndex((u) => u.id === currentUser.id);

    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Validar email único (si cambió)
    if (updatedData.email && updatedData.email !== currentUser.email) {
      const emailLower = updatedData.email.toLowerCase();
      if (users.some((u) => u.id !== currentUser.id && u.email.toLowerCase() === emailLower)) {
        return { success: false, message: 'El email ya está en uso' };
      }
    }

    // Validar usuario único (si cambió)
    if (updatedData.usuario && updatedData.usuario !== currentUser.usuario) {
      const usuarioLower = updatedData.usuario.toLowerCase();
      if (users.some((u) => u.id !== currentUser.id && u.usuario.toLowerCase() === usuarioLower)) {
        return { success: false, message: 'El nombre de usuario ya está en uso' };
      }
    }

    // Actualizar usuario
    const updatedUser: User = {
      ...currentUser,
      ...updatedData,
      id: currentUser.id, // Mantener el ID original
      fechaRegistro: currentUser.fechaRegistro, // Mantener fecha de registro
      password: updatedData.password || currentUser.password, // Solo actualizar si se proporciona nueva contraseña
    };

    users[userIndex] = updatedUser;
    this.saveAllUsers(users);
    this.setCurrentUser(updatedUser);

    return { success: true, message: 'Perfil actualizado exitosamente' };
  }

  /**
   * Establece el usuario actual en signal y localStorage.
   *
   * @param user - Usuario a establecer como actual
   */
  private setCurrentUser(user: User): void {
    // Actualizar el signal siempre (tanto en browser como en SSR)
    this.currentUserSignal.set(user);

    // Guardar en localStorage solo en el navegador
    if (this.isBrowser) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Genera un ID único para el usuario.
   *
   * @example
   * // Retorna: "user_1732800000000_abc123xyz"
   *
   * @returns ID único con timestamp y string aleatorio
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calcula la edad a partir de fecha de nacimiento.
   *
   * @example
   * const edad = this.authService.calculateAge('1990-05-15');
   * // Retorna: 35
   *
   * @param fechaNacimiento - Fecha en formato ISO
   * @returns Edad en años
   */
  calculateAge(fechaNacimiento: string): number {
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Formatea una fecha ISO a formato legible en español.
   *
   * @example
   * const fecha = this.authService.formatDate('2024-01-15T10:30:00');
   * // Retorna: "15 de enero de 2024"
   *
   * @param isoDate - Fecha en formato ISO
   * @returns Fecha formateada en español
   */
  formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Verifica si existe un usuario con el email proporcionado.
   *
   * @param email - Email a verificar
   * @returns Objeto con exists y message
   */
  checkEmailExists(email: string): { exists: boolean; message: string } {
    const users = this.getAllUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      return { exists: true, message: 'Email encontrado' };
    }
    return { exists: false, message: 'No existe una cuenta con este email' };
  }

  /**
   * Genera un código de verificación de 6 dígitos.
   *
   * @example
   * const code = this.authService.generateVerificationCode();
   * // Retorna: "847293"
   *
   * @returns Código numérico de 6 dígitos como string
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Simula envío de código de verificación para recuperación.
   *
   * @example
   * const result = this.authService.sendVerificationCode('user@email.com');
   * // En dev retorna el código para testing
   *
   * @param email - Email del usuario
   * @returns Objeto con success, message y code (solo en dev)
   *
   * @usageNotes
   * - Guarda código en localStorage con expiración de 10 minutos
   * - En producción NO debería retornar el código
   */
  sendVerificationCode(email: string): { success: boolean; message: string; code?: string } {
    const result = this.checkEmailExists(email);

    if (!result.exists) {
      return { success: false, message: result.message };
    }

    const code = this.generateVerificationCode();

    // En producción, aquí se enviaría un email real
    // Por ahora, guardamos el código temporalmente en localStorage
    if (this.isBrowser) {
      const recoveryData = {
        email: email.toLowerCase(),
        code,
        timestamp: Date.now(),
        expires: Date.now() + 10 * 60 * 1000, // Expira en 10 minutos
      };
      localStorage.setItem('ww_recovery_code', JSON.stringify(recoveryData));
    }

    return {
      success: true,
      message: 'Código de verificación enviado',
      code, // En producción NO se devolvería el código
    };
  }

  /**
   * Verifica el código de recuperación de contraseña.
   *
   * @example
   * const result = this.authService.verifyRecoveryCode('user@email.com', '123456');
   *
   * @param email - Email del usuario
   * @param code - Código de 6 dígitos a verificar
   * @returns Objeto con success y message
   *
   * @usageNotes
   * - Verifica expiración del código (10 minutos)
   * - Limpia código expirado automáticamente
   */
  verifyRecoveryCode(email: string, code: string): { success: boolean; message: string } {
    if (!this.isBrowser) {
      return { success: false, message: 'Operación no disponible' };
    }

    const recoveryDataJson = localStorage.getItem('ww_recovery_code');
    if (!recoveryDataJson) {
      return { success: false, message: 'No hay código de recuperación activo' };
    }

    try {
      const recoveryData = JSON.parse(recoveryDataJson);

      // Verificar si el código expiró
      if (Date.now() > recoveryData.expires) {
        localStorage.removeItem('ww_recovery_code');
        return { success: false, message: 'El código ha expirado. Solicita uno nuevo' };
      }

      // Verificar email y código
      if (recoveryData.email.toLowerCase() === email.toLowerCase() && recoveryData.code === code) {
        return { success: true, message: 'Código verificado correctamente' };
      }

      return { success: false, message: 'Código incorrecto' };
    } catch {
      return { success: false, message: 'Error al verificar el código' };
    }
  }

  /**
   * Restablece la contraseña del usuario.
   *
   * @example
   * const result = this.authService.resetPassword(
   *   'user@email.com',
   *   '123456',
   *   'NuevaPass123!'
   * );
   *
   * @param email - Email del usuario
   * @param code - Código de verificación
   * @param newPassword - Nueva contraseña
   * @returns Objeto con success y message
   *
   * @usageNotes
   * Verifica código antes de actualizar y limpia código usado
   */
  resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): { success: boolean; message: string } {
    // Verificar el código primero
    const codeVerification = this.verifyRecoveryCode(email, code);
    if (!codeVerification.success) {
      return codeVerification;
    }

    const users = this.getAllUsers();
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    // Actualizar contraseña
    users[userIndex].password = newPassword;
    this.saveAllUsers(users);

    // Limpiar código de recuperación
    if (this.isBrowser) {
      localStorage.removeItem('ww_recovery_code');
    }

    return { success: true, message: 'Contraseña restablecida exitosamente' };
  }

  // ============ MÉTODOS DE ADMINISTRADOR ============

  /**
   * Carga la sesión de admin desde localStorage.
   *
   * @usageNotes
   * Se ejecuta en constructor si está en browser
   */
  private loadAdminSession(): void {
    if (!this.isBrowser) return;

    const adminSession = localStorage.getItem(this.ADMIN_KEY);
    if (adminSession === 'true') {
      this.adminAuthenticatedSignal.set(true);
    }
  }

  /**
   * Inicia sesión como administrador.
   *
   * @example
   * const result = this.authService.adminLogin('admin', '1234');
   *
   * @param usuario - Nombre de usuario admin
   * @param password - Contraseña admin
   * @returns Objeto con success y message
   */
  adminLogin(usuario: string, password: string): { success: boolean; message: string } {
    if (
      usuario === this.ADMIN_CREDENTIALS.usuario &&
      password === this.ADMIN_CREDENTIALS.password
    ) {
      this.adminAuthenticatedSignal.set(true);
      if (this.isBrowser) {
        localStorage.setItem(this.ADMIN_KEY, 'true');
      }
      return { success: true, message: 'Acceso de administrador concedido' };
    }
    return { success: false, message: 'Credenciales de administrador incorrectas' };
  }

  /**
   * Cierra sesión de administrador.
   *
   * @example
   * this.authService.adminLogout();
   * // Redirige a /admin-login
   */
  adminLogout(): void {
    this.adminAuthenticatedSignal.set(false);
    if (this.isBrowser) {
      localStorage.removeItem(this.ADMIN_KEY);
    }
    this.router.navigate(['/admin-login']);
  }

  /**
   * Verifica si el admin está autenticado.
   *
   * @returns true si hay sesión admin activa
   */
  isAdminAuthenticated(): boolean {
    return this.adminAuthenticatedSignal();
  }

  /**
   * Obtiene todos los usuarios registrados (solo admin).
   *
   * @example
   * const users = this.authService.getRegisteredUsers();
   *
   * @returns Array de usuarios o vacío si no es admin
   */
  getRegisteredUsers(): User[] {
    if (!this.isAdminAuthenticated()) {
      return [];
    }
    return this.getAllUsers();
  }

  /**
   * Elimina un usuario por ID (solo admin).
   *
   * @example
   * const result = this.authService.deleteUser('user_123456_abc');
   *
   * @param userId - ID del usuario a eliminar
   * @returns Objeto con success y message
   */
  deleteUser(userId: string): { success: boolean; message: string } {
    if (!this.isAdminAuthenticated()) {
      return { success: false, message: 'No tienes permisos para esta acción' };
    }

    const users = this.getAllUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return { success: false, message: 'Usuario no encontrado' };
    }

    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    this.saveAllUsers(users);

    return { success: true, message: `Usuario ${deletedUser.nombre} eliminado exitosamente` };
  }

  /**
   * Obtiene estadísticas de usuarios (solo admin).
   *
   * @example
   * const stats = this.authService.getUserStats();
   * // { total: 10, todayRegistrations: 2 }
   *
   * @returns Objeto con total de usuarios y registros de hoy
   */
  getUserStats(): { total: number; todayRegistrations: number } {
    if (!this.isAdminAuthenticated()) {
      return { total: 0, todayRegistrations: 0 };
    }

    const users = this.getAllUsers();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRegistrations = users.filter((u) => {
      const userDate = new Date(u.fechaRegistro);
      userDate.setHours(0, 0, 0, 0);
      return userDate.getTime() === today.getTime();
    }).length;

    return {
      total: users.length,
      todayRegistrations,
    };
  }
}

import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { User, LoginCredentials, RegisterData } from '../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly USERS_KEY = 'ww_users';
  private readonly CURRENT_USER_KEY = 'ww_current_user';
  private readonly ADMIN_KEY = 'ww_admin_session';
  private readonly ADMIN_CREDENTIALS = { usuario: 'admin', password: '1234' };

  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Signals para reactividad
  private currentUserSignal = signal<User | null>(null);
  private adminAuthenticatedSignal = signal<boolean>(false);

  // Computed para saber si está autenticado
  isAuthenticated = computed(() => this.currentUserSignal() !== null);

  // Getter público del usuario actual
  currentUser = this.currentUserSignal.asReadonly();

  // Getter público del estado de admin
  isAdminAuth = this.adminAuthenticatedSignal.asReadonly();

  constructor() {
    // Cargar usuario actual al iniciar (solo en el navegador)
    if (this.isBrowser) {
      this.loadCurrentUser();
      this.loadAdminSession();
    }
  }

  /**
   * Carga el usuario actual desde localStorage
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
   * Obtiene todos los usuarios registrados
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
   * Guarda todos los usuarios en localStorage
   */
  private saveAllUsers(users: User[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  /**
   * Registra un nuevo usuario
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
   * Inicia sesión
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
   * Cierra sesión
   */
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
    this.currentUserSignal.set(null);
    this.router.navigate(['/sign-in']);
  }

  /**
   * Actualiza el perfil del usuario actual
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
   * Establece el usuario actual
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
   * Genera un ID único para el usuario
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Calcula la edad basándose en la fecha de nacimiento
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
   * Formatea una fecha ISO a formato legible
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
   * Verifica si existe un usuario con el email proporcionado
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
   * Genera un código de verificación de 6 dígitos
   */
  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Simula el envío de un código de verificación (en producción enviaría un email real)
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
   * Verifica el código de recuperación
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
   * Restablece la contraseña del usuario
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
   * Carga la sesión de admin desde localStorage
   */
  private loadAdminSession(): void {
    if (!this.isBrowser) return;

    const adminSession = localStorage.getItem(this.ADMIN_KEY);
    if (adminSession === 'true') {
      this.adminAuthenticatedSignal.set(true);
    }
  }

  /**
   * Inicia sesión como administrador
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
   * Cierra sesión de administrador
   */
  adminLogout(): void {
    this.adminAuthenticatedSignal.set(false);
    if (this.isBrowser) {
      localStorage.removeItem(this.ADMIN_KEY);
    }
    this.router.navigate(['/admin-login']);
  }

  /**
   * Verifica si el admin está autenticado
   */
  isAdminAuthenticated(): boolean {
    return this.adminAuthenticatedSignal();
  }

  /**
   * Obtiene todos los usuarios registrados (solo para admin)
   */
  getRegisteredUsers(): User[] {
    if (!this.isAdminAuthenticated()) {
      return [];
    }
    return this.getAllUsers();
  }

  /**
   * Elimina un usuario por ID (solo para admin)
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
   * Obtiene estadísticas de usuarios (solo para admin)
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

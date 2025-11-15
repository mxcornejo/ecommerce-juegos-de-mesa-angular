export interface User {
  id: string;
  nombre: string;
  usuario: string;
  email: string;
  password: string;
  fechaNacimiento: string;
  comentarios?: string;
  fechaRegistro: string;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export interface RegisterData {
  nombre: string;
  usuario: string;
  email: string;
  password: string;
  fechaNacimiento: string;
  comentarios?: string;
}

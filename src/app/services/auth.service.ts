import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService, ApiResponse } from './api.service';

export interface Usuario {
  id: number;
  username: string;
  nombre: string;
  apellidopaterno: string;
  apellidomaterno: string;
  correo: string;
  telefono: string;
  rol: 'cliente' | 'barbero' | 'secretaria' | 'administrador';
  activo: boolean;
  fecha_registro: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: Usuario | null;
  token: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadAuthState();
  }

  /**
   * Cargar estado de autenticación desde localStorage
   */
  private loadAuthState(): void {
    try {
      const savedState = localStorage.getItem('auth_state');
      if (savedState) {
        const state = JSON.parse(savedState);
        this.authStateSubject.next(state);
      }
    } catch (error) {
      console.error('Error cargando estado de autenticación:', error);
      this.clearAuthState();
    }
  }

  /**
   * Guardar estado de autenticación en localStorage
   */
  private saveAuthState(state: AuthState): void {
    try {
      localStorage.setItem('auth_state', JSON.stringify(state));
      this.authStateSubject.next(state);
    } catch (error) {
      console.error('Error guardando estado de autenticación:', error);
    }
  }

  /**
   * Limpiar estado de autenticación
   */
  private clearAuthState(): void {
    localStorage.removeItem('auth_state');
    this.authStateSubject.next({
      isAuthenticated: false,
      user: null,
      token: null
    });
  }

  // ================================
  // MÉTODOS PÚBLICOS
  // ================================

  /**
   * Registrar nuevo usuario
   */
  register(userData: {
    nombre: string;
    apellidopaterno: string;
    apellidomaterno: string;
    username: string;
    correo: string;
    contrasena: string;
    telefono: string;
    preguntasecreta: string;
    respuestasecreta: string;
  }): Observable<ApiResponse> {
    return this.apiService.register(userData);
  }

  /**
   * Verificar código 2FA de registro
   */
  verifyRegistration2FA(tempToken: string, codigo: string): Observable<ApiResponse> {
    return this.apiService.verifyRegistration2FA(tempToken, codigo).pipe(
      tap(response => {
        if (response.ok && response.data) {
          this.handleAuthSuccess(response.data);
        }
      })
    );
  }

  /**
   * Iniciar sesión
   */
  login(email: string, password: string): Observable<ApiResponse> {
    return this.apiService.login(email, password);
  }

  /**
   * Verificar código 2FA de login
   */
  verifyLogin2FA(tempToken: string, codigo: string): Observable<ApiResponse> {
    return this.apiService.verifyLogin2FA(tempToken, codigo).pipe(
      tap(response => {
        if (response.ok && response.data) {
          this.handleAuthSuccess(response.data);
        }
      })
    );
  }

  /**
   * Login con Google
   */
  googleLogin(idToken: string): Observable<ApiResponse> {
    return this.apiService.googleLogin(idToken).pipe(
      tap(response => {
        if (response.ok && response.data) {
          this.handleAuthSuccess(response.data);
        }
      })
    );
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.clearAuthState();
    // Opcional: llamar endpoint de logout en el backend
    // this.apiService.post('/api/usuarios/logout/', {}).subscribe();
  }

  /**
   * Manejar respuesta exitosa de autenticación
   */
  private handleAuthSuccess(data: any): void {
    const authState: AuthState = {
      isAuthenticated: true,
      user: data.usuario || data.user,
      token: data.token || data.access_token
    };
    this.saveAuthState(authState);
  }

  // ================================
  // GETTERS
  // ================================

  /**
   * Verificar si el usuario está autenticado
   */
  get isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Obtener usuario actual
   */
  get currentUser(): Usuario | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Obtener token actual
   */
  get currentToken(): string | null {
    return this.authStateSubject.value.token;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.currentUser;
    return user ? user.rol === role : false;
  }

  /**
   * Verificar si es administrador
   */
  get isAdmin(): boolean {
    return this.hasRole('administrador');
  }

  /**
   * Verificar si es secretaria
   */
  get isSecretary(): boolean {
    return this.hasRole('secretaria');
  }

  /**
   * Verificar si es barbero
   */
  get isBarber(): boolean {
    return this.hasRole('barbero');
  }

  /**
   * Verificar si es cliente
   */
  get isClient(): boolean {
    return this.hasRole('cliente');
  }

  /**
   * Verificar si puede acceder a funciones administrativas
   */
  get canAccessAdmin(): boolean {
    return this.isAdmin || this.isSecretary;
  }

  // ================================
  // OBSERVABLES
  // ================================

  /**
   * Observable para verificar si está autenticado
   */
  get isAuthenticated$(): Observable<boolean> {
    return this.authState$.pipe(map(state => state.isAuthenticated));
  }

  /**
   * Observable para obtener el usuario actual
   */
  get currentUser$(): Observable<Usuario | null> {
    return this.authState$.pipe(map(state => state.user));
  }

  /**
   * Observable para verificar rol de administrador
   */
  get isAdmin$(): Observable<boolean> {
    return this.authState$.pipe(
      map(state => state.user?.rol === 'administrador' || false)
    );
  }

  /**
   * Observable para verificar acceso administrativo
   */
  get canAccessAdmin$(): Observable<boolean> {
    return this.authState$.pipe(
      map(state => {
        const rol = state.user?.rol;
        return rol === 'administrador' || rol === 'secretaria';
      })
    );
  }
}

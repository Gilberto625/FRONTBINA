import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  fecha_nacimiento?: string;
  foto_perfil?: string;
  rol: 'cliente' | 'secretaria' | 'barbero' | 'administrador';
  is_active: boolean;
  date_joined: string;
  totp_enabled?: boolean;
  backup_codes_generated?: boolean;
  // Campos adicionales según el rol
  empleado?: {
    id: number;
    especialidades?: string[];
    horario_inicio?: string;
    horario_fin?: string;
    dias_trabajo?: string[];
    activo: boolean;
  };
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
  requires_2fa?: boolean;
  message?: string;
  ok?: boolean;
}

export interface RegisterData {
  email: string;
  nombre: string;
  apellido: string;
  password: string;
  telefono?: string;
  fecha_nacimiento?: string;
  // Campos adicionales para compatibilidad
  apellidopaterno?: string;
  apellidomaterno?: string;
  username?: string;
  correo?: string;
  contrasena?: string;
  preguntasecreta?: string;
  respuestasecreta?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Usuario {
  id?: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  rol?: string;
  username?: string;
}

export interface EstadoSeguridad {
  totp_enabled: boolean;
  totp_habilitado: boolean;
  backup_codes_generated: boolean;
  codigos_respaldo_disponibles: number;
  last_login?: string;
  email_2fa?: boolean;
  tiene_preguntas_seguridad?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Cargar usuario desde localStorage al inicializar
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userData = localStorage.getItem('user_data');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
        this.logout();
      }
    }
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Auth Error:', error);
    let errorMessage = 'Ha ocurrido un error inesperado';
    
    if (error.error) {
      if (typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error.message) {
        errorMessage = error.error.message;
      } else if (error.error.error) {
        errorMessage = error.error.error;
      } else if (error.error.detail) {
        errorMessage = error.error.detail;
      }
    }

    return throwError(() => errorMessage);
  }

  // ===== AUTENTICACIÓN BÁSICA =====

  login(emailOrData: string | LoginData, password?: string): Observable<LoginResponse> {
    const email = typeof emailOrData === 'string' ? emailOrData : emailOrData.email;
    const pass = typeof emailOrData === 'string' ? password! : emailOrData.password;
    return this.http.post<LoginResponse>(`${this.apiUrl}/usuarios/login/`, {
      correo: email,
      contrasena: pass
    }).pipe(
      tap(response => {
        if (response.access && !response.requires_2fa) {
          this.setTokens(response.access, response.refresh);
          this.setCurrentUser(response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  register(userData: RegisterData): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/register/`, userData).pipe(
      catchError(this.handleError)
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  redirectToLogin(returnUrl?: string): void {
    const url = returnUrl || this.router.url;
    this.router.navigate(['/login'], { queryParams: { returnUrl: url } });
  }

  // ===== 2FA =====

  verify2FA(email: string, code: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/usuarios/verify-2fa/`, {
      email,
      code
    }).pipe(
      tap(response => {
        if (response.access) {
          this.setTokens(response.access, response.refresh);
          this.setCurrentUser(response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  setupTOTP(): Observable<{ qr_code: string; secret: string }> {
    return this.http.post<{ qr_code: string; secret: string }>(`${this.apiUrl}/usuarios/setup-totp/`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  confirmTOTP(code: string): Observable<{ backup_codes: string[] }> {
    return this.http.post<{ backup_codes: string[] }>(`${this.apiUrl}/usuarios/confirm-totp/`, {
      code
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  disableTOTP(password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/disable-totp/`, {
      password
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  generateBackupCodes(): Observable<{ backup_codes: string[] }> {
    return this.http.post<{ backup_codes: string[] }>(`${this.apiUrl}/usuarios/generate-backup-codes/`, {}, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ===== RECUPERACIÓN DE CONTRASEÑA =====

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/recuperar-otp/`, {
      email
    }).pipe(
      catchError(this.handleError)
    );
  }

  verifyOTPReset(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/verificar-otp-recuperacion/`, {
      email,
      otp
    }).pipe(
      catchError(this.handleError)
    );
  }

  resendOTPReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/reenviar-otp-recuperacion/`, {
      email
    }).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/actualizar-contrasena-otp/`, {
      email,
      otp,
      nueva_contrasena: newPassword
    }).pipe(
      catchError(this.handleError)
    );
  }

  // ===== PERFIL DE USUARIO =====

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/usuarios/profile/`, {
      headers: this.getHeaders()
    }).pipe(
      tap(user => this.setCurrentUser(user)),
      catchError(this.handleError)
    );
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/usuarios/profile/update/`, userData, {
      headers: this.getHeaders()
    }).pipe(
      tap(user => this.setCurrentUser(user)),
      catchError(this.handleError)
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/change-password/`, {
      current_password: currentPassword,
      new_password: newPassword
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  uploadProfilePhoto(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('foto_perfil', file);

    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<User>(`${this.apiUrl}/usuarios/upload-photo/`, formData, {
      headers
    }).pipe(
      tap(user => this.setCurrentUser(user)),
      catchError(this.handleError)
    );
  }

  // ===== ROLES Y PERMISOS =====

  hasRole(role: string): boolean {
    const user = this.getCurrentUserValue();
    return user?.rol === role;
  }

  isCliente(): boolean {
    return this.hasRole('cliente');
  }

  isSecretaria(): boolean {
    return this.hasRole('secretaria');
  }

  isBarbero(): boolean {
    return this.hasRole('barbero');
  }

  isAdministrador(): boolean {
    return this.hasRole('administrador');
  }

  canAccessAdmin(): boolean {
    return this.isAdministrador() || this.isSecretaria();
  }

  canManageProducts(): boolean {
    return this.isAdministrador() || this.isSecretaria();
  }

  canManageAppointments(): boolean {
    return this.isAdministrador() || this.isSecretaria() || this.isBarbero();
  }

  // ===== UTILIDADES =====

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getAccessToken(): string | null {
    return this.getToken();
  }

  verifyLogin2FA(token: string, code: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/usuarios/verify-login-2fa/`, {
      token,
      code
    }).pipe(
      tap(response => {
        if (response.access) {
          this.setTokens(response.access, response.refresh);
          this.setCurrentUser(response.user);
        }
      }),
      catchError(this.handleError)
    );
  }

  // Alias para compatibilidad
  getCsrfToken(): Observable<any> {
    return new Observable(observer => {
      observer.next(null);
      observer.complete();
    });
  }

  generarCodigosRespaldo(email: string): Observable<{ backup_codes: string[] }> {
    return this.generateBackupCodes();
  }

  cambiarContrasena(email: string, currentPassword: string, newPassword: string): Observable<any> {
    return this.changePassword(currentPassword, newPassword);
  }

  // Alias para recuperación de contraseña
  solicitarRecuperacionOTP(email: string): Observable<any> {
    return this.requestPasswordReset(email);
  }

  verificarOTPRecuperacion(email: string, otp: string): Observable<any> {
    return this.verifyOTPReset(email, otp);
  }

  reenviarOTPRecuperacion(email: string): Observable<any> {
    return this.resendOTPReset(email);
  }

  reenviarOTP(email: string): Observable<any> {
    return this.resendOTPReset(email);
  }

  loginWithGoogle(): Observable<any> {
    // Placeholder para login con Google
    return throwError(() => 'Google login no implementado');
  }

  configurarTOTP(email: string): Observable<{ qr_code: string; secret: string }> {
    return this.setupTOTP();
  }

  habilitarTOTP(email: string, code: string): Observable<any> {
    return this.confirmTOTP(code).pipe(
      map(response => ({ ok: true, ...response }))
    );
  }

  verificarOTPRegistro(token: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/usuarios/verify-registration-otp/`, {
      token,
      otp: codigo
    }).pipe(catchError(this.handleError.bind(this)));
  }

  actualizarContrasenaOTP(tokenOrEmail: string, passwordOrOtp: string, newPassword?: string): Observable<any> {
    if (newPassword) {
      return this.resetPassword(tokenOrEmail, passwordOrOtp, newPassword);
    }
    // Si solo hay 2 args, tokenOrEmail es el token y passwordOrOtp es el password
    return this.http.post(`${this.apiUrl}/usuarios/reset-password-token/`, {
      token: tokenOrEmail,
      nueva_contrasena: passwordOrOtp
    }).pipe(catchError(this.handleError.bind(this)));
  }

  restablecerContrasena(tokenOrEmail: string, passwordOrOtp: string, newPassword?: string): Observable<any> {
    if (newPassword) {
      return this.resetPassword(tokenOrEmail, passwordOrOtp, newPassword);
    }
    return this.http.post(`${this.apiUrl}/usuarios/reset-password-token/`, {
      token: tokenOrEmail,
      nueva_contrasena: passwordOrOtp
    }).pipe(catchError(this.handleError.bind(this)));
  }

  refreshToken(): Observable<{ access: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return throwError(() => 'No refresh token available');
    }

    return this.http.post<{ access: string }>(`${this.apiUrl}/usuarios/token/refresh/`, {
      refresh: refreshToken
    }).pipe(
      tap(response => {
        localStorage.setItem('access_token', response.access);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem('user_data', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  // ===== NAVEGACIÓN BASADA EN ROL =====

  redirectAfterLogin(): void {
    const user = this.getCurrentUserValue();
    if (!user) return;

    switch (user.rol) {
      case 'administrador':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'secretaria':
        this.router.navigate(['/secretaria/dashboard']);
        break;
      case 'barbero':
        this.router.navigate(['/barbero/dashboard']);
        break;
      case 'cliente':
      default:
        this.router.navigate(['/cliente/dashboard']);
        break;
    }
  }
}
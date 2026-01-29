import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth, GoogleAuthProvider, signInWithPopup, UserCredential } from '@angular/fire/auth';

export interface Usuario {
  id?: number;
  email: string;
  username: string;
  nombre?: string;
  apellido?: string;
  rol?: 'cliente' | 'admin';
}

export interface RegisterData {
  nombre: string;
  apellidopaterno: string;
  apellidomaterno: string;
  username: string;
  correo: string;
  contrasena: string;
  telefono: string;
  preguntasecreta: string;
  respuestasecreta: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface EstadoSeguridad {
  email_2fa: boolean;
  totp_habilitado: boolean;
  codigos_respaldo_disponibles: number;
  tiene_preguntas_seguridad: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private csrfToken: string = '';

  // BehaviorSubject para manejar el estado del usuario
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private auth: Auth
  ) {
    // Cargar usuario del localStorage si existe
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.isAuthenticatedSubject.next(true);
    }
  }

  /**
   * Obtener CSRF Token del backend Django
   */
  getCsrfToken(): Observable<any> {
    const url = `${this.apiUrl}/csrf/`;
    console.log('🔵 Obteniendo CSRF token de:', url);
    
    return this.http.get(url, { withCredentials: true })
      .pipe(
        tap((response: any) => {
          this.csrfToken = response.csrfToken;
          console.log('✅ CSRF token obtenido:', this.csrfToken ? 'OK' : 'VACÍO');
        })
      );
  }

  /**
   * Headers con CSRF token
   */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-CSRFToken': this.csrfToken
    });
  }

  /**
   * REGISTRO: Paso 1 - Registrar usuario y enviar código 2FA
   */
  register(data: RegisterData): Observable<any> {
    const url = `${this.apiUrl}/register/`;
    console.log('🔵 Registrando usuario en:', url);
    console.log('🔵 Datos enviados:', { ...data, contrasena: '***' });
    
    return this.http.post(
      url,
      data,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * REGISTRO: Paso 2 - Verificar código 2FA del registro
   */
  verifyRegister2FA(tempToken: string, codigo: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/register/2fa/verificar/`,
      { tempToken, codigo },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * LOGIN: Inicio de sesión directo (sin 2FA)
   */
  login(data: LoginData): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login/`,
      data,
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    ).pipe(
      tap((response: any) => {
        // Login directo sin 2FA - guardar usuario automáticamente
        if (response.ok && response.usuario) {
          this.setCurrentUser(response.usuario);
        }
      })
    );
  }

  /**
   * LOGIN: Paso 2 - Verificar código 2FA del login
   */
  verifyLogin2FA(tempToken: string, codigo: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login/2fa/verificar/`,
      { tempToken, codigo },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    ).pipe(
      tap((response: any) => {
        if (response.ok) {
          this.setCurrentUser(response.usuario);
        }
      })
    );
  }

  /**
   * LOGIN CON GOOGLE
   */
  async loginWithGoogle(): Promise<any> {
    try {
      // Verificar que el dominio esté autorizado (solo en producción)
      if (environment.production) {
        const currentDomain = window.location.hostname;
        console.log('Dominio actual:', currentDomain);
        
        // Verificar si es un dominio de Vercel
        if (!currentDomain.includes('vercel.app') && !currentDomain.includes('localhost')) {
          console.warn('Dominio no reconocido:', currentDomain);
        }
      }

      // Autenticar con Google usando Firebase
      const provider = new GoogleAuthProvider();
      
      // Forzar selector de cuenta: siempre mostrar opción de elegir cuenta o agregar cuenta
      // Incluso si solo hay una cuenta de Google
      provider.setCustomParameters({
        prompt: 'select_account'  // Fuerza mostrar selector de cuenta
      });
      
      const result: UserCredential = await signInWithPopup(this.auth, provider);

      // Obtener el ID token de Firebase
      const idToken = await result.user.getIdToken();

      // Enviar el token al backend Django
      return firstValueFrom(
        this.http.post(
          `${this.apiUrl}/login/google/`,
          { idToken },
          {
            headers: this.getHeaders(),
            withCredentials: true
          }
        ).pipe(
          tap((response: any) => {
            if (response.ok) {
              this.setCurrentUser(response.usuario);
            }
          })
        )
      );

    } catch (error: any) {
      console.error('Error en login con Google:', error);
      
      // Manejo específico de errores de Firebase
      if (error?.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        throw new Error(
          `El dominio "${currentDomain}" no está autorizado en Firebase. ` +
          `Por favor, agrega este dominio en Firebase Console → Authentication → Settings → Authorized domains.`
        );
      }
      
      if (error?.code === 'auth/network-request-failed') {
        const currentDomain = window.location.hostname;
        throw new Error(
          `Error de conexión con Firebase. Verifica que el dominio "${currentDomain}" esté autorizado en Firebase Console. ` +
          `Si el problema persiste, verifica tu conexión a internet.`
        );
      }
      
      throw error;
    }
  }

  /**
   * Establecer usuario actual
   */
  private setCurrentUser(usuario: Usuario): void {
    this.currentUserSubject.next(usuario);
    this.isAuthenticatedSubject.next(true);
    localStorage.setItem('currentUser', JSON.stringify(usuario));
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * Verificar si está autenticado
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Cerrar sesión
   */
  logout(): void {
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    localStorage.removeItem('currentUser');
  }

  /**
   * Obtener pregunta secreta
   */
  obtenerPreguntaSecreta(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/obtener-pregunta-secreta/`,
      { email },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Verificar respuesta secreta
   */
  verificarRespuestaSecreta(email: string, respuestaSecreta: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/recuperar/`,
      { email, respuestaSecreta },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Restablecer contraseña
   */
  restablecerContrasena(tempToken: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/restablecer/`,
      { tempToken, nuevaContrasena },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Solicitar recuperación de contraseña por email
   */
  solicitarRecuperacionEmail(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/recuperar/email/`,
      { email },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Restablecer contraseña con token de email
   */
  restablecerConTokenEmail(token: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/restablecer/email/`,
      { token, nuevaContrasena },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Configurar TOTP - Obtener QR code
   */
  configurarTOTP(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/totp/configurar/`,
      { email },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Habilitar TOTP después de verificar código
   */
  habilitarTOTP(email: string, codigo: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/totp/habilitar/`,
      { email, codigo },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Verificar código TOTP o backup en login
   */
  verificarTOTPLogin(tempToken: string, codigo: string, tipo: 'totp' | 'backup'): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login/2fa/verificar/`,
      { tempToken, codigo, tipo },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    ).pipe(
      tap((response: any) => {
        if (response.ok) {
          this.setCurrentUser(response.usuario);
        }
      })
    );
  }

  /**
   * Generar códigos de respaldo
   */
  generarCodigosRespaldo(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/backup-codes/generar/`,
      { email },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Obtener estado de seguridad del usuario
   */
  obtenerEstadoSeguridad(email: string): Observable<EstadoSeguridad> {
    return this.http.post<EstadoSeguridad>(
      `${this.apiUrl}/seguridad/estado/`,
      { email },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Solicitar código por email cuando está usando TOTP
   */
  solicitarCodigoEmail(tempToken: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/login/2fa/solicitar-codigo/`,
      { tempToken },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Cambiar contraseña (usuario autenticado)
   */
  cambiarContrasena(email: string, contrasenaActual: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/cambiar-contrasena/`,
      { email, contrasena_actual: contrasenaActual, nueva_contrasena: nuevaContrasena },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  // ========== MÉTODOS OTP CON SENDGRID (Basados en Nova_Graf-main) ==========

  /**
   * Verificar código OTP durante el registro
   * Similar a verifyRegister2FA pero específico para OTP con SendGrid
   */
  verificarOTPRegistro(tempToken: string, codigo: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/verificar-otp/`,
      { tempToken, codigo },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Reenviar código OTP durante el registro
   */
  reenviarOTP(correo: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/reenviar-otp/`,
      { correo },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Solicitar recuperación de contraseña con OTP (SendGrid)
   * Envía código OTP al correo para recuperar contraseña
   */
  solicitarRecuperacionOTP(email: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/recuperar-otp/`,
      { email },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Verificar código OTP para recuperación de contraseña
   */
  verificarOTPRecuperacion(tempToken: string, codigo: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/verificar-otp-recuperacion/`,
      { tempToken, codigo },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Reenviar código OTP para recuperación de contraseña
   */
  reenviarOTPRecuperacion(correo: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/reenviar-otp-recuperacion/`,
      { correo },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }

  /**
   * Actualizar contraseña después de verificar OTP de recuperación
   */
  actualizarContrasenaOTP(tempToken: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/actualizar-contrasena-otp/`,
      { tempToken, nuevaContrasena },
      {
        headers: this.getHeaders(),
        withCredentials: true
      }
    );
  }
}

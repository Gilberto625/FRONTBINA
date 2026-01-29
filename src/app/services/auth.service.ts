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
      const currentDomain = window.location.hostname;
      console.log('🔵 Iniciando login con Google desde dominio:', currentDomain);
      
      // Verificar que Firebase Auth esté disponible
      if (!this.auth) {
        throw new Error('Firebase Auth no está disponible. Verifica la configuración.');
      }

      // Autenticar con Google usando Firebase
      const provider = new GoogleAuthProvider();
      
      // Forzar selector de cuenta: siempre mostrar opción de elegir cuenta o agregar cuenta
      provider.setCustomParameters({
        prompt: 'select_account'  // Fuerza mostrar selector de cuenta
      });
      
      console.log('🔵 Iniciando popup de Google...');
      const result: UserCredential = await signInWithPopup(this.auth, provider);
      console.log('✅ Popup de Google completado, usuario:', result.user.email);

      // Obtener el ID token de Firebase
      console.log('🔵 Obteniendo ID token de Firebase...');
      const idToken = await result.user.getIdToken();
      console.log('✅ ID token obtenido');

      // Obtener CSRF token antes de enviar al backend
      console.log('🔵 Obteniendo CSRF token...');
      await firstValueFrom(this.getCsrfToken());

      // Enviar el token al backend Django
      console.log('🔵 Enviando token al backend:', `${this.apiUrl}/login/google/`);
      const response = await firstValueFrom(
        this.http.post(
          `${this.apiUrl}/login/google/`,
          { idToken },
          {
            headers: this.getHeaders(),
            withCredentials: true
          }
        ).pipe(
          tap((response: any) => {
            console.log('✅ Respuesta del backend:', response);
            if (response.ok) {
              this.setCurrentUser(response.usuario);
              console.log('✅ Usuario establecido:', response.usuario);
            }
          })
        )
      );

      return response;

    } catch (error: any) {
      console.error('❌ Error completo en login con Google:', error);
      console.error('❌ Código de error:', error?.code);
      console.error('❌ Mensaje de error:', error?.message);
      console.error('❌ Stack:', error?.stack);
      
      // Manejo específico de errores de Firebase
      if (error?.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        throw {
          code: 'auth/unauthorized-domain',
          message: `El dominio "${currentDomain}" no está autorizado en Firebase. ` +
            `Por favor, agrega este dominio en Firebase Console → Authentication → Settings → Authorized domains.`,
          error: `El dominio "${currentDomain}" no está autorizado en Firebase. ` +
            `Por favor, agrega este dominio en Firebase Console → Authentication → Settings → Authorized domains.`
        };
      }
      
      if (error?.code === 'auth/popup-closed-by-user') {
        throw {
          code: 'auth/popup-closed-by-user',
          message: 'La ventana de Google fue cerrada. Por favor intenta de nuevo.',
          error: 'La ventana de Google fue cerrada. Por favor intenta de nuevo.'
        };
      }
      
      if (error?.code === 'auth/network-request-failed') {
        const currentDomain = window.location.hostname;
        throw {
          code: 'auth/network-request-failed',
          message: `Error de conexión con Firebase. Verifica que el dominio "${currentDomain}" esté autorizado en Firebase Console.`,
          error: `Error de conexión con Firebase. Verifica que el dominio "${currentDomain}" esté autorizado en Firebase Console. ` +
            `Si el problema persiste, verifica tu conexión a internet.`
        };
      }
      
      if (error?.code === 'auth/internal-error') {
        const currentDomain = window.location.hostname;
        throw {
          code: 'auth/internal-error',
          message: `Error interno de Firebase. Verifica que el dominio "${currentDomain}" esté autorizado en Firebase Console.`,
          error: `Error interno de Firebase. Verifica que el dominio "${currentDomain}" esté autorizado en Firebase Console. ` +
            `También verifica que el CSP (Content Security Policy) permita las conexiones a Firebase.`
        };
      }
      
      // Si es un error HTTP del backend
      if (error?.status) {
        throw {
          code: 'backend-error',
          message: error.error?.error || 'Error del servidor',
          error: error.error?.error || `Error del servidor (${error.status})`
        };
      }
      
      // Error genérico
      throw {
        code: error?.code || 'unknown-error',
        message: error?.message || 'Error desconocido al iniciar sesión con Google',
        error: error?.message || 'Error desconocido al iniciar sesión con Google'
      };
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
      { correo, email: correo },  // Enviar ambos campos para compatibilidad
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

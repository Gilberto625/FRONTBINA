import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginData } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  loadingGoogle = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    // Obtener CSRF token
    this.authService.getCsrfToken().subscribe();

    // Crear formulario
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.showMessage('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    this.loading = true;
    const loginData: LoginData = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;

        // Si requiere 2FA, redirigir a verificación
        if (response.requires2fa) {
          this.router.navigate(['/verify-2fa'], {
            queryParams: {
              tempToken: response.tempToken,
              canal: response.canal,
              destino: response.destino
            }
          });
          return;
        }

        if (response.ok) {
          // Login exitoso - redirigir según el rol
          this.showMessage('¡Inicio de sesión exitoso!', 'success');
          setTimeout(() => {
            this.redirectByRole(response.usuario?.rol);
          }, 500);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error en login:', error);
        
        let errorMsg = 'Error al iniciar sesión';
        
        if (error.status === 0) {
          errorMsg = 'Error de conexión. Verifica que el backend esté disponible.';
        } else if (error.status === 400) {
          errorMsg = error.error?.error || 'Credenciales incorrectas';
        } else if (error.status === 401) {
          errorMsg = 'Correo o contraseña incorrectos';
        } else if (error.status === 403) {
          errorMsg = 'Acceso denegado';
        } else if (error.status === 500) {
          errorMsg = 'Error del servidor. Por favor intenta más tarde.';
        } else if (error.error?.error) {
          errorMsg = error.error.error;
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        this.showMessage(errorMsg, 'error');
      }
    });
  }

  async loginWithGoogle(): Promise<void> {
    this.loadingGoogle = true;

    try {
      const response = await this.authService.loginWithGoogle();

      if (response && response.ok) {
        this.showMessage('¡Inicio de sesión con Google exitoso!', 'success');
        // Esperar un momento para que se actualice el estado
        setTimeout(() => {
          this.redirectByRole(response.usuario?.rol);
        }, 500);
      } else {
        const errorMsg = response?.error || 'Error al iniciar sesión con Google';
        this.showMessage(errorMsg, 'error');
      }
    } catch (error: any) {
      console.error('Error en login con Google:', error);
      
      let errorMsg = 'Error al iniciar sesión con Google';
      
      // Manejo específico de errores de Firebase
      if (error?.code === 'auth/unauthorized-domain') {
        errorMsg = `El dominio "${window.location.hostname}" no está autorizado en Firebase. Por favor, agrega este dominio en Firebase Console → Authentication → Settings → Authorized domains.`;
      } else if (error?.code === 'auth/popup-closed-by-user') {
        errorMsg = 'La ventana de Google fue cerrada. Por favor intenta de nuevo.';
      } else if (error?.code === 'auth/network-request-failed') {
        errorMsg = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error?.code === 'auth/internal-error') {
        errorMsg = `Error interno de Firebase. Verifica que el dominio "${window.location.hostname}" esté autorizado en Firebase Console.`;
      } else if (error?.error?.error) {
        errorMsg = error.error.error;
      } else if (error?.message) {
        errorMsg = error.message;
      }
      
      this.showMessage(errorMsg, 'error');
    } finally {
      this.loadingGoogle = false;
    }
  }

  /**
   * Redirige al usuario según su rol
   */
  private redirectByRole(rol?: string): void {
    if (rol === 'admin') {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/cliente']);
    }
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    if (type === 'error') {
      this.modalService.showError(message);
    } else if (type === 'success') {
      this.modalService.showSuccess(message);
    } else {
      this.modalService.showInfo(message);
    }
  }
}

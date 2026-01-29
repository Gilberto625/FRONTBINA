import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginData } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  loadingGoogle = false;

  // Para 2FA
  requires2fa = false;
  tempToken = '';
  codigoVerificacion = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    // Limpiar localStorage al entrar a login (para evitar datos antiguos)
    localStorage.removeItem('currentUser');
    
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
        
        console.log('🔐 Respuesta login:', response);

        if (response.requires2fa) {
          // Requiere verificación 2FA
          this.requires2fa = true;
          this.tempToken = response.tempToken;
          this.showMessage(`Código enviado a ${response.destino}`, 'info');
        } else if (response.ok && response.usuario) {
          // Login directo sin 2FA
          console.log('✅ Usuario autenticado:', response.usuario);
          console.log('📋 ROL:', response.usuario.rol);
          
          this.showMessage('¡Inicio de sesión exitoso!', 'success');
          this.redirigirSegunRol(response.usuario.rol);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ Error login:', error);
        const errorMsg = error.error?.error || 'Error al iniciar sesión';
        this.showMessage(errorMsg, 'error');
      }
    });
  }

  verificar2FA(): void {
    if (!this.codigoVerificacion || this.codigoVerificacion.length < 6) {
      this.showMessage('Por favor ingresa el código de 6 dígitos', 'error');
      return;
    }

    this.loading = true;

    this.authService.verifyLogin2FA(this.tempToken, this.codigoVerificacion).subscribe({
      next: (response) => {
        this.loading = false;
        
        console.log('🔐 Respuesta 2FA:', response);

        if (response.ok && response.usuario) {
          console.log('✅ Usuario verificado:', response.usuario);
          console.log('📋 ROL:', response.usuario.rol);
          
          this.showMessage('¡Verificación exitosa!', 'success');
          this.redirigirSegunRol(response.usuario.rol);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ Error 2FA:', error);
        const errorMsg = error.error?.error || 'Código incorrecto';
        this.showMessage(errorMsg, 'error');
      }
    });
  }

  private redirigirSegunRol(rol: string): void {
    console.log('🚀 Redirigiendo según rol:', rol);
    
    setTimeout(() => {
      switch (rol) {
        case 'administrador':
          console.log('➡️ Redirigiendo a /admin');
          this.router.navigate(['/admin']);
          break;
        case 'secretaria':
          console.log('➡️ Redirigiendo a /secretaria');
          this.router.navigate(['/secretaria']);
          break;
        case 'barbero':
          console.log('➡️ Redirigiendo a /barbero');
          this.router.navigate(['/barbero']);
          break;
        default:
          console.log('➡️ Redirigiendo a /home (cliente)');
          this.router.navigate(['/home']);
      }
    }, 500);
  }

  async loginWithGoogle(): Promise<void> {
    this.loadingGoogle = true;

    try {
      const response = await this.authService.loginWithGoogle();

      if (response && response.ok) {
        console.log('✅ Google login:', response.usuario);
        this.showMessage('¡Inicio de sesión con Google exitoso!', 'success');
        this.redirigirSegunRol(response.usuario?.rol || 'cliente');
      } else {
        const errorMsg = response?.error || 'Error al iniciar sesión con Google';
        this.showMessage(errorMsg, 'error');
      }
    } catch (error: any) {
      console.error('❌ Error Google login:', error);
      const errorMsg = error?.error?.error || error?.message || 'Error al iniciar sesión con Google';
      this.showMessage(errorMsg, 'error');
    } finally {
      this.loadingGoogle = false;
    }
  }

  cancelar2FA(): void {
    this.requires2fa = false;
    this.tempToken = '';
    this.codigoVerificacion = '';
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify2fa',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    MatIconModule
  ],
  templateUrl: './verify2fa.component.html',
  styleUrl: './verify2fa.component.css'
})
export class Verify2faComponent implements OnInit {
  verifyForm!: FormGroup;
  loading = false;
  tempToken: string = '';
  type: 'register' | 'login' = 'register';
  destination: string = '';
  metodosDisponibles: string[] = ['email'];
  metodoSeleccionado: string = 'email';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    // Obtener datos del state de navegación
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as any;

    if (state) {
      this.tempToken = state.tempToken;
      this.type = state.type;
      this.destination = state.destination;
      this.metodosDisponibles = state.metodosDisponibles || ['email'];
      this.metodoSeleccionado = this.metodosDisponibles[0] || 'email';
    }
  }

  ngOnInit(): void {
    // Validar que existe un token
    if (!this.tempToken) {
      this.showMessage('No se encontró un token de verificación. Por favor, inicia el proceso de registro o login.');
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }

    // Crear formulario con validación dinámica
    this.updateFormValidation();
  }

  updateFormValidation(): void {
    const pattern = this.metodoSeleccionado === 'backup'
      ? /^[0-9]{8}$/  // 8 dígitos para backup codes
      : /^[0-9]{6}$/; // 6 dígitos para email/TOTP

    this.verifyForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(pattern)]]
    });
  }

  onMetodoChange(metodo: string): void {
    this.metodoSeleccionado = metodo;
    this.updateFormValidation();
  }
  
  // Método para manejar el cambio de método desde botones HTML
  onMetodoChangeFromButton(metodo: string): void {
    this.onMetodoChange(metodo);
  }

  solicitarCodigoPorEmail(): void {
    this.loading = true;

    this.authService.solicitarCodigoEmail(this.tempToken).subscribe({
      next: (response) => {
        this.loading = false;
        this.showMessage('Nuevo código enviado a tu correo');
        this.metodoSeleccionado = 'email';
        this.updateFormValidation();
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Error al solicitar código';
        this.showMessage(errorMsg);
      }
    });
  }

  get codigoLength(): number {
    return this.metodoSeleccionado === 'backup' ? 8 : 6;
  }

  get codigoPlaceholder(): string {
    if (this.metodoSeleccionado === 'email') return '123456';
    if (this.metodoSeleccionado === 'totp') return '123456';
    return '12345678'; // backup
  }

  get metodoTexto(): string {
    if (this.metodoSeleccionado === 'email') return 'de tu correo electrónico';
    if (this.metodoSeleccionado === 'totp') return 'de tu autenticador (Google Authenticator)';
    return 'de respaldo';
  }

  onSubmit(): void {
    if (this.verifyForm.invalid) {
      const length = this.metodoSeleccionado === 'backup' ? '8' : '6';
      this.showMessage(`Ingresa un código válido de ${length} dígitos`);
      return;
    }

    this.loading = true;
    const codigo = this.verifyForm.value.codigo;

    let verifyObservable;

    // Decidir qué método llamar según el tipo y método seleccionado
    if (this.type === 'register') {
      // Intentar primero con OTP SendGrid, si falla usar el método 2FA tradicional
      verifyObservable = this.authService.verificarOTPRegistro(this.tempToken, codigo);
    } else {
      // Para login, verificar si es TOTP o backup
      if (this.metodoSeleccionado === 'totp' || this.metodoSeleccionado === 'backup') {
        verifyObservable = this.authService.verificarTOTPLogin(this.tempToken, codigo, this.metodoSeleccionado as 'totp' | 'backup');
      } else {
        // Email - intentar OTP SendGrid primero
        verifyObservable = this.authService.verifyLogin2FA(this.tempToken, codigo);
      }
    }

    verifyObservable.subscribe({
      next: (response) => {
        this.loading = false;

        if (response.ok) {
          const message = this.type === 'register'
            ? '¡Registro exitoso! Ahora puedes iniciar sesión'
            : '¡Inicio de sesión exitoso!';

          this.showMessage(message);

          // Redirigir según el tipo
          if (this.type === 'register') {
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 500);
          } else {
            // Para login, verificar que el usuario se haya guardado
            const usuarioGuardado = this.authService.getCurrentUser();
            console.log('Usuario guardado después de verificación:', usuarioGuardado);
            console.log('Estado autenticado:', this.authService.isAuthenticated());
            
            // Esperar un momento para que se actualice el estado
            setTimeout(() => {
              if (this.authService.isAuthenticated()) {
                this.router.navigate(['/home']);
              } else {
                console.error('Usuario no autenticado después de verificación');
                this.showMessage('Error: No se pudo autenticar. Por favor, intenta de nuevo.');
              }
            }, 500);
          }
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || error.error?.message || 'Código incorrecto o expirado';
        this.showMessage(errorMsg);

        // Si hay demasiados intentos, redirigir
        if (error.status === 429) {
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      }
    });
  }

  /**
   * Reenviar código OTP (para registro con SendGrid)
   */
  reenviarCodigoOTP(): void {
    // Necesitamos el correo del usuario, lo guardamos en localStorage durante el registro
    const correo = localStorage.getItem('registerEmail') || '';
    
    if (!correo) {
      this.showMessage('No se encontró el correo. Por favor, intenta registrarte de nuevo.');
      return;
    }

    this.loading = true;

    this.authService.reenviarOTP(correo).subscribe({
      next: (response) => {
        this.loading = false;
        this.showMessage('✅ Nuevo código enviado a tu correo. Expira en 10 minutos.');
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || error.error?.message || 'Error al reenviar código';
        this.showMessage(errorMsg);
      }
    });
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
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
    MatIconModule,
    MatListModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  otpForm!: FormGroup;
  loading = false;
  tempToken: string = '';
  step: 'verify-otp' | 'reset-password' = 'verify-otp';
  hidePassword = true;
  hideConfirmPassword = true;

  // Requisitos de contraseña
  passwordRequirements = {
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Obtener step de la URL o del localStorage
    this.route.queryParams.subscribe(params => {
      this.step = params['step'] || 'verify-otp';
      const method = params['method'] || 'otp';
      
      // Si viene de preguntas secretas, ir directo a reset-password
      if (method === 'secret') {
        this.step = 'reset-password';
      }
    });

    // Obtener tempToken del localStorage
    this.tempToken = localStorage.getItem('recoveryTempToken') || '';

    if (!this.tempToken && this.step === 'verify-otp') {
      this.showMessage('No se encontró token de recuperación. Por favor, solicita uno nuevo.');
      this.router.navigate(['/forgot-password']);
      return;
    }

    // Si no hay token pero viene de secret, también redirigir
    if (!this.tempToken && this.step === 'reset-password') {
      this.showMessage('No se encontró token de recuperación. Por favor, solicita uno nuevo.');
      this.router.navigate(['/forgot-password']);
      return;
    }

    // Obtener CSRF token
    this.authService.getCsrfToken().subscribe();

    // Crear formularios según el paso
    if (this.step === 'verify-otp') {
      this.otpForm = this.fb.group({
        codigo: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
      });
    } else if (this.step === 'reset-password') {
      this.resetForm = this.fb.group({
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]]
      });

      // Escuchar cambios en la contraseña para validar requisitos
      this.resetForm.get('password')?.valueChanges.subscribe(password => {
        this.checkPasswordRequirements(password);
      });
    }
  }

  checkPasswordRequirements(password: string): void {
    this.passwordRequirements.minLength = password.length >= 8;
    this.passwordRequirements.hasUpperCase = /[A-Z]/.test(password);
    this.passwordRequirements.hasLowerCase = /[a-z]/.test(password);
    this.passwordRequirements.hasNumber = /[0-9]/.test(password);
  }

  get allRequirementsMet(): boolean {
    return Object.values(this.passwordRequirements).every(req => req);
  }

  onVerifyOTP(): void {
    if (this.otpForm.invalid) {
      this.showMessage('Por favor ingresa un código válido de 6 dígitos');
      return;
    }

    this.loading = true;
    const codigo = this.otpForm.value.codigo;

    this.authService.verificarOTPRecuperacion(this.tempToken, codigo).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          this.showMessage('Código verificado correctamente. Ahora puedes cambiar tu contraseña.');
          this.step = 'reset-password';
          // Crear formulario de contraseña
          this.resetForm = this.fb.group({
            password: ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]]
          });
          // Escuchar cambios en la contraseña
          this.resetForm.get('password')?.valueChanges.subscribe(password => {
            this.checkPasswordRequirements(password);
          });
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || error.error?.message || 'Código incorrecto o expirado';
        this.showMessage(errorMsg);
      }
    });
  }

  onResendOTP(): void {
    const email = localStorage.getItem('recoveryEmail') || '';
    if (!email) {
      this.showMessage('No se encontró el correo. Por favor, solicita uno nuevo.');
      this.router.navigate(['/forgot-password']);
      return;
    }

    this.loading = true;
    this.authService.reenviarOTPRecuperacion(email).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          this.showMessage('Nuevo código enviado a tu correo. Expira en 10 minutos.');
        } else {
          this.showMessage(response.message || 'Código reenviado');
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || error.error?.message || 'Error al reenviar código';
        this.showMessage(errorMsg);
      }
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.showMessage('Por favor completa todos los campos correctamente');
      return;
    }

    const password = this.resetForm.value.password;
    const confirmPassword = this.resetForm.value.confirmPassword;

    if (password !== confirmPassword) {
      this.showMessage('Las contraseñas no coinciden');
      return;
    }

    if (!this.allRequirementsMet) {
      this.showMessage('La contraseña no cumple con todos los requisitos');
      return;
    }

    this.loading = true;

    // Determinar qué método usar según el origen
    const recoveryMethod = localStorage.getItem('recoveryMethod') || 'otp';
    
    let updateObservable;
    if (recoveryMethod === 'secret') {
      // Usar el método tradicional de restablecer contraseña
      updateObservable = this.authService.restablecerContrasena(this.tempToken, password);
    } else {
      // Usar el método OTP
      updateObservable = this.authService.actualizarContrasenaOTP(this.tempToken, password);
    }

    updateObservable.subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          this.showMessage('Contraseña actualizada exitosamente');
          
          // Limpiar localStorage
          localStorage.removeItem('recoveryTempToken');
          localStorage.removeItem('recoveryEmail');
          localStorage.removeItem('recoveryMethod');

          // Redirigir al login
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || error.error?.message || 'Error al actualizar contraseña';
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

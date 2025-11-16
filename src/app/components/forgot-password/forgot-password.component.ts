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
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
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
    MatIconModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  forgotForm!: FormGroup;
  secretForm!: FormGroup;
  loading = false;
  recoveryMethod: 'otp' | 'secret' = 'otp';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Obtener CSRF token
    this.authService.getCsrfToken().subscribe();

    // Crear formulario para OTP
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Crear formulario para preguntas secretas
    this.secretForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      preguntaSecreta: ['', [Validators.required]],
      respuestaSecreta: ['', [Validators.required]]
    });
  }

  setRecoveryMethod(method: 'otp' | 'secret'): void {
    this.recoveryMethod = method;
  }

  onSubmit(): void {
    if (this.recoveryMethod === 'otp') {
      this.onSubmitOTP();
    } else {
      this.onSubmitSecret();
    }
  }

  onSubmitOTP(): void {
    if (this.forgotForm.invalid) {
      this.showMessage('Por favor ingresa un email válido');
      return;
    }

    this.loading = true;
    const email = this.forgotForm.value.email;

    this.authService.solicitarRecuperacionOTP(email).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          // Guardar el tempToken para el siguiente paso
          localStorage.setItem('recoveryTempToken', response.tempToken);
          localStorage.setItem('recoveryEmail', email);
          localStorage.setItem('recoveryMethod', 'otp');
          
          this.showMessage('Código OTP enviado a tu correo electrónico. Expira en 10 minutos.');
          
          // Redirigir a verificación OTP
          this.router.navigate(['/reset-password'], {
            queryParams: { step: 'verify-otp' }
          });
        } else {
          this.showMessage(response.message || 'Se ha enviado un código de recuperación a tu correo electrónico');
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || error.error?.message || 'Error al solicitar recuperación de contraseña';
        this.showMessage(errorMsg);
      }
    });
  }

  onSubmitSecret(): void {
    if (this.secretForm.invalid) {
      this.showMessage('Por favor completa todos los campos');
      return;
    }

    this.loading = true;
    const { email, preguntaSecreta, respuestaSecreta } = this.secretForm.value;

    this.authService.recuperarContrasena(email, preguntaSecreta, respuestaSecreta).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          // Guardar el tempToken para el siguiente paso
          localStorage.setItem('recoveryTempToken', response.tempToken);
          localStorage.setItem('recoveryEmail', email);
          localStorage.setItem('recoveryMethod', 'secret');
          
          this.showMessage('Verificación exitosa. Ahora puedes restablecer tu contraseña.');
          
          // Redirigir a restablecer contraseña
          this.router.navigate(['/reset-password'], {
            queryParams: { step: 'reset-password', method: 'secret' }
          });
        } else {
          this.showMessage(response.error || 'Error en la verificación');
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || error.error?.message || 'Error al verificar preguntas secretas';
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

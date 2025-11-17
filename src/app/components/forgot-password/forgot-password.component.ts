import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  emailForm!: FormGroup;
  answerForm!: FormGroup;
  otpForm!: FormGroup;
  loading = false;
  step: 'method' | 'email' | 'answer' | 'verify-otp' = 'method';
  recoveryMethod: 'secret' | 'otp' = 'secret';
  preguntaSecreta: string = '';
  userEmail: string = '';
  tempToken: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener CSRF token
    this.authService.getCsrfToken().subscribe();

    // Crear formulario para email
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Crear formulario para respuesta
    this.answerForm = this.fb.group({
      respuestaSecreta: ['', [Validators.required]]
    });

    // Crear formulario para OTP
    this.otpForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
  }

  setRecoveryMethod(method: 'secret' | 'otp'): void {
    this.recoveryMethod = method;
    this.step = 'email';
  }

  onSubmitEmail(): void {
    // Marcar como touched para mostrar errores
    Object.keys(this.emailForm.controls).forEach(key => {
      this.emailForm.get(key)?.markAsTouched();
    });

    if (this.emailForm.invalid) {
      return;
    }

    this.loading = true;
    const email = this.emailForm.value.email.trim();
    this.userEmail = email;

    if (this.recoveryMethod === 'secret') {
      // Método de preguntas secretas
      this.authService.obtenerPreguntaSecreta(email).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.ok && response.preguntaSecreta) {
            this.preguntaSecreta = response.preguntaSecreta;
            this.step = 'answer';
          }
        },
        error: (error) => {
          this.loading = false;
          const errorMsg = error.error?.error || 'No se encontró una cuenta con ese correo';
          this.showError(errorMsg);
        }
      });
    } else {
      // Método de OTP por email
      this.authService.solicitarRecuperacionOTP(email).subscribe({
        next: (response) => {
          this.loading = false;
          if (response.ok && response.tempToken) {
            this.tempToken = response.tempToken;
            this.step = 'verify-otp';
          }
        },
        error: (error) => {
          this.loading = false;
          const errorMsg = error.error?.error || 'Error al enviar código OTP';
          this.showError(errorMsg);
        }
      });
    }
  }

  onSubmitAnswer(): void {
    // Marcar como touched para mostrar errores
    Object.keys(this.answerForm.controls).forEach(key => {
      this.answerForm.get(key)?.markAsTouched();
    });

    if (this.answerForm.invalid) {
      return;
    }

    this.loading = true;
    const respuestaSecreta = this.answerForm.value.respuestaSecreta.trim();

    this.authService.verificarRespuestaSecreta(this.userEmail, respuestaSecreta).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok && response.tempToken) {
          // Mostrar mensaje de éxito
          const successMsg = response.message || 'Respuesta correcta. Ahora puedes cambiar tu contraseña.';
          this.showSuccess(successMsg);
          
          // Guardar el tempToken para el siguiente paso
          localStorage.setItem('recoveryTempToken', response.tempToken);
          localStorage.setItem('recoveryEmail', this.userEmail);
          localStorage.setItem('recoveryMethod', 'secret');
          
          // Redirigir a restablecer contraseña después de mostrar el mensaje
          setTimeout(() => {
            this.router.navigate(['/reset-password']);
          }, 1500);
        } else {
          this.showError('Error en la verificación. Intenta nuevamente.');
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Respuesta incorrecta';
        this.showError(errorMsg);
      }
    });
  }

  onSubmitOTP(): void {
    // Marcar como touched para mostrar errores
    Object.keys(this.otpForm.controls).forEach(key => {
      this.otpForm.get(key)?.markAsTouched();
    });

    if (this.otpForm.invalid) {
      return;
    }

    this.loading = true;
    const codigo = this.otpForm.value.codigo;

    this.authService.verificarOTPRecuperacion(this.tempToken, codigo).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          // Guardar datos para reset-password
          localStorage.setItem('recoveryTempToken', this.tempToken);
          localStorage.setItem('recoveryEmail', this.userEmail);
          localStorage.setItem('recoveryMethod', 'otp');
          
          // Redirigir a cambiar contraseña
          this.router.navigate(['/reset-password']);
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Código incorrecto o expirado';
        this.showError(errorMsg);
      }
    });
  }

  onResendOTP(): void {
    if (!this.userEmail) {
      return;
    }

    this.loading = true;
    this.authService.reenviarOTPRecuperacion(this.userEmail).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          this.showSuccess('Nuevo código enviado a tu correo');
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Error al reenviar código';
        this.showError(errorMsg);
      }
    });
  }

  goBack(): void {
    if (this.step === 'verify-otp' || this.step === 'answer') {
      this.step = 'email';
      this.otpForm.reset();
      this.answerForm.reset();
    } else if (this.step === 'email') {
      this.step = 'method';
      this.emailForm.reset();
    }
    this.preguntaSecreta = '';
  }

  private showError(message: string): void {
    this.showToast(message, 'error');
  }

  private showSuccess(message: string): void {
    this.showToast(message, 'success');
  }

  private showToast(message: string, type: 'error' | 'success'): void {
    const toastDiv = document.createElement('div');
    toastDiv.className = `toast-message ${type}-toast`;
    toastDiv.textContent = message;
    document.body.appendChild(toastDiv);
    
    setTimeout(() => {
      toastDiv.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toastDiv.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toastDiv);
      }, 300);
    }, 4000);
  }
}

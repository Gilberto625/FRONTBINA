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
  otpForm!: FormGroup;
  loading = false;
  step: 'email' | 'verify-otp' = 'email';
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

    // Crear formulario para OTP
    this.otpForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
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

    // Solo método de OTP por email
    this.authService.solicitarRecuperacionOTP(email).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok && response.tempToken) {
          this.tempToken = response.tempToken;
          this.step = 'verify-otp';
          this.showSuccess('Código enviado a tu correo. Revisa tu bandeja de entrada.');
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Error al enviar código OTP';
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
          this.showSuccess('Código verificado correctamente');
          
          // Guardar datos para reset-password
          localStorage.setItem('recoveryTempToken', this.tempToken);
          localStorage.setItem('recoveryEmail', this.userEmail);
          localStorage.setItem('recoveryMethod', 'otp');
          
          // Redirigir a cambiar contraseña
          setTimeout(() => {
            this.router.navigate(['/reset-password']);
          }, 1500);
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
    if (this.step === 'verify-otp') {
      this.step = 'email';
      this.otpForm.reset();
    }
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

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
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
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

    // Solicitar recuperación de contraseña con OTP
    this.authService.requestPasswordReset(email).subscribe({
      next: (response) => {
        this.loading = false;
        this.step = 'verify-otp';
        this.showSuccess('Código OTP enviado a tu correo. Revisa tu bandeja de entrada.');
      },
      error: (errorMsg) => {
        this.loading = false;
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

    this.authService.verifyOTPReset(this.userEmail, codigo).subscribe({
      next: (response) => {
        this.loading = false;
        this.showSuccess('Código verificado correctamente');
        
        // Guardar datos para reset-password
        localStorage.setItem('recoveryEmail', this.userEmail);
        localStorage.setItem('recoveryOTP', codigo);
        
        // Redirigir a cambiar contraseña después de cerrar el modal
        setTimeout(() => {
          this.router.navigate(['/reset-password']);
        }, 500);
      },
      error: (errorMsg) => {
        this.loading = false;
        this.showError(errorMsg);
      }
    });
  }

  onResendOTP(): void {
    if (!this.userEmail) {
      return;
    }

    this.loading = true;
    this.authService.resendOTPReset(this.userEmail).subscribe({
      next: (response) => {
        this.loading = false;
        this.showSuccess('Nuevo código enviado a tu correo');
      },
      error: (errorMsg) => {
        this.loading = false;
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
    this.modalService.showError(message);
  }

  private showSuccess(message: string): void {
    this.modalService.showSuccess(message);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  loading = false;
  email: string = '';
  otp: string = '';
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
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    // Obtener datos del localStorage
    this.email = localStorage.getItem('recoveryEmail') || '';
    this.otp = localStorage.getItem('recoveryOTP') || '';

    if (!this.email || !this.otp) {
      this.showError('No se encontraron datos de recuperación. Por favor, solicita un nuevo código.');
      setTimeout(() => {
        this.router.navigate(['/forgot-password']);
      }, 500);
      return;
    }

    // Crear formulario con validaciones
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    });

    // Escuchar cambios en la contraseña para validar requisitos
    this.resetForm.get('password')?.valueChanges.subscribe(password => {
      this.checkPasswordRequirements(password);
    });
  }

  /**
   * Validador personalizado: verifica que la contraseña tenga mayúscula, minúscula y número
   */
  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumber;

    return passwordValid ? null : { 
      passwordStrength: {
        hasUpperCase,
        hasLowerCase,
        hasNumber
      }
    };
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

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  onSubmit(): void {
    // Marcar todos los campos como touched para mostrar errores
    Object.keys(this.resetForm.controls).forEach(key => {
      this.resetForm.get(key)?.markAsTouched();
    });

    if (this.resetForm.invalid) {
      this.showError('Por favor completa todos los campos correctamente');
      return;
    }

    const password = this.resetForm.value.password;
    const confirmPassword = this.resetForm.value.confirmPassword;

    if (password !== confirmPassword) {
      this.showError('Las contraseñas no coinciden');
      return;
    }

    if (!this.allRequirementsMet) {
      this.showError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
      return;
    }

    this.loading = true;

    // Usar el método de resetPassword con OTP
    this.authService.resetPassword(this.email, this.otp, password).subscribe({
      next: (response) => {
        this.loading = false;
        this.showSuccess('¡Contraseña actualizada exitosamente!');
        
        // Limpiar localStorage
        localStorage.removeItem('recoveryEmail');
        localStorage.removeItem('recoveryOTP');

        // Redirigir al login después de cerrar el modal
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 500);
      },
      error: (errorMsg) => {
        this.loading = false;
        this.showError(errorMsg);
      }
    });
  }

  private showError(message: string): void {
    this.modalService.showError(message);
  }

  private showSuccess(message: string): void {
    this.modalService.showSuccess(message);
  }
}

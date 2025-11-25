import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, RegisterData } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
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
    // Obtener CSRF token al iniciar
    this.authService.getCsrfToken().subscribe();

    // Crear formulario reactivo con validaciones mejoradas
    this.registerForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), this.noWhitespaceValidator]],
      apellidopaterno: ['', [Validators.required, Validators.minLength(2), this.noWhitespaceValidator]],
      apellidomaterno: ['', [Validators.required, Validators.minLength(2), this.noWhitespaceValidator]],
      username: ['', [Validators.required, Validators.minLength(4), this.noWhitespaceValidator]],
      correo: ['', [Validators.required, Validators.email, this.noWhitespaceValidator]],
      contrasena: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmarContrasena: ['', [Validators.required]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      preguntasecreta: ['', [Validators.required]],
      respuestasecreta: ['', [Validators.required, this.noWhitespaceValidator]]
    });

    // Escuchar cambios en la contraseña para actualizar indicadores visuales
    this.registerForm.get('contrasena')?.valueChanges.subscribe(password => {
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

  /**
   * Validador personalizado: verifica que el campo no esté vacío ni solo contenga espacios
   */
  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null; // El required se encarga de esto
    }

    const isWhitespace = (value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  /**
   * Actualiza los indicadores visuales de requisitos de contraseña
   */
  checkPasswordRequirements(password: string): void {
    this.passwordRequirements.minLength = password.length >= 8;
    this.passwordRequirements.hasUpperCase = /[A-Z]/.test(password);
    this.passwordRequirements.hasLowerCase = /[a-z]/.test(password);
    this.passwordRequirements.hasNumber = /[0-9]/.test(password);
  }

  /**
   * Verifica si todos los requisitos de contraseña se cumplen
   */
  get allRequirementsMet(): boolean {
    return Object.values(this.passwordRequirements).every(req => req);
  }

  /**
   * Toggle para mostrar/ocultar contraseña
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  /**
   * Toggle para mostrar/ocultar confirmación de contraseña
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  onSubmit(): void {
    // Marcar todos los campos como touched para mostrar errores
    Object.keys(this.registerForm.controls).forEach(key => {
      this.registerForm.get(key)?.markAsTouched();
    });

    // Validar que el formulario sea válido
    if (this.registerForm.invalid) {
      this.showMessage('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    // Validar que las contraseñas coincidan
    if (this.registerForm.value.contrasena !== this.registerForm.value.confirmarContrasena) {
      this.showMessage('Las contraseñas no coinciden', 'error');
      return;
    }

    // Validar que la contraseña cumpla con todos los requisitos
    if (!this.allRequirementsMet) {
      this.showMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número', 'error');
      return;
    }

    // Validar que no haya campos con solo espacios en blanco
    const formValues = this.registerForm.value;
    for (const key in formValues) {
      if (typeof formValues[key] === 'string' && formValues[key].trim() === '') {
        this.showMessage('No se permiten campos vacíos o solo con espacios', 'error');
        return;
      }
    }

    this.loading = true;

    // Obtener CSRF token antes de registrar
    this.authService.getCsrfToken().subscribe({
      next: () => {
        // Preparar datos sin el campo confirmarContrasena y trimear valores
        const { confirmarContrasena, ...registerData } = this.registerForm.value;
        
        // Limpiar espacios en blanco de los campos de texto
        const cleanedData = {
          nombre: registerData.nombre.trim(),
          apellidopaterno: registerData.apellidopaterno.trim(),
          apellidomaterno: registerData.apellidomaterno.trim(),
          username: registerData.username.trim(),
          correo: registerData.correo.trim(),
          contrasena: registerData.contrasena,
          telefono: registerData.telefono.trim(),
          preguntasecreta: registerData.preguntasecreta,
          respuestasecreta: registerData.respuestasecreta.trim()
        };

        console.log('Datos de registro:', cleanedData);

        this.authService.register(cleanedData as RegisterData).subscribe({
          next: (response) => {
            this.loading = false;
            this.showMessage('Código OTP enviado a tu correo. Revisa tu bandeja de entrada.', 'success');

            // Guardar el correo en localStorage para poder reenviar código
            localStorage.setItem('registerEmail', cleanedData.correo);

            // Guardar state en sessionStorage como backup
            const navigationState = {
              tempToken: response.tempToken,
              type: 'register',
              destination: response.destino || cleanedData.correo,
              metodosDisponibles: ['email']
            };
            sessionStorage.setItem('verify2fa_state', JSON.stringify(navigationState));

            // Navegar a la página de verificación 2FA con el tempToken después de cerrar el modal
            setTimeout(() => {
              this.router.navigate(['/verify-2fa'], {
                state: navigationState
              });
            }, 500);
          },
          error: (error) => {
            this.loading = false;
            console.error('Error completo:', error);
            const errorMsg = error.error?.error || error.error?.message || 'Error al registrar usuario';
            this.showMessage(errorMsg, 'error');
          }
        });
      },
      error: (csrfError) => {
        this.loading = false;
        console.error('Error obteniendo CSRF token:', csrfError);
        this.showMessage('Error de conexión con el servidor. Por favor, intenta de nuevo.', 'error');
      }
    });
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


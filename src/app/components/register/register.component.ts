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
    // Crear formulario reactivo con validaciones mejoradas
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.noWhitespaceValidator]],
      nombre: ['', [Validators.required, Validators.minLength(2), this.noWhitespaceValidator]],
      apellido: ['', [Validators.required, Validators.minLength(2), this.noWhitespaceValidator]],
      password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmarPassword: ['', [Validators.required]],
      telefono: ['', [Validators.pattern(/^[0-9]{10}$/)]],
      fecha_nacimiento: ['']
    });

    // Escuchar cambios en la contraseña para actualizar indicadores visuales
    this.registerForm.get('password')?.valueChanges.subscribe(password => {
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
    if (this.registerForm.value.password !== this.registerForm.value.confirmarPassword) {
      this.showMessage('Las contraseñas no coinciden', 'error');
      return;
    }

    // Validar que la contraseña cumpla con todos los requisitos
    if (!this.allRequirementsMet) {
      this.showMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número', 'error');
      return;
    }

    this.loading = true;

    // Preparar datos sin el campo confirmarPassword y trimear valores
    const { confirmarPassword, ...formValues } = this.registerForm.value;
    
    // Limpiar espacios en blanco de los campos de texto
    const registerData: RegisterData = {
      email: formValues.email.trim(),
      nombre: formValues.nombre.trim(),
      apellido: formValues.apellido.trim(),
      password: formValues.password,
      telefono: formValues.telefono ? formValues.telefono.trim() : undefined,
      fecha_nacimiento: formValues.fecha_nacimiento || undefined
    };

    console.log('Datos de registro:', registerData);

    this.authService.register(registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.showMessage('¡Registro exitoso! Ahora puedes iniciar sesión.', 'success');

        // Redirigir al login después de cerrar el modal
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (errorMsg) => {
        this.loading = false;
        console.error('Error en registro:', errorMsg);
        this.showMessage(errorMsg, 'error');
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


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
import { MatListModule } from '@angular/material/list';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-change-password',
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
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css'
})
export class ChangePasswordComponent implements OnInit {
  changeForm!: FormGroup;
  loading = false;
  email: string = '';
  hideCurrentPassword = true;
  hideNewPassword = true;
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
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Obtener email del usuario actual
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.showMessage('Debes iniciar sesión primero');
      this.router.navigate(['/login']);
      return;
    }

    this.email = currentUser.email;

    // Obtener CSRF token
    this.authService.getCsrfToken().subscribe();

    // Crear formulario
    this.changeForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });

    // Escuchar cambios en la nueva contraseña para validar requisitos
    this.changeForm.get('newPassword')?.valueChanges.subscribe(password => {
      this.checkPasswordRequirements(password);
    });
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

  onSubmit(): void {
    if (this.changeForm.invalid) {
      this.showMessage('Por favor completa todos los campos correctamente');
      return;
    }

    const currentPassword = this.changeForm.value.currentPassword;
    const newPassword = this.changeForm.value.newPassword;
    const confirmPassword = this.changeForm.value.confirmPassword;

    if (newPassword !== confirmPassword) {
      this.showMessage('Las contraseñas no coinciden');
      return;
    }

    if (!this.allRequirementsMet) {
      this.showMessage('La nueva contraseña no cumple con todos los requisitos');
      return;
    }

    this.loading = true;

    this.authService.cambiarContrasena(this.email, currentPassword, newPassword).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.ok) {
          this.showMessage('Contraseña cambiada exitosamente');

          // Redirigir al dashboard de seguridad
          setTimeout(() => {
            this.router.navigate(['/security']);
          }, 2000);
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Error al cambiar contraseña';
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

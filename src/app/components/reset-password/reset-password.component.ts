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
  loading = false;
  token: string = '';
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
    // Obtener token de la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        this.showMessage('Token de recuperación inválido');
        this.router.navigate(['/login']);
      }
    });

    // Obtener CSRF token
    this.authService.getCsrfToken().subscribe();

    // Crear formulario
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });

    // Escuchar cambios en la contraseña para validar requisitos
    this.resetForm.get('password')?.valueChanges.subscribe(password => {
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

    this.authService.restablecerConTokenEmail(this.token, password).subscribe({
      next: (response) => {
        this.loading = false;
        this.showMessage('Contraseña restablecida exitosamente');

        // Redirigir al login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Error al restablecer contraseña';
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

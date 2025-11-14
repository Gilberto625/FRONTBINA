import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      preguntaSecreta: ['', [Validators.required, Validators.minLength(3)]],
      respuestaSecreta: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos correctamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    this.isLoading = true;
    const { email, preguntaSecreta, respuestaSecreta } = this.forgotPasswordForm.value;

    // Primero obtener CSRF token
    this.authService.getCsrfToken().subscribe({
      next: () => {
        // Luego enviar solicitud de recuperación
        this.authService.recuperarContrasena(email, preguntaSecreta, respuestaSecreta).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.ok) {
              this.snackBar.open(response.mensaje, 'Cerrar', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });

              // Redirigir a página de restablecer contraseña con el tempToken
              this.router.navigate(['/reset-password'], {
                queryParams: { token: response.tempToken }
              });
            } else {
              this.snackBar.open(response.mensaje || 'Error al procesar la solicitud', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            }
          },
          error: (error) => {
            this.isLoading = false;
            const mensaje = error.error?.mensaje || 'Error al procesar la solicitud';
            this.snackBar.open(mensaje, 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al conectar con el servidor', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  volverLogin() {
    this.router.navigate(['/login']);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  isLoading = false;
  tempToken: string = '';
  hidePassword = true;
  hideConfirmPassword = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.resetPasswordForm = this.fb.group({
      nuevaContrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Obtener tempToken de los query params
    this.route.queryParams.subscribe(params => {
      this.tempToken = params['token'];
      if (!this.tempToken) {
        this.snackBar.open('Token inválido. Por favor solicita la recuperación nuevamente.', 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this.router.navigate(['/forgot-password']);
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('nuevaContrasena')?.value;
    const confirmPassword = form.get('confirmarContrasena')?.value;

    if (password !== confirmPassword) {
      form.get('confirmarContrasena')?.setErrors({ mismatch: true });
    } else {
      return null;
    }
    return null;
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      this.snackBar.open('Por favor completa todos los campos correctamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
      return;
    }

    this.isLoading = true;
    const { nuevaContrasena } = this.resetPasswordForm.value;

    // Primero obtener CSRF token
    this.authService.getCsrfToken().subscribe({
      next: () => {
        // Luego restablecer contraseña
        this.authService.restablecerContrasena(this.tempToken, nuevaContrasena).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.ok) {
              this.snackBar.open('¡Contraseña restablecida exitosamente!', 'Cerrar', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['success-snackbar']
              });

              // Redirigir al login después de 2 segundos
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 2000);
            } else {
              this.snackBar.open(response.mensaje || 'Error al restablecer la contraseña', 'Cerrar', {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            }
          },
          error: (error) => {
            this.isLoading = false;
            const mensaje = error.error?.mensaje || 'Error al restablecer la contraseña';
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

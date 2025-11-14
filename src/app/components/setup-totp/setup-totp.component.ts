import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-setup-totp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './setup-totp.component.html',
  styleUrl: './setup-totp.component.css'
})
export class SetupTotpComponent implements OnInit {
  verifyForm!: FormGroup;
  loading = false;
  qrCodeUrl: SafeUrl = '';
  secretKey: string = '';
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
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

    // Crear formulario de verificación
    this.verifyForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });

    // Configurar TOTP
    this.configureTOTP();
  }

  configureTOTP(): void {
    this.loading = true;

    this.authService.configurarTOTP(this.email).subscribe({
      next: (response) => {
        this.loading = false;

        // El QR viene en base64
        this.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(response.qr_code);
        this.secretKey = response.secret;
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Error al configurar TOTP';
        this.showMessage(errorMsg);
      }
    });
  }

  onVerify(): void {
    if (this.verifyForm.invalid) {
      this.showMessage('Ingresa un código válido de 6 dígitos');
      return;
    }

    this.loading = true;
    const codigo = this.verifyForm.value.codigo;

    this.authService.habilitarTOTP(this.email, codigo).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.ok) {
          this.showMessage('TOTP habilitado exitosamente');

          // Redirigir al dashboard de seguridad
          setTimeout(() => {
            this.router.navigate(['/security']);
          }, 2000);
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Código incorrecto';
        this.showMessage(errorMsg);
      }
    });
  }

  copySecretKey(): void {
    navigator.clipboard.writeText(this.secretKey).then(() => {
      this.showMessage('Clave secreta copiada al portapapeles');
    }).catch(() => {
      this.showMessage('Error al copiar la clave');
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

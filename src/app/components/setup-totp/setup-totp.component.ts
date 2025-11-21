import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-setup-totp',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
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
  currentStep: number = 1;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    // Obtener email del usuario actual
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) {
      this.showMessage('Debes iniciar sesión primero', 'error');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 500);
      return;
    }

    this.email = currentUser.email;

    // Crear formulario de verificación
    this.verifyForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });

    // Configurar TOTP
    this.configureTOTP();
  }

  configureTOTP(): void {
    this.loading = true;

    // Configurar TOTP usando el método correcto
    this.authService.setupTOTP().subscribe({
      next: (response) => {
        this.loading = false;

        // El QR viene en formato data URL
        this.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(response.qr_code);
        this.secretKey = response.secret;
        this.currentStep = 1;
      },
      error: (errorMsg) => {
        this.loading = false;
        this.showMessage(errorMsg, 'error');
        setTimeout(() => {
          this.router.navigate(['/security']);
        }, 2000);
      }
    });
  }

  onVerify(): void {
    if (this.verifyForm.invalid) {
      this.showMessage('Ingresa un código válido de 6 dígitos', 'error');
      return;
    }

    this.loading = true;
    const codigo = this.verifyForm.value.codigo;

    // Confirmar TOTP con el código ingresado
    this.authService.confirmTOTP(codigo).subscribe({
      next: (response) => {
        this.loading = false;
        this.showMessage('TOTP habilitado exitosamente. Guarda tus códigos de respaldo.', 'success');

        // Guardar los códigos de respaldo
        localStorage.setItem('backup_codes', JSON.stringify(response.backup_codes));

        // Redirigir a backup-codes para mostrar los códigos
        setTimeout(() => {
          this.router.navigate(['/backup-codes']);
        }, 500);
      },
      error: (errorMsg) => {
        this.loading = false;
        this.showMessage(errorMsg, 'error');
      }
    });
  }

  copySecretKey(): void {
    navigator.clipboard.writeText(this.secretKey).then(() => {
      this.showMessage('Clave secreta copiada al portapapeles', 'success');
    }).catch(() => {
      this.showMessage('Error al copiar la clave', 'error');
    });
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    if (type === 'error') {
      this.modalService.showError(message);
    } else if (type === 'success') {
      this.modalService.showSuccess(message);
    } else if (type === 'warning') {
      this.modalService.showWarning(message);
    } else {
      this.modalService.showInfo(message);
    }
  }
}

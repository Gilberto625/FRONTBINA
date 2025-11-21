import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

interface EstadoSeguridad {
  email_2fa: boolean;
  totp_habilitado: boolean;
  codigos_respaldo_disponibles: number;
  tiene_preguntas_seguridad: boolean;
}

@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './security-dashboard.component.html',
  styleUrl: './security-dashboard.component.css'
})
export class SecurityDashboardComponent implements OnInit {
  loading = false;
  email: string = '';
  estadoSeguridad: EstadoSeguridad = {
    email_2fa: true,
    totp_habilitado: false,
    codigos_respaldo_disponibles: 0,
    tiene_preguntas_seguridad: false
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    // Obtener usuario actual
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) {
      this.showMessage('Debes iniciar sesión primero', 'error');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 500);
      return;
    }

    this.email = currentUser.email;

    // Cargar estado de seguridad desde el usuario actual
    this.loadSecurityStatus();
  }

  loadSecurityStatus(): void {
    this.loading = true;

    // Obtener el perfil actualizado del usuario
    this.authService.getCurrentUser().subscribe({
      next: (user) => {
        this.loading = false;
        
        // Construir estado de seguridad basado en el usuario
        this.estadoSeguridad = {
          email_2fa: true, // Siempre habilitado por defecto
          totp_habilitado: user.totp_enabled || false,
          codigos_respaldo_disponibles: user.backup_codes_generated ? 10 : 0,
          tiene_preguntas_seguridad: false
        };
      },
      error: (errorMsg) => {
        this.loading = false;
        this.showMessage(errorMsg, 'error');
        // Usar valores por defecto en caso de error
        this.estadoSeguridad = {
          email_2fa: true,
          totp_habilitado: false,
          codigos_respaldo_disponibles: 0,
          tiene_preguntas_seguridad: false
        };
      }
    });
  }

  setupTOTP(): void {
    this.router.navigate(['/setup-totp']);
  }

  generateBackupCodes(): void {
    this.router.navigate(['/backup-codes']);
  }

  changePassword(): void {
    this.router.navigate(['/change-password']);
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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

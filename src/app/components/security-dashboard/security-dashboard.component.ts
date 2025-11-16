import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService, EstadoSeguridad } from '../../services/auth.service';

@Component({
  selector: 'app-security-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule
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

    // Cargar estado de seguridad
    this.loadSecurityStatus();
  }

  loadSecurityStatus(): void {
    this.loading = true;

    this.authService.obtenerEstadoSeguridad(this.email).subscribe({
      next: (estado) => {
        this.loading = false;
        this.estadoSeguridad = estado;
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Error al cargar estado de seguridad';
        this.showMessage(errorMsg);
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

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}

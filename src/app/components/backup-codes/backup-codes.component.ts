import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-backup-codes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatListModule,
    MatDividerModule
  ],
  templateUrl: './backup-codes.component.html',
  styleUrl: './backup-codes.component.css'
})
export class BackupCodesComponent implements OnInit {
  loading = false;
  backupCodes: string[] = [];
  email: string = '';

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

    // Generar códigos automáticamente al cargar
    this.generateCodes();
  }

  generateCodes(): void {
    this.loading = true;

    this.authService.generarCodigosRespaldo(this.email).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.ok && response.codigos) {
          this.backupCodes = response.codigos;
          this.showMessage('Códigos de respaldo generados exitosamente');
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Error al generar códigos de respaldo';
        this.showMessage(errorMsg);
      }
    });
  }

  downloadCodes(): void {
    if (this.backupCodes.length === 0) {
      this.showMessage('No hay códigos para descargar');
      return;
    }

    const codesText = this.backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup-codes.txt';
    link.click();
    window.URL.revokeObjectURL(url);

    this.showMessage('Códigos descargados como backup-codes.txt');
  }

  copyCodes(): void {
    if (this.backupCodes.length === 0) {
      this.showMessage('No hay códigos para copiar');
      return;
    }

    const codesText = this.backupCodes.join('\n');
    navigator.clipboard.writeText(codesText).then(() => {
      this.showMessage('Códigos copiados al portapapeles');
    }).catch(() => {
      this.showMessage('Error al copiar los códigos');
    });
  }

  goToSecurity(): void {
    this.router.navigate(['/security']);
  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}

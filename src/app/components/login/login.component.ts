import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginData } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  loadingGoogle = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    // Obtener CSRF token
    this.authService.getCsrfToken().subscribe();

    // Crear formulario
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.showMessage('Por favor completa todos los campos correctamente', 'error');
      return;
    }

    this.loading = true;
    const loginData: LoginData = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.loading = false;

        if (response.ok) {
          // Login directo sin 2FA (modificado según requerimiento)
          // El servicio ya guarda el usuario en el pipe tap
          this.showMessage('¡Inicio de sesión exitoso!', 'success');
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 500);
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Error al iniciar sesión';
        this.showMessage(errorMsg, 'error');
      }
    });
  }

  async loginWithGoogle(): Promise<void> {
    this.loadingGoogle = true;

    try {
      const response = await this.authService.loginWithGoogle();

      if (response && response.ok) {
        this.showMessage('¡Inicio de sesión con Google exitoso!', 'success');
        // Esperar un momento para que se actualice el estado
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 500);
      } else {
        const errorMsg = response?.error || 'Error al iniciar sesión con Google';
        this.showMessage(errorMsg, 'error');
      }
    } catch (error: any) {
      const errorMsg = error?.error?.error || error?.message || 'Error al iniciar sesión con Google';
      this.showMessage(errorMsg, 'error');
    } finally {
      this.loadingGoogle = false;
    }
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

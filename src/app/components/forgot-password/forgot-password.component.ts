import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  emailForm!: FormGroup;
  answerForm!: FormGroup;
  loading = false;
  step: 'email' | 'answer' = 'email';
  preguntaSecreta: string = '';
  userEmail: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Obtener CSRF token
    this.authService.getCsrfToken().subscribe();

    // Crear formulario para email
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    // Crear formulario para respuesta
    this.answerForm = this.fb.group({
      respuestaSecreta: ['', [Validators.required]]
    });
  }

  onSubmitEmail(): void {
    // Marcar como touched para mostrar errores
    Object.keys(this.emailForm.controls).forEach(key => {
      this.emailForm.get(key)?.markAsTouched();
    });

    if (this.emailForm.invalid) {
      return;
    }

    this.loading = true;
    const email = this.emailForm.value.email.trim();

    this.authService.obtenerPreguntaSecreta(email).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok && response.preguntaSecreta) {
          this.userEmail = email;
          this.preguntaSecreta = response.preguntaSecreta;
          this.step = 'answer';
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'No se encontró una cuenta con ese correo';
        this.showError(errorMsg);
      }
    });
  }

  onSubmitAnswer(): void {
    // Marcar como touched para mostrar errores
    Object.keys(this.answerForm.controls).forEach(key => {
      this.answerForm.get(key)?.markAsTouched();
    });

    if (this.answerForm.invalid) {
      return;
    }

    this.loading = true;
    const respuestaSecreta = this.answerForm.value.respuestaSecreta.trim();

    this.authService.verificarRespuestaSecreta(this.userEmail, respuestaSecreta).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok && response.tempToken) {
          // Guardar el tempToken para el siguiente paso
          localStorage.setItem('recoveryTempToken', response.tempToken);
          localStorage.setItem('recoveryEmail', this.userEmail);
          localStorage.setItem('recoveryMethod', 'secret');
          
          // Redirigir a restablecer contraseña
          this.router.navigate(['/reset-password']);
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMsg = error.error?.error || 'Respuesta incorrecta';
        this.showError(errorMsg);
      }
    });
  }

  goBack(): void {
    this.step = 'email';
    this.emailForm.reset();
    this.answerForm.reset();
    this.preguntaSecreta = '';
    this.userEmail = '';
  }

  private showError(message: string): void {
    // Mostrar error en el DOM
    const errorDiv = document.createElement('div');
    errorDiv.className = 'toast-message error-toast';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      errorDiv.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(errorDiv);
      }, 300);
    }, 4000);
  }
}

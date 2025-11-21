import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService, Usuario } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  currentUser: Usuario | null = null;
  profileForm!: FormGroup;
  editMode = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUserValue();
    this.currentUser = user ? { email: user.email, nombre: user.nombre, apellido: user.apellido, telefono: user.telefono, rol: user.rol, id: user.id } : null;
    
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.profileForm = this.fb.group({
      username: [{ value: this.currentUser.username || '', disabled: true }],
      email: [{ value: this.currentUser.email || '', disabled: true }],
      id: [{ value: this.currentUser.id || '', disabled: true }]
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
    if (this.editMode) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      // Nota: El backend no tiene endpoint para actualizar perfil
      // Por ahora solo mostramos un mensaje
      this.showMessage('La actualización de perfil no está disponible en este momento', 'info');
      this.editMode = false;
      this.profileForm.disable();
    }
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToSecurity(): void {
    this.router.navigate(['/security']);
  }

  goToChangePassword(): void {
    this.router.navigate(['/change-password']);
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



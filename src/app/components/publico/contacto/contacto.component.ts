import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactoComponent {
  contactoForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService
  ) {
    this.contactoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      asunto: ['', [Validators.required]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.contactoForm.valid) {
      this.loading = true;
      
      // Simular envío de formulario
      setTimeout(() => {
        this.loading = false;
        this.modalService.showMessage(
          '¡Mensaje enviado!',
          'Gracias por contactarnos. Te responderemos en un plazo de 24-48 horas.',
          'success'
        );
        this.contactoForm.reset();
      }, 1500);
    } else {
      this.modalService.showMessage(
        'Error',
        'Por favor completa todos los campos correctamente.',
        'error'
      );
    }
  }

  get contactoInfo() {
    return {
      telefono: '+52 771 123 4567',
      correo: 'contacto@stylobarber.com',
      direccion: 'Av. Principal #123, Col. Centro, Pachuca, Hidalgo',
      horario: 'Lunes a Sábado: 9:00 AM - 8:00 PM\nDomingo: 10:00 AM - 6:00 PM'
    };
  }
}

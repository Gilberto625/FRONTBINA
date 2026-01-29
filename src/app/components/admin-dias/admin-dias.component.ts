import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-admin-dias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dias.component.html',
  styleUrl: './admin-dias.component.css'
})
export class AdminDiasComponent {
  dia_semana = 0;
  demanda: 'alta' | 'media' | 'baja' = 'media';
  cargando = false;

  constructor(private adminService: AdminService, private modalService: ModalService) {}

  guardar(): void {
    this.cargando = true;
    this.adminService.clasificarDia({ dia_semana: this.dia_semana, demanda: this.demanda }).subscribe({
      next: async (r: any) => {
        this.cargando = false;
        if (r?.exito) {
          await this.modalService.mostrarExito('Listo', 'Día clasificado.');
        } else {
          this.modalService.mostrarError('Error', r?.mensaje || 'No se pudo clasificar.');
        }
      },
      error: (e: any) => {
        this.cargando = false;
        this.modalService.mostrarError('Error', e?.error?.mensaje || 'No se pudo clasificar.');
      }
    });
  }
}


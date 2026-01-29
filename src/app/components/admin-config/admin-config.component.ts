import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-config.component.html',
  styleUrl: './admin-config.component.css'
})
export class AdminConfigComponent implements OnInit {
  cargando = false;
  configuraciones: any[] = [];

  constructor(private adminService: AdminService, private modalService: ModalService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.adminService.obtenerConfiguracion().subscribe({
      next: (r: any) => {
        this.cargando = false;
        if (r?.exito) this.configuraciones = r.datos?.configuracion || [];
        else this.modalService.showError(r?.mensaje || 'No se pudo cargar configuración.');
      },
      error: () => {
        this.cargando = false;
        this.modalService.showError('No se pudo cargar configuración.');
      }
    });
  }

  guardar(): void {
    // Backend espera payload con configuraciones (ver views.py). Enviamos tal cual lo que trae.
    this.adminService.actualizarConfiguracion({ configuracion: this.configuraciones }).subscribe({
      next: async (r: any) => {
        if (r?.exito) {
          await this.modalService.mostrarExito('Guardado', 'Configuración actualizada.');
          this.cargar();
        } else this.modalService.mostrarError('Error', r?.mensaje || 'No se pudo guardar.');
      },
      error: (e: any) => this.modalService.mostrarError('Error', e?.error?.mensaje || 'No se pudo guardar.')
    });
  }
}


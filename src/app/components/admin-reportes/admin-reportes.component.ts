import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-admin-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-reportes.component.html',
  styleUrl: './admin-reportes.component.css'
})
export class AdminReportesComponent {
  cargando = false;
  reporte: any = null;
  fechaInicio = '';
  fechaFin = '';

  constructor(private adminService: AdminService, private modalService: ModalService) {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setDate(inicio.getDate() - 30);
    this.fechaInicio = inicio.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];
  }

  cargar(): void {
    this.cargando = true;
    const filtros = {
      fecha_inicio: this.fechaInicio ? `${this.fechaInicio}T00:00:00Z` : undefined,
      fecha_fin: this.fechaFin ? `${this.fechaFin}T23:59:59Z` : undefined
    };
    this.adminService.reportes(filtros).subscribe({
      next: (r: any) => {
        this.cargando = false;
        if (r?.exito) this.reporte = r.datos?.reporte;
        else this.modalService.showError(r?.mensaje || 'No se pudo generar reporte.');
      },
      error: () => {
        this.cargando = false;
        this.modalService.showError('No se pudo generar reporte.');
      }
    });
  }
}


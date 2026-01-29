import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  cargando = false;
  metricas: any = null;

  fechaInicio = '';
  fechaFin = '';

  constructor(private adminService: AdminService, private modalService: ModalService) {}

  ngOnInit(): void {
    const hoy = new Date();
    const inicio = new Date(hoy);
    inicio.setDate(inicio.getDate() - 30);
    this.fechaInicio = inicio.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    const filtros = {
      fecha_inicio: this.fechaInicio ? `${this.fechaInicio}T00:00:00Z` : undefined,
      fecha_fin: this.fechaFin ? `${this.fechaFin}T23:59:59Z` : undefined
    };
    this.adminService.metricas(filtros).subscribe({
      next: (r: any) => {
        this.cargando = false;
        if (r?.exito) this.metricas = r.datos?.metricas;
        else this.modalService.showError(r?.mensaje || 'No se pudieron cargar métricas.');
      },
      error: (e: any) => {
        this.cargando = false;
        const msg = e?.error?.mensaje || 'No se pudieron cargar métricas.';
        this.modalService.showError(msg);
      }
    });
  }
}


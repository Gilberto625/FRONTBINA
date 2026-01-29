import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BarberoService } from '../../services/barbero.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-barbero-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './barbero-dashboard.component.html',
  styleUrl: './barbero-dashboard.component.css'
})
export class BarberoDashboardComponent implements OnInit {
  cargando = false;
  stats = { citasHoy: 0, pendientes: 0, confirmadas: 0 };

  constructor(
    private barberoService: BarberoService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicio = hoy.toISOString();
    const fin = new Date(hoy);
    fin.setDate(fin.getDate() + 1);

    this.barberoService.misCitas({ fecha_inicio: inicio, fecha_fin: fin.toISOString() }).subscribe({
      next: (r: any) => {
        this.cargando = false;
        if (!r?.exito) {
          this.modalService.showError(r?.mensaje || 'No se pudieron cargar citas.');
          return;
        }
        const citas = r.datos?.citas || [];
        this.stats.citasHoy = citas.length;
        this.stats.pendientes = citas.filter((c: any) => c.estado === 'pendiente').length;
        this.stats.confirmadas = citas.filter((c: any) => c.estado === 'confirmada').length;
      },
      error: () => {
        this.cargando = false;
        this.modalService.showError('No se pudieron cargar citas.');
      }
    });
  }
}


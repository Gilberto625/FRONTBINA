import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BarberoService } from '../../services/barbero.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-barbero-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './barbero-servicios.component.html',
  styleUrl: './barbero-servicios.component.css'
})
export class BarberoServiciosComponent implements OnInit {
  cargando = false;
  servicios: any[] = [];
  duracion: Record<number, number> = {};

  constructor(private barberoService: BarberoService, private modalService: ModalService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.barberoService.misServicios().subscribe({
      next: (r: any) => {
        this.cargando = false;
        if (r?.exito) {
          this.servicios = r.datos?.servicios || [];
          this.servicios.forEach(s => this.duracion[s.servicio_id] = s.duracion_minutos);
        } else {
          this.modalService.showError(r?.mensaje || 'No se pudieron cargar servicios.');
        }
      },
      error: () => {
        this.cargando = false;
        this.modalService.showError('No se pudieron cargar servicios.');
      }
    });
  }

  async guardar(servicioId: number): Promise<void> {
    const val = Number(this.duracion[servicioId]);
    if (!val || Number.isNaN(val) || val <= 0) {
      this.modalService.mostrarError('Error', 'Duración inválida.');
      return;
    }

    this.barberoService.actualizarDuracion(servicioId, val).subscribe({
      next: async (r: any) => {
        if (r?.exito) {
          await this.modalService.mostrarExito('Actualizado', 'Duración guardada.');
          this.cargar();
        } else {
          this.modalService.mostrarError('Error', r?.mensaje || 'No se pudo actualizar.');
        }
      },
      error: (e: any) => {
        const msg = e?.error?.mensaje || 'No se pudo actualizar.';
        this.modalService.mostrarError('Error', msg);
      }
    });
  }
}


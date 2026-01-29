import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SecretariaService, CitaAgenda } from '../../services/secretaria.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-secretaria-asistencias',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './secretaria-asistencias.component.html',
  styleUrl: './secretaria-asistencias.component.css'
})
export class SecretariaAsistenciasComponent implements OnInit {
  cargando = false;
  citas: CitaAgenda[] = [];

  fecha = '';

  constructor(
    private secretariaService: SecretariaService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    const hoy = new Date();
    this.fecha = hoy.toISOString().split('T')[0];
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    const inicio = `${this.fecha}T00:00:00Z`;
    const fin = `${this.fecha}T23:59:59Z`;

    this.secretariaService.obtenerAgenda({ fecha_inicio: inicio, fecha_fin: fin }).subscribe({
      next: (r: any) => {
        this.cargando = false;
        if (r?.exito) {
          this.citas = r.datos?.citas || [];
        } else {
          this.modalService.mostrarError('Error', r?.mensaje || 'No se pudieron cargar citas.');
        }
      },
      error: (e: any) => {
        this.cargando = false;
        const msg = e?.error?.mensaje || 'No se pudieron cargar citas.';
        this.modalService.mostrarError('Error', msg);
      }
    });
  }

  async marcar(cita: CitaAgenda, asistio: boolean): Promise<void> {
    const ok = await this.modalService.mostrarConfirmacion(
      'Registrar asistencia',
      `¿Confirmas marcar ${asistio ? 'ASISTIÓ' : 'NO ASISTIÓ'} en la cita #${cita.id}?`,
      'Confirmar',
      'Cancelar'
    );
    if (!ok) return;

    this.secretariaService.registrarAsistencia(cita.id, asistio).subscribe({
      next: async (r: any) => {
        if (r?.exito) {
          await this.modalService.mostrarExito('Listo', 'Asistencia registrada.');
          this.cargar();
        } else {
          this.modalService.mostrarError('Error', r?.mensaje || 'No se pudo registrar.');
        }
      },
      error: (e: any) => {
        const msg = e?.error?.mensaje || 'No se pudo registrar.';
        this.modalService.mostrarError('Error', msg);
      }
    });
  }

  formatearFechaHora(fecha: string): string {
    return new Date(fecha).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
  }
}


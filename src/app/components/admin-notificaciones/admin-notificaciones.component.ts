import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-admin-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-notificaciones.component.html',
  styleUrl: './admin-notificaciones.component.css'
})
export class AdminNotificacionesComponent implements OnInit {
  cargando = false;
  notificaciones: any[] = [];

  // filtros
  canal = '';
  estado = '';
  tipo_evento = '';
  usuario_id = '';

  // envío manual
  envio: any = { canal: 'email', destinatario: '', asunto: '', mensaje: '', usuario_id: '' , tipo_evento: 'otro' };
  procesando = false;

  constructor(private notifService: NotificationService, private modalService: ModalService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    const filtros: any = {};
    if (this.canal) filtros.canal = this.canal;
    if (this.estado) filtros.estado = this.estado;
    if (this.tipo_evento) filtros.tipo_evento = this.tipo_evento;
    if (this.usuario_id) filtros.usuario_id = Number(this.usuario_id);

    this.notifService.historial(filtros).subscribe({
      next: (r: any) => {
        this.cargando = false;
        if (r?.exito) this.notificaciones = r.datos?.notificaciones || [];
        else this.modalService.showError(r?.mensaje || 'No se pudo cargar historial.');
      },
      error: () => {
        this.cargando = false;
        this.modalService.showError('No se pudo cargar historial.');
      }
    });
  }

  async enviar(): Promise<void> {
    if (!this.envio.destinatario || !this.envio.mensaje) {
      this.modalService.mostrarError('Error', 'destinatario y mensaje son requeridos.');
      return;
    }
    const payload: any = { ...this.envio };
    if (payload.usuario_id) payload.usuario_id = Number(payload.usuario_id);
    else delete payload.usuario_id;

    this.procesando = true;
    this.notifService.enviar(payload).subscribe({
      next: async (r: any) => {
        this.procesando = false;
        if (r?.exito) {
          await this.modalService.mostrarExito('Enviado', 'Notificación enviada.');
          this.envio.mensaje = '';
          this.cargar();
        } else {
          this.modalService.mostrarError('Error', r?.mensaje || 'No se pudo enviar.');
        }
      },
      error: (e: any) => {
        this.procesando = false;
        this.modalService.mostrarError('Error', e?.error?.mensaje || 'No se pudo enviar.');
      }
    });
  }

  async procesarProgramadas(): Promise<void> {
    const ok = await this.modalService.mostrarConfirmacion(
      'Procesar programadas',
      'Esto ejecuta el procesamiento de notificaciones programadas en el backend. ¿Continuar?',
      'Procesar',
      'Cancelar'
    );
    if (!ok) return;

    this.procesando = true;
    this.notifService.procesarProgramadas().subscribe({
      next: async (r: any) => {
        this.procesando = false;
        if (r?.exito) {
          await this.modalService.mostrarExito('Listo', r.mensaje || 'Procesadas.');
          this.cargar();
        } else {
          this.modalService.mostrarError('Error', r?.mensaje || 'No se pudo procesar.');
        }
      },
      error: (e: any) => {
        this.procesando = false;
        this.modalService.mostrarError('Error', e?.error?.mensaje || 'No se pudo procesar.');
      }
    });
  }

  fecha(f: string): string {
    return new Date(f).toLocaleString('es-MX', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}


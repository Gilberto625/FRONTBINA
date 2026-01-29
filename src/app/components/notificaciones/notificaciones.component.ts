import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './notificaciones.component.html',
  styleUrl: './notificaciones.component.css'
})
export class NotificacionesComponent implements OnInit {
  cargando = false;
  notificaciones: any[] = [];

  canal = '';
  estado = '';

  constructor(private notifService: NotificationService, private modalService: ModalService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    const filtros: any = {};
    if (this.canal) filtros.canal = this.canal;
    if (this.estado) filtros.estado = this.estado;

    this.notifService.misNotificaciones(filtros).subscribe({
      next: (r: any) => {
        this.cargando = false;
        if (r?.exito) this.notificaciones = r.datos?.notificaciones || [];
        else this.modalService.showError(r?.mensaje || 'No se pudieron cargar notificaciones.');
      },
      error: (e: any) => {
        this.cargando = false;
        const msg = e?.error?.mensaje || 'No se pudieron cargar notificaciones.';
        this.modalService.showError(msg);
      }
    });
  }

  fecha(f: string): string {
    return new Date(f).toLocaleString('es-MX', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}


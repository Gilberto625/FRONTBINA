import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BarberoService } from '../../services/barbero.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-barbero-citas',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './barbero-citas.component.html',
  styleUrl: './barbero-citas.component.css'
})
export class BarberoCitasComponent implements OnInit {
  cargando = false;
  citas: any[] = [];
  fecha = '';
  estado = '';

  constructor(private barberoService: BarberoService, private modalService: ModalService) {}

  ngOnInit(): void {
    const hoy = new Date();
    this.fecha = hoy.toISOString().split('T')[0];
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    const inicio = `${this.fecha}T00:00:00Z`;
    const fin = `${this.fecha}T23:59:59Z`;
    const filtros: any = { fecha_inicio: inicio, fecha_fin: fin };
    if (this.estado) filtros.estado = this.estado;

    this.barberoService.misCitas(filtros).subscribe({
      next: (r: any) => {
        this.cargando = false;
        if (r?.exito) this.citas = r.datos?.citas || [];
        else this.modalService.showError(r?.mensaje || 'No se pudieron cargar citas.');
      },
      error: () => {
        this.cargando = false;
        this.modalService.showError('No se pudieron cargar citas.');
      }
    });
  }

  fh(fecha: string): string {
    return new Date(fecha).toLocaleString('es-MX', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' });
  }
}


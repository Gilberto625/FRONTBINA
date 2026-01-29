import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SecretariaService } from '../../services/secretaria.service';
import { ModalService } from '../../services/modal.service';
import { CitaService, Servicio, Barbero, Silla } from '../../services/cita.service';

@Component({
  selector: 'app-secretaria-crear-cita',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './secretaria-crear-cita.component.html',
  styleUrl: './secretaria-crear-cita.component.css'
})
export class SecretariaCrearCitaComponent implements OnInit {
  cargando = false;
  guardando = false;

  servicios: Servicio[] = [];
  barberos: Barbero[] = [];
  sillas: Silla[] = [];

  form = {
    cliente_id: '',
    servicio_id: '',
    fecha: '',
    hora: '',
    barbero_id: '',
    silla_id: '',
    anticipo_pagado: '',
    metodo_pago_anticipo: '',
    notas: ''
  };

  constructor(
    private secretariaService: SecretariaService,
    private citaService: CitaService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const hoy = new Date();
    this.form.fecha = hoy.toISOString().split('T')[0];
    this.form.hora = '10:00';
    this.cargarCatalogos();
  }

  cargarCatalogos(): void {
    this.cargando = true;
    let pend = 3;

    this.citaService.obtenerServicios().subscribe({
      next: (r: any) => {
        if (r?.exito) this.servicios = r.datos?.servicios || [];
        pend--; if (pend === 0) this.cargando = false;
      },
      error: () => { pend--; if (pend === 0) this.cargando = false; }
    });

    this.citaService.obtenerBarberos().subscribe({
      next: (r: any) => {
        if (r?.exito) this.barberos = r.datos?.barberos || [];
        pend--; if (pend === 0) this.cargando = false;
      },
      error: () => { pend--; if (pend === 0) this.cargando = false; }
    });

    // Sillas: no hay endpoint general; usamos sillas disponibles sin filtros (backend lo permite)
    this.citaService.obtenerSillasDisponibles().subscribe({
      next: (r: any) => {
        if (r?.exito) this.sillas = r.datos?.sillas || [];
        pend--; if (pend === 0) this.cargando = false;
      },
      error: () => { pend--; if (pend === 0) this.cargando = false; }
    });
  }

  async guardar(): Promise<void> {
    if (!this.form.cliente_id || !this.form.servicio_id || !this.form.fecha || !this.form.hora) {
      this.modalService.mostrarError('Error', 'cliente_id, servicio, fecha y hora son requeridos.');
      return;
    }

    const fechaHora = `${this.form.fecha}T${this.form.hora}:00Z`;
    const payload: any = {
      cliente_id: Number(this.form.cliente_id),
      servicio_id: Number(this.form.servicio_id),
      fecha_hora: fechaHora,
      notas: this.form.notas || ''
    };
    if (this.form.barbero_id) payload.barbero_id = Number(this.form.barbero_id);
    if (this.form.silla_id) payload.silla_id = Number(this.form.silla_id);
    if (this.form.anticipo_pagado) payload.anticipo_pagado = Number(this.form.anticipo_pagado);
    if (this.form.metodo_pago_anticipo) payload.metodo_pago_anticipo = this.form.metodo_pago_anticipo;

    this.guardando = true;
    this.secretariaService.crearCitaManual(payload).subscribe({
      next: async (r: any) => {
        this.guardando = false;
        if (r?.exito) {
          await this.modalService.mostrarExito('Cita creada', `Cita #${r.datos?.cita?.id} creada.`);
          this.router.navigate(['/secretaria/agenda']);
        } else {
          this.modalService.mostrarError('Error', r?.mensaje || 'No se pudo crear la cita.');
        }
      },
      error: (e: any) => {
        this.guardando = false;
        const msg = e?.error?.mensaje || e?.error?.error || 'No se pudo crear la cita.';
        this.modalService.mostrarError('Error', msg);
      }
    });
  }
}


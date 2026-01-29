import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { SecretariaService, CitaAgenda } from '../../services/secretaria.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-secretaria-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './secretaria-agenda.component.html',
  styleUrl: './secretaria-agenda.component.css'
})
export class SecretariaAgendaComponent implements OnInit {
  citas: CitaAgenda[] = [];
  citasFiltradas: CitaAgenda[] = [];
  cargando = false;
  
  filtros = {
    fecha_inicio: '',
    fecha_fin: '',
    estado: '',
    barbero_id: ''
  };

  estados = [
    { valor: '', label: 'Todos' },
    { valor: 'pendiente', label: 'Pendiente' },
    { valor: 'confirmada', label: 'Confirmada' },
    { valor: 'completada', label: 'Completada' },
    { valor: 'cancelada', label: 'Cancelada' }
  ];

  constructor(
    private secretariaService: SecretariaService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFechas();
    this.cargarAgenda();
  }

  inicializarFechas(): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    this.filtros.fecha_inicio = hoy.toISOString().split('T')[0];
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 7);
    this.filtros.fecha_fin = manana.toISOString().split('T')[0];
  }

  cargarAgenda(): void {
    this.cargando = true;
    const filtros: any = {};
    if (this.filtros.fecha_inicio) filtros.fecha_inicio = this.filtros.fecha_inicio + 'T00:00:00Z';
    if (this.filtros.fecha_fin) filtros.fecha_fin = this.filtros.fecha_fin + 'T23:59:59Z';
    if (this.filtros.estado) filtros.estado = this.filtros.estado;
    if (this.filtros.barbero_id) filtros.barbero_id = parseInt(this.filtros.barbero_id);

    this.secretariaService.obtenerAgenda(filtros).subscribe({
      next: (response) => {
        if (response.exito) {
          this.citas = response.datos?.citas || [];
          this.citasFiltradas = this.citas;
        } else {
          this.modalService.showError(response.mensaje || 'Error al cargar agenda');
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar agenda:', error);
        this.modalService.showError('Error al cargar la agenda');
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    this.cargarAgenda();
  }

  formatearFecha(fecha: string): string {
    const d = new Date(fecha);
    return d.toLocaleString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerEstadoClass(estado: string): string {
    return `estado-${estado}`;
  }

  verDetalle(cita: CitaAgenda): void {
    this.router.navigate(['/secretaria/citas', cita.id]);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CitaService, Cita } from '../../services/cita.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-citas.component.html',
  styleUrl: './mis-citas.component.css'
})
export class MisCitasComponent implements OnInit {
  citas: Cita[] = [];
  citasFiltradas: Cita[] = [];
  cargando: boolean = false;
  filtroEstado: string = 'todas';
  
  estadosDisponibles = [
    { valor: 'todas', label: 'Todas' },
    { valor: 'pendiente', label: 'Pendientes' },
    { valor: 'confirmada', label: 'Confirmadas' },
    { valor: 'completada', label: 'Completadas' },
    { valor: 'cancelada', label: 'Canceladas' }
  ];

  constructor(
    private citaService: CitaService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarCitas();
  }

  cargarCitas(): void {
    this.cargando = true;
    this.citaService.obtenerMisCitas().subscribe({
      next: (response) => {
        if (response.exito) {
          this.citas = response.datos.citas || [];
          this.aplicarFiltro();
        } else {
          this.modalService.mostrarError('Error', response.mensaje || 'No se pudieron cargar las citas');
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.modalService.mostrarError('Error', 'No se pudieron cargar las citas. Por favor, intenta nuevamente.');
        this.cargando = false;
      }
    });
  }

  aplicarFiltro(): void {
    if (this.filtroEstado === 'todas') {
      this.citasFiltradas = this.citas;
    } else {
      this.citasFiltradas = this.citas.filter(cita => cita.estado === this.filtroEstado);
    }
  }

  onFiltroChange(): void {
    this.aplicarFiltro();
  }

  cancelarCita(cita: Cita): void {
    this.modalService.mostrarConfirmacion(
      'Cancelar Cita',
      '¿Estás seguro de que deseas cancelar esta cita?',
      'Cancelar',
      'Confirmar'
    ).then((confirmado) => {
      if (confirmado) {
        this.procesarCancelacion(cita);
      }
    });
  }

  private procesarCancelacion(cita: Cita): void {
    this.citaService.cancelarCita(cita.id).subscribe({
      next: (response) => {
        if (response.exito) {
          this.modalService.mostrarExito('Cita Cancelada', 'Tu cita ha sido cancelada exitosamente.')
            .then(() => {
              this.cargarCitas();
            });
        } else {
          this.modalService.mostrarError('Error', response.mensaje || 'No se pudo cancelar la cita');
        }
      },
      error: (error) => {
        console.error('Error al cancelar cita:', error);
        const mensaje = error.error?.mensaje || 'No se pudo cancelar la cita. Por favor, intenta nuevamente.';
        this.modalService.mostrarError('Error', mensaje);
      }
    });
  }

  verDetalle(cita: Cita): void {
    // Navegar a detalle de cita o mostrar modal
    this.router.navigate(['/citas', cita.id]);
  }

  agendarNueva(): void {
    this.router.navigate(['/agendar-cita']);
  }

  formatearFecha(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearHora(fechaHora: string): string {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  }

  obtenerEstadoLabel(estado: string): string {
    const estados: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    };
    return estados[estado] || estado;
  }

  obtenerEstadoClass(estado: string): string {
    return `estado-${estado}`;
  }

  nombreServicio(cita: any): string {
    const s = cita?.servicio;
    if (s && typeof s === 'object' && s.nombre) return s.nombre;
    return 'N/A';
  }

  nombreBarbero(cita: any): string {
    const b = cita?.barbero;
    if (b && typeof b === 'object' && (b.nombre || b.email)) return b.nombre || b.email;
    return 'N/A';
  }

  nombreSilla(cita: any): string {
    const s = cita?.silla;
    if (!s) return 'N/A';
    if (typeof s === 'object') return `Silla ${s.numero ?? ''}`.trim();
    return String(s);
  }

  puedeCancelar(cita: Cita): boolean {
    return cita.puede_cancelar === true && (cita.estado === 'pendiente' || cita.estado === 'confirmada');
  }
}

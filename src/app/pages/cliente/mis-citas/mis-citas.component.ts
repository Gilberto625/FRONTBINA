import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CitasService } from '../../../services/citas.service';

interface CitaHistorial {
  id: number;
  fecha: string;
  hora: string;
  barbero: string;
  barbero_foto?: string;
  servicios: string[];
  duracion: number;
  precio: number;
  estado: 'completada' | 'cancelada' | 'no_asistio' | 'confirmada' | 'pendiente';
  calificacion?: number;
  comentario?: string;
  puede_cancelar: boolean;
  puede_reprogramar: boolean;
  puede_calificar: boolean;
  fecha_creacion: string;
}

@Component({
  selector: 'app-mis-citas',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './mis-citas.component.html',
  styleUrls: ['./mis-citas.component.css']
})
export class MisCitasComponent implements OnInit {
  citas: CitaHistorial[] = [];
  citasFiltradas: CitaHistorial[] = [];
  
  isLoading = true;
  error: string | null = null;
  
  // Filtros
  filtroEstado = 'todas';
  filtroFecha = 'todas';
  filtroBarbero = 'todos';
  
  // Paginación
  paginaActual = 1;
  citasPorPagina = 10;
  totalPaginas = 0;
  
  // Modal de calificación
  mostrarModalCalificacion = false;
  citaCalificar: CitaHistorial | null = null;
  calificacionNueva = 5;
  comentarioNuevo = '';
  
  // Modal de cancelación
  mostrarModalCancelacion = false;
  citaCancelar: CitaHistorial | null = null;
  motivoCancelacion = '';

  // Mock data
  mockCitas: CitaHistorial[] = [
    {
      id: 1,
      fecha: '2024-01-20',
      hora: '10:00',
      barbero: 'Carlos Mendoza',
      barbero_foto: 'assets/images/barbero-carlos.jpg',
      servicios: ['Corte Clásico', 'Arreglo Barba'],
      duracion: 45,
      precio: 250,
      estado: 'completada',
      calificacion: 5,
      comentario: 'Excelente servicio, muy profesional',
      puede_cancelar: false,
      puede_reprogramar: false,
      puede_calificar: false,
      fecha_creacion: '2024-01-18'
    },
    {
      id: 2,
      fecha: '2024-01-25',
      hora: '15:30',
      barbero: 'Miguel Torres',
      barbero_foto: 'assets/images/barbero-miguel.jpg',
      servicios: ['Corte Moderno', 'Peinado'],
      duracion: 40,
      precio: 200,
      estado: 'confirmada',
      puede_cancelar: true,
      puede_reprogramar: true,
      puede_calificar: false,
      fecha_creacion: '2024-01-23'
    },
    {
      id: 3,
      fecha: '2024-01-15',
      hora: '11:30',
      barbero: 'Antonio Ruiz',
      barbero_foto: 'assets/images/barbero-antonio.jpg',
      servicios: ['Combo Completo'],
      duracion: 60,
      precio: 300,
      estado: 'completada',
      puede_cancelar: false,
      puede_reprogramar: false,
      puede_calificar: true,
      fecha_creacion: '2024-01-13'
    },
    {
      id: 4,
      fecha: '2024-01-10',
      hora: '14:00',
      barbero: 'Carlos Mendoza',
      servicios: ['Tratamiento Capilar'],
      duracion: 40,
      precio: 250,
      estado: 'cancelada',
      puede_cancelar: false,
      puede_reprogramar: false,
      puede_calificar: false,
      fecha_creacion: '2024-01-08'
    },
    {
      id: 5,
      fecha: '2024-01-05',
      hora: '09:00',
      barbero: 'Miguel Torres',
      servicios: ['Corte Clásico'],
      duracion: 30,
      precio: 150,
      estado: 'no_asistio',
      puede_cancelar: false,
      puede_reprogramar: false,
      puede_calificar: false,
      fecha_creacion: '2024-01-03'
    },
    {
      id: 6,
      fecha: '2024-02-02',
      hora: '11:00',
      barbero: 'Antonio Ruiz',
      servicios: ['Arreglo Barba', 'Tratamiento'],
      duracion: 50,
      precio: 280,
      estado: 'pendiente',
      puede_cancelar: true,
      puede_reprogramar: true,
      puede_calificar: false,
      fecha_creacion: '2024-01-30'
    }
  ];

  constructor(
    private authService: AuthService,
    private citasService: CitasService
  ) {}

  ngOnInit(): void {
    this.loadCitas();
  }

  private async loadCitas(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      // Usar datos mock por ahora
      this.citas = this.mockCitas.sort((a, b) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      
      this.aplicarFiltros();

    } catch (error) {
      console.error('Error loading citas:', error);
      this.error = 'Error al cargar el historial de citas.';
    } finally {
      this.isLoading = false;
    }
  }

  aplicarFiltros(): void {
    let citasFiltradas = [...this.citas];

    // Filtro por estado
    if (this.filtroEstado !== 'todas') {
      citasFiltradas = citasFiltradas.filter(cita => cita.estado === this.filtroEstado);
    }

    // Filtro por fecha
    if (this.filtroFecha !== 'todas') {
      const ahora = new Date();
      const fechaLimite = new Date();
      
      switch (this.filtroFecha) {
        case 'proximas':
          citasFiltradas = citasFiltradas.filter(cita => 
            new Date(cita.fecha) >= ahora
          );
          break;
        case 'pasadas':
          citasFiltradas = citasFiltradas.filter(cita => 
            new Date(cita.fecha) < ahora
          );
          break;
        case 'mes':
          fechaLimite.setMonth(ahora.getMonth() - 1);
          citasFiltradas = citasFiltradas.filter(cita => 
            new Date(cita.fecha) >= fechaLimite
          );
          break;
      }
    }

    // Filtro por barbero
    if (this.filtroBarbero !== 'todos') {
      citasFiltradas = citasFiltradas.filter(cita => cita.barbero === this.filtroBarbero);
    }

    this.citasFiltradas = citasFiltradas;
    this.calcularPaginacion();
  }

  private calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(this.citasFiltradas.length / this.citasPorPagina);
    this.paginaActual = Math.min(this.paginaActual, this.totalPaginas || 1);
  }

  get citasPaginadas(): CitaHistorial[] {
    const inicio = (this.paginaActual - 1) * this.citasPorPagina;
    const fin = inicio + this.citasPorPagina;
    return this.citasFiltradas.slice(inicio, fin);
  }

  get barberos(): string[] {
    const barberos = [...new Set(this.citas.map(cita => cita.barbero))];
    return barberos.sort();
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  // Acciones de citas
  abrirModalCancelacion(cita: CitaHistorial): void {
    this.citaCancelar = cita;
    this.motivoCancelacion = '';
    this.mostrarModalCancelacion = true;
  }

  async cancelarCita(): Promise<void> {
    if (!this.citaCancelar || !this.motivoCancelacion.trim()) return;

    try {
      // Simular cancelación
      this.citaCancelar.estado = 'cancelada';
      this.citaCancelar.puede_cancelar = false;
      this.citaCancelar.puede_reprogramar = false;
      
      this.cerrarModalCancelacion();
      this.showToast('Cita cancelada exitosamente', 'success');
      
    } catch (error) {
      console.error('Error cancelando cita:', error);
      this.showToast('Error al cancelar la cita', 'error');
    }
  }

  cerrarModalCancelacion(): void {
    this.mostrarModalCancelacion = false;
    this.citaCancelar = null;
    this.motivoCancelacion = '';
  }

  abrirModalCalificacion(cita: CitaHistorial): void {
    this.citaCalificar = cita;
    this.calificacionNueva = cita.calificacion || 5;
    this.comentarioNuevo = cita.comentario || '';
    this.mostrarModalCalificacion = true;
  }

  async guardarCalificacion(): Promise<void> {
    if (!this.citaCalificar) return;

    try {
      this.citaCalificar.calificacion = this.calificacionNueva;
      this.citaCalificar.comentario = this.comentarioNuevo;
      this.citaCalificar.puede_calificar = false;
      
      this.cerrarModalCalificacion();
      this.showToast('Calificación guardada exitosamente', 'success');
      
    } catch (error) {
      console.error('Error guardando calificación:', error);
      this.showToast('Error al guardar la calificación', 'error');
    }
  }

  cerrarModalCalificacion(): void {
    this.mostrarModalCalificacion = false;
    this.citaCalificar = null;
    this.calificacionNueva = 5;
    this.comentarioNuevo = '';
  }

  async reprogramarCita(cita: CitaHistorial): Promise<void> {
    // Redirigir al componente de agendar con datos pre-cargados
    this.showToast('Redirigiendo para reprogramar cita...', 'success');
    // En implementación real, se pasarían los datos de la cita
  }

  private showToast(message: string, type: 'success' | 'error'): void {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 8px;
      color: white;
      background: ${type === 'success' ? '#4CAF50' : '#F44336'};
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Utilidades
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTime(timeString: string): string {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'completada': return 'estado-completada';
      case 'confirmada': return 'estado-confirmada';
      case 'pendiente': return 'estado-pendiente';
      case 'cancelada': return 'estado-cancelada';
      case 'no_asistio': return 'estado-no-asistio';
      default: return 'estado-default';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'completada': return 'Completada';
      case 'confirmada': return 'Confirmada';
      case 'pendiente': return 'Pendiente';
      case 'cancelada': return 'Cancelada';
      case 'no_asistio': return 'No asistió';
      default: return estado;
    }
  }

  getEstadoIcon(estado: string): string {
    switch (estado) {
      case 'completada': return 'check-circle';
      case 'confirmada': return 'calendar-check';
      case 'pendiente': return 'clock';
      case 'cancelada': return 'x-circle';
      case 'no_asistio': return 'user-x';
      default: return 'circle';
    }
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  setCalificacion(rating: number): void {
    this.calificacionNueva = rating;
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }
}

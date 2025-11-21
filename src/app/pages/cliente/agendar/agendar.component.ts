import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CitasService } from '../../../services/citas.service';
import { AuthService } from '../../../services/auth.service';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number; // en minutos
  categoria: string;
  imagen?: string;
  activo: boolean;
}

interface Barbero {
  id: number;
  nombre: string;
  apellido: string;
  especialidades: string[];
  foto?: string;
  calificacion: number;
  disponible: boolean;
}

interface HorarioDisponible {
  fecha: string;
  horas: string[];
}

@Component({
  selector: 'app-agendar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './agendar.component.html',
  styleUrls: ['./agendar.component.css']
})
export class AgendarComponent implements OnInit {
  // Estados del proceso
  pasoActual = 1;
  totalPasos = 4;
  
  // Datos seleccionados
  serviciosSeleccionados: Servicio[] = [];
  barberoSeleccionado: Barbero | null = null;
  fechaSeleccionada = '';
  horaSeleccionada = '';
  
  // Datos disponibles
  servicios: Servicio[] = [];
  barberos: Barbero[] = [];
  horariosDisponibles: HorarioDisponible[] = [];
  
  // Estados
  isLoading = false;
  error: string | null = null;
  isProcessing = false;
  
  // Filtros
  categoriaFiltro = 'Todas';
  categorias: string[] = ['Todas', 'Corte de Cabello', 'Barba', 'Tratamientos', 'Combos'];
  
  // Mock data
  mockServicios: Servicio[] = [
    {
      id: 1,
      nombre: 'Corte de Cabello Clásico',
      descripcion: 'Corte tradicional con tijera y máquina',
      precio: 150,
      duracion: 30,
      categoria: 'Corte de Cabello',
      imagen: 'assets/images/corte-clasico.jpg',
      activo: true
    },
    {
      id: 2,
      nombre: 'Corte Moderno + Peinado',
      descripcion: 'Corte actual con peinado y productos',
      precio: 200,
      duracion: 45,
      categoria: 'Corte de Cabello',
      imagen: 'assets/images/corte-moderno.jpg',
      activo: true
    },
    {
      id: 3,
      nombre: 'Arreglo de Barba',
      descripcion: 'Recorte y perfilado de barba',
      precio: 100,
      duracion: 20,
      categoria: 'Barba',
      imagen: 'assets/images/arreglo-barba.jpg',
      activo: true
    },
    {
      id: 4,
      nombre: 'Combo Completo',
      descripcion: 'Corte + Barba + Tratamiento',
      precio: 300,
      duracion: 60,
      categoria: 'Combos',
      imagen: 'assets/images/combo-completo.jpg',
      activo: true
    },
    {
      id: 5,
      nombre: 'Tratamiento Capilar',
      descripcion: 'Hidratación y nutrición del cabello',
      precio: 250,
      duracion: 40,
      categoria: 'Tratamientos',
      imagen: 'assets/images/tratamiento.jpg',
      activo: true
    }
  ];

  mockBarberos: Barbero[] = [
    {
      id: 1,
      nombre: 'Carlos',
      apellido: 'Mendoza',
      especialidades: ['Cortes Clásicos', 'Barba', 'Tratamientos'],
      foto: 'assets/images/barbero-carlos.jpg',
      calificacion: 4.9,
      disponible: true
    },
    {
      id: 2,
      nombre: 'Miguel',
      apellido: 'Torres',
      especialidades: ['Cortes Modernos', 'Peinados', 'Combos'],
      foto: 'assets/images/barbero-miguel.jpg',
      calificacion: 4.8,
      disponible: true
    },
    {
      id: 3,
      nombre: 'Antonio',
      apellido: 'Ruiz',
      especialidades: ['Barba', 'Tratamientos', 'Cortes Clásicos'],
      foto: 'assets/images/barbero-antonio.jpg',
      calificacion: 4.7,
      disponible: true
    }
  ];

  constructor(
    private citasService: CitasService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadServicios();
  }

  private async loadServicios(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      
      // Usar datos mock por ahora
      this.servicios = this.mockServicios;
      this.barberos = this.mockBarberos;
      
    } catch (error) {
      console.error('Error loading servicios:', error);
      this.error = 'Error al cargar los servicios disponibles.';
    } finally {
      this.isLoading = false;
    }
  }

  // Paso 1: Selección de servicios
  toggleServicio(servicio: Servicio): void {
    const index = this.serviciosSeleccionados.findIndex(s => s.id === servicio.id);
    
    if (index >= 0) {
      this.serviciosSeleccionados.splice(index, 1);
    } else {
      this.serviciosSeleccionados.push(servicio);
    }
  }

  isServicioSeleccionado(servicio: Servicio): boolean {
    return this.serviciosSeleccionados.some(s => s.id === servicio.id);
  }

  get serviciosFiltrados(): Servicio[] {
    if (this.categoriaFiltro === 'Todas') {
      return this.servicios;
    }
    return this.servicios.filter(s => s.categoria === this.categoriaFiltro);
  }

  // Paso 2: Selección de barbero
  seleccionarBarbero(barbero: Barbero): void {
    this.barberoSeleccionado = barbero;
  }

  // Paso 3: Selección de fecha y hora
  async loadHorariosDisponibles(): Promise<void> {
    if (!this.barberoSeleccionado) return;

    try {
      this.isLoading = true;
      
      // Mock de horarios disponibles
      const fechasDisponibles = this.getProximasFechas(14);
      this.horariosDisponibles = fechasDisponibles.map(fecha => ({
        fecha,
        horas: this.getHorasDisponibles(fecha)
      }));
      
    } catch (error) {
      console.error('Error loading horarios:', error);
      this.error = 'Error al cargar horarios disponibles.';
    } finally {
      this.isLoading = false;
    }
  }

  private getProximasFechas(dias: number): string[] {
    const fechas: string[] = [];
    const hoy = new Date();
    
    for (let i = 1; i <= dias; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      
      // Saltar domingos (día 0)
      if (fecha.getDay() !== 0) {
        fechas.push(fecha.toISOString().split('T')[0]);
      }
    }
    
    return fechas;
  }

  private getHorasDisponibles(fecha: string): string[] {
    // Mock de horas disponibles (9:00 AM a 7:00 PM)
    const horas = [];
    for (let hora = 9; hora <= 19; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        
        // Simular algunas horas ocupadas
        const ocupadas = ['12:00', '12:30', '15:30', '16:00'];
        if (!ocupadas.includes(horaStr)) {
          horas.push(horaStr);
        }
      }
    }
    return horas;
  }

  seleccionarFecha(fecha: string): void {
    this.fechaSeleccionada = fecha;
    this.horaSeleccionada = ''; // Reset hora
  }

  seleccionarHora(hora: string): void {
    this.horaSeleccionada = hora;
  }

  // Navegación entre pasos
  siguientePaso(): void {
    if (this.pasoActual < this.totalPasos) {
      if (this.pasoActual === 2 && this.barberoSeleccionado) {
        this.loadHorariosDisponibles();
      }
      this.pasoActual++;
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
    }
  }

  // Validaciones
  get puedeAvanzarPaso1(): boolean {
    return this.serviciosSeleccionados.length > 0;
  }

  get puedeAvanzarPaso2(): boolean {
    return this.barberoSeleccionado !== null;
  }

  get puedeAvanzarPaso3(): boolean {
    return this.fechaSeleccionada !== '' && this.horaSeleccionada !== '';
  }

  // Cálculos
  get duracionTotal(): number {
    return this.serviciosSeleccionados.reduce((total, servicio) => total + servicio.duracion, 0);
  }

  get precioTotal(): number {
    return this.serviciosSeleccionados.reduce((total, servicio) => total + servicio.precio, 0);
  }

  get requiereAnticipo(): boolean {
    // Lógica de negocio: primera cita no requiere anticipo
    return false; // Por ahora siempre false
  }

  get montoAnticipo(): number {
    return this.requiereAnticipo ? this.precioTotal * 0.5 : 0;
  }

  // Confirmación
  async confirmarCita(): Promise<void> {
    try {
      this.isProcessing = true;
      
      const datosCita = {
        servicios: this.serviciosSeleccionados.map(s => s.id),
        barbero_id: this.barberoSeleccionado!.id,
        fecha: this.fechaSeleccionada,
        hora: this.horaSeleccionada,
        precio_total: this.precioTotal,
        duracion_total: this.duracionTotal,
        requiere_anticipo: this.requiereAnticipo,
        monto_anticipo: this.montoAnticipo
      };
      
      // Mock de creación de cita
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.showToast('¡Cita agendada exitosamente!', 'success');
      
      // Redirigir a mis citas
      this.router.navigate(['/cliente/mis-citas']);
      
    } catch (error) {
      console.error('Error confirmando cita:', error);
      this.showToast('Error al agendar la cita', 'error');
    } finally {
      this.isProcessing = false;
    }
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

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}

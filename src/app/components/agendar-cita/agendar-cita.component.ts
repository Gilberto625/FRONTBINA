import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CitaService, Servicio, Barbero, Silla } from '../../services/cita.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-agendar-cita',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agendar-cita.component.html',
  styleUrl: './agendar-cita.component.css'
})
export class AgendarCitaComponent implements OnInit {
  servicios: Servicio[] = [];
  barberos: Barbero[] = [];
  sillas: Silla[] = [];
  horariosDisponibles: string[] = [];
  
  // Paso actual del proceso
  pasoActual: number = 1; // 1: Servicio, 2: Barbero, 3: Fecha/Hora, 4: Confirmación
  
  // Datos seleccionados
  servicioSeleccionado: Servicio | null = null;
  barberoSeleccionado: Barbero | null = null;
  sillaSeleccionada: Silla | null = null;
  fechaSeleccionada: string = '';
  horarioSeleccionado: string = '';
  
  // Estados de carga
  cargandoServicios: boolean = false;
  cargandoBarberos: boolean = false;
  cargandoSillas: boolean = false;
  cargandoHorarios: boolean = false;
  guardando: boolean = false;
  
  // Fechas
  fechaMinima: string = '';
  fechaMaxima: string = '';
  fechaActual: string = '';

  constructor(
    private citaService: CitaService,
    private authService: AuthService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFechas();
    this.cargarServicios();
  }

  private inicializarFechas(): void {
    const hoy = new Date();
    const en30Dias = new Date();
    en30Dias.setDate(hoy.getDate() + 30);
    
    this.fechaActual = hoy.toISOString().split('T')[0];
    this.fechaMinima = hoy.toISOString().split('T')[0];
    this.fechaMaxima = en30Dias.toISOString().split('T')[0];
  }

  cargarServicios(): void {
    this.cargandoServicios = true;
    this.citaService.obtenerServicios().subscribe({
      next: (response) => {
        if (response.exito) {
          this.servicios = response.datos.servicios || [];
        } else {
          this.modalService.mostrarError('Error', response.mensaje || 'No se pudieron cargar los servicios');
        }
        this.cargandoServicios = false;
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
        this.modalService.mostrarError('Error', 'No se pudieron cargar los servicios. Por favor, intenta nuevamente.');
        this.cargandoServicios = false;
      }
    });
  }

  seleccionarServicio(servicio: Servicio): void {
    this.servicioSeleccionado = servicio;
    this.pasoActual = 2;
    this.cargarBarberos();
  }

  cargarBarberos(): void {
    this.cargandoBarberos = true;
    this.citaService.obtenerBarberos().subscribe({
      next: (response) => {
        if (response.exito) {
          this.barberos = response.datos.barberos || [];
        } else {
          this.modalService.mostrarError('Error', response.mensaje || 'No se pudieron cargar los barberos');
        }
        this.cargandoBarberos = false;
      },
      error: (error) => {
        console.error('Error al cargar barberos:', error);
        this.modalService.mostrarError('Error', 'No se pudieron cargar los barberos. Por favor, intenta nuevamente.');
        this.cargandoBarberos = false;
      }
    });
  }

  seleccionarBarbero(barbero: Barbero): void {
    this.barberoSeleccionado = barbero;
    this.pasoActual = 3;
    this.cargarSillas();
  }

  cargarSillas(): void {
    if (!this.fechaSeleccionada || !this.servicioSeleccionado) {
      return;
    }
    
    this.cargandoSillas = true;
    this.citaService.obtenerSillasDisponibles(this.fechaSeleccionada, this.servicioSeleccionado.id).subscribe({
      next: (response) => {
        if (response.exito) {
          this.sillas = response.datos.sillas || [];
        } else {
          this.modalService.mostrarError('Error', response.mensaje || 'No se pudieron cargar las sillas');
        }
        this.cargandoSillas = false;
      },
      error: (error) => {
        console.error('Error al cargar sillas:', error);
        this.modalService.mostrarError('Error', 'No se pudieron cargar las sillas. Por favor, intenta nuevamente.');
        this.cargandoSillas = false;
      }
    });
  }

  onFechaChange(): void {
    if (this.fechaSeleccionada && this.barberoSeleccionado && this.servicioSeleccionado) {
      this.cargarHorarios();
      this.cargarSillas();
    }
  }

  cargarHorarios(): void {
    if (!this.fechaSeleccionada || !this.barberoSeleccionado || !this.servicioSeleccionado) {
      return;
    }
    
    this.cargandoHorarios = true;
    this.citaService.obtenerHorariosDisponibles(
      this.barberoSeleccionado.id,
      this.fechaSeleccionada,
      this.servicioSeleccionado.id
    ).subscribe({
      next: (response) => {
        if (response.exito) {
          this.horariosDisponibles = response.datos.horarios_disponibles || [];
        } else {
          this.modalService.mostrarError('Error', response.mensaje || 'No se pudieron cargar los horarios');
        }
        this.cargandoHorarios = false;
      },
      error: (error) => {
        console.error('Error al cargar horarios:', error);
        this.modalService.mostrarError('Error', 'No se pudieron cargar los horarios. Por favor, intenta nuevamente.');
        this.cargandoHorarios = false;
      }
    });
  }

  seleccionarSilla(silla: Silla): void {
    this.sillaSeleccionada = silla;
  }

  seleccionarHorario(horario: string): void {
    this.horarioSeleccionado = horario;
  }

  puedeContinuar(): boolean {
    switch (this.pasoActual) {
      case 1:
        return this.servicioSeleccionado !== null;
      case 2:
        return this.barberoSeleccionado !== null;
      case 3:
        return this.fechaSeleccionada !== '' && 
               this.horarioSeleccionado !== '' && 
               this.sillaSeleccionada !== null;
      default:
        return false;
    }
  }

  siguientePaso(): void {
    if (this.pasoActual === 3 && this.puedeContinuar()) {
      this.pasoActual = 4; // Confirmación
    }
  }

  pasoAnterior(): void {
    if (this.pasoActual > 1) {
      this.pasoActual--;
      
      // Limpiar selecciones según el paso
      if (this.pasoActual === 1) {
        this.barberoSeleccionado = null;
        this.sillaSeleccionada = null;
        this.fechaSeleccionada = '';
        this.horarioSeleccionado = '';
        this.horariosDisponibles = [];
      } else if (this.pasoActual === 2) {
        this.sillaSeleccionada = null;
        this.fechaSeleccionada = '';
        this.horarioSeleccionado = '';
        this.horariosDisponibles = [];
      }
    }
  }

  confirmarCita(): void {
    if (!this.servicioSeleccionado || !this.barberoSeleccionado || !this.sillaSeleccionada || 
        !this.fechaSeleccionada || !this.horarioSeleccionado) {
      this.modalService.mostrarError('Error', 'Por favor, completa todos los campos');
      return;
    }

    const fechaHora = `${this.fechaSeleccionada}T${this.horarioSeleccionado}:00`;
    
    this.guardando = true;
    this.citaService.agendarCita(
      this.servicioSeleccionado.id,
      this.barberoSeleccionado.id,
      this.sillaSeleccionada.id,
      fechaHora
    ).subscribe({
      next: (response) => {
        this.guardando = false;
        if (response.exito) {
          this.modalService.mostrarExito(
            'Cita Agendada',
            'Tu cita ha sido agendada exitosamente. Te hemos enviado un correo de confirmación.'
          ).then(() => {
            this.router.navigate(['/mis-citas']);
          });
        } else {
          this.modalService.mostrarError('Error', response.mensaje || 'No se pudo agendar la cita');
        }
      },
      error: (error) => {
        this.guardando = false;
        console.error('Error al agendar cita:', error);
        const mensaje = error.error?.mensaje || 'No se pudo agendar la cita. Por favor, intenta nuevamente.';
        this.modalService.mostrarError('Error', mensaje);
      }
    });
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(precio);
  }

  formatearDuracion(minutos: number): string {
    if (minutos < 60) {
      return `${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  }
}

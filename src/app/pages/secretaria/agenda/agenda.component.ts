import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CitasService } from '../../../services/citas.service';

interface CitaAgenda {
  id: number;
  cliente: string;
  telefono: string;
  email?: string;
  barbero: string;
  barbero_id: number;
  silla: number;
  servicios: string[];
  fecha: string;
  hora: string;
  duracion: number;
  precio: number;
  estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';
  anticipo_pagado: boolean;
  tipo_cita: 'online' | 'presencial' | 'telefonica';
  notas?: string;
}

interface Barbero {
  id: number;
  nombre: string;
  apellido: string;
  activo: boolean;
  color: string;
}

interface Servicio {
  id: number;
  nombre: string;
  duracion: number;
  precio: number;
  categoria: string;
}

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class AgendaComponent implements OnInit {
  citas: CitaAgenda[] = [];
  barberos: Barbero[] = [];
  servicios: Servicio[] = [];
  
  // Vista actual
  vistaActual: 'dia' | 'semana' = 'dia';
  fechaSeleccionada = new Date();
  
  // Estados
  isLoading = true;
  error: string | null = null;
  
  // Modal nueva cita
  mostrarModalNuevaCita = false;
  nuevaCita = {
    cliente: '',
    telefono: '',
    email: '',
    barbero_id: 0,
    silla: 1,
    servicios_ids: [] as number[],
    fecha: '',
    hora: '',
    tipo_cita: 'presencial' as 'online' | 'presencial' | 'telefonica',
    notas: ''
  };
  
  // Horarios disponibles
  horariosDisponibles: string[] = [];
  sillasDisponibles: number[] = [1, 2, 3, 4];

  // Mock data
  mockBarberos: Barbero[] = [
    { id: 1, nombre: 'Carlos', apellido: 'Mendoza', activo: true, color: '#3B82F6' },
    { id: 2, nombre: 'Miguel', apellido: 'Torres', activo: true, color: '#10B981' },
    { id: 3, nombre: 'Antonio', apellido: 'Ruiz', activo: true, color: '#F59E0B' }
  ];

  mockServicios: Servicio[] = [
    { id: 1, nombre: 'Corte Clásico', duracion: 30, precio: 150, categoria: 'Corte' },
    { id: 2, nombre: 'Corte Moderno', duracion: 35, precio: 200, categoria: 'Corte' },
    { id: 3, nombre: 'Arreglo Barba', duracion: 20, precio: 100, categoria: 'Barba' },
    { id: 4, nombre: 'Combo Completo', duracion: 60, precio: 300, categoria: 'Combo' },
    { id: 5, nombre: 'Tratamiento Capilar', duracion: 40, precio: 250, categoria: 'Tratamiento' }
  ];

  mockCitas: CitaAgenda[] = [
    {
      id: 1,
      cliente: 'Juan Pérez',
      telefono: '555-0123',
      email: 'juan@email.com',
      barbero: 'Carlos Mendoza',
      barbero_id: 1,
      silla: 1,
      servicios: ['Corte Clásico', 'Arreglo Barba'],
      fecha: '2024-01-21',
      hora: '09:00',
      duracion: 50,
      precio: 250,
      estado: 'confirmada',
      anticipo_pagado: true,
      tipo_cita: 'online'
    },
    {
      id: 2,
      cliente: 'María González',
      telefono: '555-0456',
      barbero: 'Miguel Torres',
      barbero_id: 2,
      silla: 2,
      servicios: ['Corte Moderno'],
      fecha: '2024-01-21',
      hora: '10:30',
      duracion: 35,
      precio: 200,
      estado: 'pendiente',
      anticipo_pagado: false,
      tipo_cita: 'telefonica',
      notas: 'Primera cita - no requiere anticipo'
    },
    {
      id: 3,
      cliente: 'Carlos Ruiz',
      telefono: '555-0789',
      barbero: 'Antonio Ruiz',
      barbero_id: 3,
      silla: 3,
      servicios: ['Combo Completo'],
      fecha: '2024-01-21',
      hora: '11:00',
      duracion: 60,
      precio: 300,
      estado: 'en_proceso',
      anticipo_pagado: true,
      tipo_cita: 'presencial'
    }
  ];

  constructor(
    private authService: AuthService,
    private citasService: CitasService
  ) {}

  ngOnInit(): void {
    this.initializeFecha();
    this.loadData();
    this.generateHorarios();
  }

  private initializeFecha(): void {
    const today = new Date();
    this.fechaSeleccionada = today;
    this.nuevaCita.fecha = today.toISOString().split('T')[0];
  }

  private async loadData(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      // Usar datos mock
      this.barberos = this.mockBarberos;
      this.servicios = this.mockServicios;
      this.citas = this.mockCitas;

    } catch (error) {
      console.error('Error loading data:', error);
      this.error = 'Error al cargar los datos de la agenda.';
    } finally {
      this.isLoading = false;
    }
  }

  private generateHorarios(): void {
    const horarios = [];
    for (let hora = 9; hora <= 19; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaStr = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
        horarios.push(horaStr);
      }
    }
    this.horariosDisponibles = horarios;
  }

  get citasDelDia(): CitaAgenda[] {
    const fechaStr = this.fechaSeleccionada.toISOString().split('T')[0];
    return this.citas
      .filter(cita => cita.fecha === fechaStr)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }

  get citasPorBarbero(): { [key: string]: CitaAgenda[] } {
    const citasAgrupadas: { [key: string]: CitaAgenda[] } = {};
    
    this.barberos.forEach(barbero => {
      const nombreCompleto = `${barbero.nombre} ${barbero.apellido}`;
      citasAgrupadas[nombreCompleto] = this.citasDelDia.filter(cita => cita.barbero === nombreCompleto);
    });
    
    return citasAgrupadas;
  }

  cambiarFecha(dias: number): void {
    const nuevaFecha = new Date(this.fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    this.fechaSeleccionada = nuevaFecha;
    this.nuevaCita.fecha = nuevaFecha.toISOString().split('T')[0];
  }

  abrirModalNuevaCita(): void {
    this.resetNuevaCita();
    this.mostrarModalNuevaCita = true;
  }

  cerrarModalNuevaCita(): void {
    this.mostrarModalNuevaCita = false;
    this.resetNuevaCita();
  }

  private resetNuevaCita(): void {
    this.nuevaCita = {
      cliente: '',
      telefono: '',
      email: '',
      barbero_id: 0,
      silla: 1,
      servicios_ids: [],
      fecha: this.fechaSeleccionada.toISOString().split('T')[0],
      hora: '',
      tipo_cita: 'presencial',
      notas: ''
    };
  }

  toggleServicio(servicioId: number): void {
    const index = this.nuevaCita.servicios_ids.indexOf(servicioId);
    if (index >= 0) {
      this.nuevaCita.servicios_ids.splice(index, 1);
    } else {
      this.nuevaCita.servicios_ids.push(servicioId);
    }
  }

  isServicioSeleccionado(servicioId: number): boolean {
    return this.nuevaCita.servicios_ids.includes(servicioId);
  }

  get serviciosSeleccionados(): Servicio[] {
    return this.servicios.filter(s => this.nuevaCita.servicios_ids.includes(s.id));
  }

  get duracionTotal(): number {
    return this.serviciosSeleccionados.reduce((total, servicio) => total + servicio.duracion, 0);
  }

  get precioTotal(): number {
    return this.serviciosSeleccionados.reduce((total, servicio) => total + servicio.precio, 0);
  }

  async guardarCita(): Promise<void> {
    if (!this.validarCita()) return;

    try {
      const barbero = this.barberos.find(b => b.id === this.nuevaCita.barbero_id);
      const serviciosNombres = this.serviciosSeleccionados.map(s => s.nombre);
      
      const nuevaCitaObj: CitaAgenda = {
        id: Date.now(), // Mock ID
        cliente: this.nuevaCita.cliente,
        telefono: this.nuevaCita.telefono,
        email: this.nuevaCita.email,
        barbero: `${barbero?.nombre} ${barbero?.apellido}`,
        barbero_id: this.nuevaCita.barbero_id,
        silla: this.nuevaCita.silla,
        servicios: serviciosNombres,
        fecha: this.nuevaCita.fecha,
        hora: this.nuevaCita.hora,
        duracion: this.duracionTotal,
        precio: this.precioTotal,
        estado: 'pendiente',
        anticipo_pagado: false,
        tipo_cita: this.nuevaCita.tipo_cita,
        notas: this.nuevaCita.notas
      };

      this.citas.push(nuevaCitaObj);
      this.cerrarModalNuevaCita();
      this.showToast('Cita agendada exitosamente', 'success');

    } catch (error) {
      console.error('Error guardando cita:', error);
      this.showToast('Error al agendar la cita', 'error');
    }
  }

  private validarCita(): boolean {
    if (!this.nuevaCita.cliente.trim()) {
      this.showToast('Ingresa el nombre del cliente', 'error');
      return false;
    }
    if (!this.nuevaCita.telefono.trim()) {
      this.showToast('Ingresa el teléfono del cliente', 'error');
      return false;
    }
    if (!this.nuevaCita.barbero_id) {
      this.showToast('Selecciona un barbero', 'error');
      return false;
    }
    if (this.nuevaCita.servicios_ids.length === 0) {
      this.showToast('Selecciona al menos un servicio', 'error');
      return false;
    }
    if (!this.nuevaCita.hora) {
      this.showToast('Selecciona una hora', 'error');
      return false;
    }
    return true;
  }

  async cambiarEstadoCita(cita: CitaAgenda, nuevoEstado: CitaAgenda['estado']): Promise<void> {
    try {
      cita.estado = nuevoEstado;
      this.showToast(`Cita ${this.getEstadoText(nuevoEstado).toLowerCase()}`, 'success');
    } catch (error) {
      console.error('Error cambiando estado:', error);
      this.showToast('Error al cambiar el estado', 'error');
    }
  }

  async eliminarCita(cita: CitaAgenda): Promise<void> {
    if (!confirm(`¿Eliminar la cita de ${cita.cliente}?`)) return;

    try {
      const index = this.citas.findIndex(c => c.id === cita.id);
      if (index >= 0) {
        this.citas.splice(index, 1);
        this.showToast('Cita eliminada', 'success');
      }
    } catch (error) {
      console.error('Error eliminando cita:', error);
      this.showToast('Error al eliminar la cita', 'error');
    }
  }

  llamarCliente(telefono: string, nombre: string): void {
    this.showToast(`Llamando a ${nombre}...`, 'success');
  }

  enviarWhatsApp(telefono: string, nombre: string): void {
    const mensaje = `Hola ${nombre}, te recordamos tu cita en Tony Stylo. ¡Te esperamos!`;
    const url = `https://wa.me/52${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
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

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-MX', {
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
      case 'confirmada': return 'estado-confirmada';
      case 'pendiente': return 'estado-pendiente';
      case 'en_proceso': return 'estado-proceso';
      case 'completada': return 'estado-completada';
      case 'cancelada': return 'estado-cancelada';
      default: return 'estado-default';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'confirmada': return 'Confirmada';
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En Proceso';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  }

  getTipoCitaIcon(tipo: string): string {
    switch (tipo) {
      case 'online': return 'globe';
      case 'telefonica': return 'phone';
      case 'presencial': return 'user';
      default: return 'calendar';
    }
  }

  getTipoCitaClass(tipo: string): string {
    switch (tipo) {
      case 'online': return 'tipo-online';
      case 'telefonica': return 'tipo-telefonica';
      case 'presencial': return 'tipo-presencial';
      default: return 'tipo-default';
    }
  }

  getBarberoColor(barberoNombre: string): string {
    const barbero = this.barberos.find(b => `${b.nombre} ${b.apellido}` === barberoNombre);
    return barbero?.color || '#6B7280';
  }
}


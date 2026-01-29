import { Injectable, signal, computed } from '@angular/core';
import { Cita, Barbero, HorarioDisponible, Usuario, TipoDemanda } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CitaService {
  
  // Barberos mock
  private barberosData = signal<Barbero[]>([
    {
      id: '1',
      usuario: {
        id: 'u1',
        email: 'carlos@stylobarber.com',
        nombre: 'Carlos',
        apellidos: 'Martínez',
        telefono: '5512345678',
        rol: 'barbero',
        fechaRegistro: new Date(),
        activo: true
      },
      especialidades: ['Degradados', 'Diseños'],
      tiemposServicio: [],
      activo: true,
      calificacion: 4.8
    },
    {
      id: '2',
      usuario: {
        id: 'u2',
        email: 'miguel@stylobarber.com',
        nombre: 'Miguel',
        apellidos: 'Rodríguez',
        telefono: '5512345679',
        rol: 'barbero',
        fechaRegistro: new Date(),
        activo: true
      },
      especialidades: ['Corte Clásico', 'Barba'],
      tiemposServicio: [],
      activo: true,
      calificacion: 4.6
    },
    {
      id: '3',
      usuario: {
        id: 'u3',
        email: 'jose@stylobarber.com',
        nombre: 'José',
        apellidos: 'López',
        telefono: '5512345680',
        rol: 'barbero',
        fechaRegistro: new Date(),
        activo: true
      },
      especialidades: ['Tratamientos', 'Color'],
      tiemposServicio: [],
      activo: true,
      calificacion: 4.9
    }
  ]);

  // Citas mock
  private citasData = signal<Cita[]>([
    {
      id: '1',
      clienteId: 'c1',
      barberoId: '1',
      servicioId: '3',
      fecha: new Date(),
      hora: '10:00',
      duracionMinutos: 45,
      estado: 'confirmada',
      estadoPago: 'parcial',
      precioTotal: 250,
      anticipo: 75,
      anticipoPagado: true,
      fechaCreacion: new Date()
    },
    {
      id: '2',
      clienteId: 'c1',
      barberoId: '2',
      servicioId: '2',
      fecha: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
      hora: '15:30',
      duracionMinutos: 35,
      estado: 'pendiente',
      estadoPago: 'pendiente',
      precioTotal: 180,
      anticipo: 54,
      anticipoPagado: false,
      fechaCreacion: new Date()
    }
  ]);

  // Configuración de demanda por día
  private demandaDias = signal<Map<number, TipoDemanda>>(new Map([
    [0, 'alta'],  // Domingo
    [1, 'baja'],  // Lunes
    [2, 'baja'],  // Martes
    [3, 'media'], // Miércoles
    [4, 'media'], // Jueves
    [5, 'alta'],  // Viernes
    [6, 'alta']   // Sábado
  ]));

  barberos = computed(() => this.barberosData().filter(b => b.activo));
  citas = computed(() => this.citasData());

  citasDelDia = computed(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return this.citasData().filter(c => {
      const fechaCita = new Date(c.fecha);
      fechaCita.setHours(0, 0, 0, 0);
      return fechaCita.getTime() === hoy.getTime();
    });
  });

  citasProximas = computed(() => {
    const ahora = new Date();
    return this.citasData()
      .filter(c => new Date(c.fecha) >= ahora && c.estado !== 'cancelada')
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  });

  getBarberoById(id: string): Barbero | undefined {
    return this.barberosData().find(b => b.id === id);
  }

  getCitaById(id: string): Cita | undefined {
    return this.citasData().find(c => c.id === id);
  }

  getCitasCliente(clienteId: string): Cita[] {
    return this.citasData().filter(c => c.clienteId === clienteId);
  }

  getCitasBarbero(barberoId: string): Cita[] {
    return this.citasData().filter(c => c.barberoId === barberoId);
  }

  getDemandaDia(fecha: Date): TipoDemanda {
    return this.demandaDias().get(fecha.getDay()) || 'media';
  }

  // Genera horarios disponibles para una fecha y barbero
  getHorariosDisponibles(fecha: Date, barberoId?: string): HorarioDisponible[] {
    const horarios: HorarioDisponible[] = [];
    const horaInicio = 9; // 9:00 AM
    const horaFin = 20;   // 8:00 PM
    
    for (let hora = horaInicio; hora < horaFin; hora++) {
      for (const minutos of [0, 30]) {
        const horaStr = `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
        
        // Verificar si hay cita en ese horario
        const ocupado = this.citasData().some(c => {
          const fechaCita = new Date(c.fecha);
          fechaCita.setHours(0, 0, 0, 0);
          const fechaConsulta = new Date(fecha);
          fechaConsulta.setHours(0, 0, 0, 0);
          
          return fechaCita.getTime() === fechaConsulta.getTime() &&
            c.hora === horaStr &&
            (!barberoId || c.barberoId === barberoId) &&
            c.estado !== 'cancelada';
        });

        horarios.push({
          fecha,
          hora: horaStr,
          disponible: !ocupado,
          barberoId
        });
      }
    }
    
    return horarios;
  }

  // Crear nueva cita
  crearCita(cita: Omit<Cita, 'id' | 'fechaCreacion'>): Cita {
    const nuevaCita: Cita = {
      ...cita,
      id: Date.now().toString(),
      fechaCreacion: new Date()
    };
    this.citasData.update(citas => [...citas, nuevaCita]);
    return nuevaCita;
  }

  // Actualizar cita
  actualizarCita(id: string, datos: Partial<Cita>): void {
    this.citasData.update(citas =>
      citas.map(c => c.id === id ? { ...c, ...datos, fechaModificacion: new Date() } : c)
    );
  }

  // Cancelar cita
  cancelarCita(id: string): void {
    this.actualizarCita(id, { estado: 'cancelada' });
  }

  // Confirmar asistencia
  confirmarAsistencia(id: string): void {
    this.actualizarCita(id, { estado: 'en_curso' });
  }

  // Completar cita
  completarCita(id: string): void {
    this.actualizarCita(id, { estado: 'completada', estadoPago: 'completado' });
  }

  // Marcar inasistencia
  marcarInasistencia(id: string): void {
    this.actualizarCita(id, { estado: 'no_asistio' });
  }

  // Verificar si cliente requiere anticipo
  clienteRequiereAnticipo(clienteId: string): boolean {
    const citasCliente = this.getCitasCliente(clienteId);
    const inasistencias = citasCliente.filter(c => c.estado === 'no_asistio').length;
    
    // Si es primera cita, no requiere
    if (citasCliente.length === 0) return false;
    
    // Si tiene inasistencias recientes
    if (inasistencias > 0) {
      const citasRecientes = citasCliente.slice(-10);
      const inasistenciasRecientes = citasRecientes.filter(c => c.estado === 'no_asistio').length;
      return inasistenciasRecientes > 0;
    }
    
    return false;
  }

  // Calcular anticipo
  calcularAnticipo(precioTotal: number, porcentaje: number = 30): number {
    return Math.ceil(precioTotal * (porcentaje / 100));
  }
}

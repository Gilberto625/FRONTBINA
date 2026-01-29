import { Injectable, signal, computed } from '@angular/core';
import { Servicio } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {
  
  // Servicios mock
  private serviciosData = signal<Servicio[]>([
    {
      id: '1',
      nombre: 'Corte Clásico',
      descripcion: 'Corte tradicional con tijera y máquina. Incluye lavado y peinado.',
      precio: 150,
      duracionMinutos: 30,
      categoria: 'corte',
      activo: true,
      popular: true
    },
    {
      id: '2',
      nombre: 'Corte Degradado',
      descripcion: 'Fade profesional con transiciones perfectas.',
      precio: 180,
      duracionMinutos: 35,
      categoria: 'corte',
      activo: true
    },
    {
      id: '3',
      nombre: 'Corte + Barba',
      descripcion: 'Combo completo: corte de cabello y perfilado de barba.',
      precio: 250,
      duracionMinutos: 45,
      categoria: 'combo',
      activo: true,
      popular: true
    },
    {
      id: '4',
      nombre: 'Afeitado Clásico',
      descripcion: 'Afeitado con navaja, toallas calientes y bálsamo.',
      precio: 120,
      duracionMinutos: 20,
      categoria: 'barba',
      activo: true
    },
    {
      id: '5',
      nombre: 'Perfilado de Barba',
      descripcion: 'Definición y perfilado profesional de barba.',
      precio: 100,
      duracionMinutos: 15,
      categoria: 'barba',
      activo: true
    },
    {
      id: '6',
      nombre: 'Tratamiento Capilar',
      descripcion: 'Hidratación profunda y masaje relajante.',
      precio: 350,
      duracionMinutos: 40,
      categoria: 'tratamiento',
      activo: true
    }
  ]);

  servicios = computed(() => this.serviciosData().filter(s => s.activo));

  serviciosPorCategoria = computed(() => {
    const servicios = this.servicios();
    return {
      todos: servicios,
      cortes: servicios.filter(s => s.categoria === 'corte'),
      barba: servicios.filter(s => s.categoria === 'barba'),
      tratamientos: servicios.filter(s => s.categoria === 'tratamiento'),
      combos: servicios.filter(s => s.categoria === 'combo')
    };
  });

  getServicioById(id: string): Servicio | undefined {
    return this.serviciosData().find(s => s.id === id);
  }

  agregarServicio(servicio: Omit<Servicio, 'id'>): Servicio {
    const nuevoServicio: Servicio = {
      ...servicio,
      id: Date.now().toString()
    };
    this.serviciosData.update(servicios => [...servicios, nuevoServicio]);
    return nuevoServicio;
  }

  actualizarServicio(id: string, datos: Partial<Servicio>): void {
    this.serviciosData.update(servicios =>
      servicios.map(s => s.id === id ? { ...s, ...datos } : s)
    );
  }

  eliminarServicio(id: string): void {
    this.serviciosData.update(servicios =>
      servicios.map(s => s.id === id ? { ...s, activo: false } : s)
    );
  }
}

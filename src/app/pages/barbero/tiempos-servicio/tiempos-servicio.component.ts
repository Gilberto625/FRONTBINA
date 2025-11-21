import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

interface ServicioBarbero {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  duracion_base: number; // Duración estándar del servicio
  duracion_personal: number; // Duración personalizada del barbero
  precio_base: number;
  activo: boolean;
  especialidad: boolean; // Si es especialidad del barbero
  nivel_dificultad: 'facil' | 'medio' | 'dificil';
  notas_personales?: string;
  estadisticas?: {
    veces_realizado: number;
    tiempo_promedio: number;
    variacion: number;
  };
}

interface EstadisticaServicio {
  servicio_id: number;
  nombre: string;
  veces_realizado: number;
  tiempo_promedio: number;
  tiempo_minimo: number;
  tiempo_maximo: number;
  calificacion_promedio: number;
}

@Component({
  selector: 'app-tiempos-servicio',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tiempos-servicio.component.html',
  styleUrls: ['./tiempos-servicio.component.css']
})
export class TiemposServicioComponent implements OnInit {
  servicios: ServicioBarbero[] = [];
  estadisticas: EstadisticaServicio[] = [];
  
  isLoading = true;
  error: string | null = null;
  
  // Filtros
  filtroCategoria = 'todas';
  filtroEspecialidad = 'todos';
  filtros = {
    categoria: 'todas',
    especialidad: 'todos'
  };
  
  // Modal edición
  mostrarModalEdicion = false;
  servicioEditar: ServicioBarbero | null = null;
  duracionTemporal = 0;
  notasTemporal = '';

  // Mock data
  mockServicios: ServicioBarbero[] = [
    {
      id: 1,
      nombre: 'Corte Clásico',
      descripcion: 'Corte tradicional con tijera y máquina',
      categoria: 'Corte de Cabello',
      duracion_base: 30,
      duracion_personal: 25,
      precio_base: 150,
      activo: true,
      especialidad: true,
      nivel_dificultad: 'facil',
      notas_personales: 'Me especializo en cortes clásicos, puedo hacerlos más rápido'
    },
    {
      id: 2,
      nombre: 'Corte Moderno',
      descripcion: 'Corte actual con técnicas modernas',
      categoria: 'Corte de Cabello',
      duracion_base: 35,
      duracion_personal: 40,
      precio_base: 200,
      activo: true,
      especialidad: false,
      nivel_dificultad: 'medio',
      notas_personales: 'Requiero más tiempo para los detalles'
    },
    {
      id: 3,
      nombre: 'Arreglo de Barba',
      descripcion: 'Recorte y perfilado de barba',
      categoria: 'Barba',
      duracion_base: 20,
      duracion_personal: 15,
      precio_base: 100,
      activo: true,
      especialidad: true,
      nivel_dificultad: 'facil',
      notas_personales: 'Mi especialidad principal'
    },
    {
      id: 4,
      nombre: 'Combo Completo',
      descripcion: 'Corte + Barba + Tratamiento',
      categoria: 'Combos',
      duracion_base: 60,
      duracion_personal: 55,
      precio_base: 300,
      activo: true,
      especialidad: true,
      nivel_dificultad: 'medio'
    },
    {
      id: 5,
      nombre: 'Tratamiento Capilar',
      descripcion: 'Hidratación y nutrición del cabello',
      categoria: 'Tratamientos',
      duracion_base: 40,
      duracion_personal: 45,
      precio_base: 250,
      activo: true,
      especialidad: false,
      nivel_dificultad: 'dificil',
      notas_personales: 'Prefiero tomarme más tiempo para mejores resultados'
    },
    {
      id: 6,
      nombre: 'Afeitado Clásico',
      descripcion: 'Afeitado tradicional con navaja',
      categoria: 'Barba',
      duracion_base: 25,
      duracion_personal: 30,
      precio_base: 120,
      activo: false,
      especialidad: false,
      nivel_dificultad: 'dificil',
      notas_personales: 'Aún estoy perfeccionando esta técnica'
    }
  ];

  mockEstadisticas: EstadisticaServicio[] = [
    {
      servicio_id: 1,
      nombre: 'Corte Clásico',
      veces_realizado: 45,
      tiempo_promedio: 26,
      tiempo_minimo: 20,
      tiempo_maximo: 35,
      calificacion_promedio: 4.9
    },
    {
      servicio_id: 3,
      nombre: 'Arreglo de Barba',
      veces_realizado: 38,
      tiempo_promedio: 16,
      tiempo_minimo: 12,
      tiempo_maximo: 22,
      calificacion_promedio: 4.8
    },
    {
      servicio_id: 4,
      nombre: 'Combo Completo',
      veces_realizado: 22,
      tiempo_promedio: 57,
      tiempo_minimo: 50,
      tiempo_maximo: 70,
      calificacion_promedio: 4.9
    },
    {
      servicio_id: 2,
      nombre: 'Corte Moderno',
      veces_realizado: 18,
      tiempo_promedio: 42,
      tiempo_minimo: 35,
      tiempo_maximo: 50,
      calificacion_promedio: 4.6
    },
    {
      servicio_id: 5,
      nombre: 'Tratamiento Capilar',
      veces_realizado: 12,
      tiempo_promedio: 47,
      tiempo_minimo: 40,
      tiempo_maximo: 55,
      calificacion_promedio: 4.7
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      // Usar datos mock
      this.servicios = this.mockServicios;
      this.estadisticas = this.mockEstadisticas;

    } catch (error) {
      console.error('Error loading data:', error);
      this.error = 'Error al cargar los datos de servicios.';
    } finally {
      this.isLoading = false;
    }
  }

  get serviciosFiltrados(): ServicioBarbero[] {
    let filtrados = [...this.servicios];

    if (this.filtroCategoria !== 'todas') {
      filtrados = filtrados.filter(s => s.categoria === this.filtroCategoria);
    }

    if (this.filtroEspecialidad !== 'todos') {
      if (this.filtroEspecialidad === 'especialidades') {
        filtrados = filtrados.filter(s => s.especialidad);
      } else if (this.filtroEspecialidad === 'activos') {
        filtrados = filtrados.filter(s => s.activo);
      }
    }

    return filtrados;
  }

  get categorias(): string[] {
    const cats = [...new Set(this.servicios.map(s => s.categoria))];
    return cats.sort();
  }

  get especialidades(): ServicioBarbero[] {
    return this.servicios.filter(s => s.especialidad && s.activo);
  }

  get serviciosInactivos(): ServicioBarbero[] {
    return this.servicios.filter(s => !s.activo);
  }

  abrirModalEdicion(servicio: ServicioBarbero): void {
    this.servicioEditar = servicio;
    this.duracionTemporal = servicio.duracion_personal;
    this.notasTemporal = servicio.notas_personales || '';
    this.mostrarModalEdicion = true;
  }

  cerrarModalEdicion(): void {
    this.mostrarModalEdicion = false;
    this.servicioEditar = null;
    this.duracionTemporal = 0;
    this.notasTemporal = '';
  }

  async guardarCambios(): Promise<void> {
    if (!this.servicioEditar || this.duracionTemporal <= 0) return;

    try {
      this.servicioEditar.duracion_personal = this.duracionTemporal;
      this.servicioEditar.notas_personales = this.notasTemporal;
      
      this.cerrarModalEdicion();
      this.showToast('Configuración actualizada exitosamente', 'success');

    } catch (error) {
      console.error('Error guardando cambios:', error);
      this.showToast('Error al guardar los cambios', 'error');
    }
  }

  async toggleActivo(servicio: ServicioBarbero): Promise<void> {
    try {
      servicio.activo = !servicio.activo;
      this.showToast(`Servicio ${servicio.activo ? 'activado' : 'desactivado'}`, 'success');
    } catch (error) {
      console.error('Error cambiando estado:', error);
      this.showToast('Error al cambiar el estado', 'error');
    }
  }

  async toggleEspecialidad(servicio: ServicioBarbero): Promise<void> {
    try {
      servicio.especialidad = !servicio.especialidad;
      this.showToast(`${servicio.especialidad ? 'Agregado a' : 'Removido de'} especialidades`, 'success');
    } catch (error) {
      console.error('Error cambiando especialidad:', error);
      this.showToast('Error al cambiar especialidad', 'error');
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
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  getDiferenciaClass(duracionBase: number, duracionPersonal: number): string {
    const diferencia = duracionPersonal - duracionBase;
    if (diferencia > 0) return 'tiempo-mayor';
    if (diferencia < 0) return 'tiempo-menor';
    return 'tiempo-igual';
  }

  getDiferenciaText(duracionBase: number, duracionPersonal: number): string {
    const diferencia = duracionPersonal - duracionBase;
    if (diferencia > 0) return `+${diferencia}min`;
    if (diferencia < 0) return `${diferencia}min`;
    return 'Igual';
  }

  getDificultadClass(nivel: string): string {
    switch (nivel) {
      case 'facil': return 'dificultad-facil';
      case 'medio': return 'dificultad-medio';
      case 'dificil': return 'dificultad-dificil';
      default: return 'dificultad-default';
    }
  }

  getDificultadText(nivel: string): string {
    switch (nivel) {
      case 'facil': return 'Fácil';
      case 'medio': return 'Medio';
      case 'dificil': return 'Difícil';
      default: return nivel;
    }
  }

  getEstadisticaServicio(servicioId: number): EstadisticaServicio | null {
    return this.estadisticas.find(e => e.servicio_id === servicioId) || null;
  }

  getStarArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }

  get currentUser() {
    return this.authService.getCurrentUserValue();
  }

  get barberoName(): string {
    const user = this.currentUser;
    return user ? `${user.nombre} ${user.apellido}` : 'Barbero';
  }
}

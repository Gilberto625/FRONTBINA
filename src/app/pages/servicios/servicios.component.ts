import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CitasService, Servicio } from '../../services/citas.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css']
})
export class ServiciosComponent implements OnInit {
  servicios: Servicio[] = [];
  serviciosFiltrados: Servicio[] = [];
  isLoading = true;
  error: string | null = null;
  filtroCategoria = 'todos';
  busqueda = '';

  categorias = [
    { id: 'todos', nombre: 'Todos los Servicios' },
    { id: 'corte', nombre: 'Cortes de Cabello' },
    { id: 'barba', nombre: 'Arreglo de Barba' },
    { id: 'combo', nombre: 'Combos' },
    { id: 'tratamiento', nombre: 'Tratamientos' }
  ];

  constructor(
    private citasService: CitasService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadServicios();
  }

  private async loadServicios(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      
      this.servicios = await this.citasService.getServicios().toPromise() || [];
      this.aplicarFiltros();
      
    } catch (error) {
      console.error('Error loading servicios:', error);
      this.error = 'Error al cargar los servicios. Por favor, intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  onFiltroChange(categoria: string): void {
    this.filtroCategoria = categoria;
    this.aplicarFiltros();
  }

  onBusquedaChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.busqueda = target.value.toLowerCase();
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    let serviciosFiltrados = [...this.servicios];

    // Filtrar por categoría
    if (this.filtroCategoria !== 'todos') {
      serviciosFiltrados = serviciosFiltrados.filter(servicio =>
        servicio.categoria?.toLowerCase().includes(this.filtroCategoria) ||
        servicio.nombre.toLowerCase().includes(this.filtroCategoria)
      );
    }

    // Filtrar por búsqueda
    if (this.busqueda) {
      serviciosFiltrados = serviciosFiltrados.filter(servicio =>
        servicio.nombre.toLowerCase().includes(this.busqueda) ||
        servicio.descripcion.toLowerCase().includes(this.busqueda)
      );
    }

    this.serviciosFiltrados = serviciosFiltrados;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  }

  agendarServicio(servicio: Servicio): void {
    if (this.authService.isAuthenticated()) {
      if (this.authService.isCliente()) {
        // Redirigir a agendar con el servicio seleccionado
        // TODO: Implementar navegación con parámetros
        console.log('Agendar servicio:', servicio);
      } else {
        // Usuario no es cliente
        alert('Solo los clientes pueden agendar citas.');
      }
    } else {
      // Usuario no autenticado, redirigir a login
      alert('Debes iniciar sesión para agendar una cita.');
    }
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get isCliente(): boolean {
    return this.authService.isCliente();
  }
}


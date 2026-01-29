import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ServicioService } from '../../../services/servicio.service';
import { Servicio } from '../../../models';

type CategoriaFiltro = 'todos' | 'corte' | 'barba' | 'tratamiento' | 'combo';
type OrdenFiltro = 'popularidad' | 'precio_asc' | 'precio_desc' | 'duracion';

@Component({
  selector: 'app-servicios-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar>

    <div class="page-header">
      <div class="container">
        <h1>Nuestros Servicios</h1>
        <p>Descubre todos los servicios que tenemos para ti</p>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <!-- Filtros -->
        <div class="card mb-lg">
          <div class="flex-between flex-gap" style="flex-wrap: wrap;">
            <div class="tabs" style="border: none; margin: 0;">
              <span class="tab" [class.active]="categoriaActiva() === 'todos'" (click)="filtrarCategoria('todos')">Todos</span>
              <span class="tab" [class.active]="categoriaActiva() === 'corte'" (click)="filtrarCategoria('corte')">Cortes</span>
              <span class="tab" [class.active]="categoriaActiva() === 'barba'" (click)="filtrarCategoria('barba')">Barba</span>
              <span class="tab" [class.active]="categoriaActiva() === 'tratamiento'" (click)="filtrarCategoria('tratamiento')">Tratamientos</span>
            </div>
            <select class="form-select" style="width: auto; min-width: 200px;" (change)="ordenar($event)">
              <option value="popularidad">Ordenar por: Popularidad</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="duracion">Duración</option>
            </select>
          </div>
        </div>

        <div class="grid grid-3">
          @for (servicio of serviciosFiltrados(); track servicio.id) {
            <div class="card">
              <div class="card-image"></div>
              @if (servicio.popular) {
                <span class="badge badge-gold mb-sm">Popular</span>
              }
              <h3>{{ servicio.nombre }}</h3>
              <p class="text-small mb-sm">{{ servicio.descripcion }}</p>
              <div class="flex-between">
                <div>
                  <p class="text-gold" style="font-weight: 700; font-size: 20px; margin-bottom: 0;">\${{ servicio.precio }} MXN</p>
                  <p class="text-caption">{{ servicio.duracionMinutos }} minutos</p>
                </div>
                <a [routerLink]="['/servicios', servicio.id]" class="btn btn-primary btn-sm">Ver detalle</a>
              </div>
            </div>
          } @empty {
            <div class="card text-center" style="grid-column: span 3;">
              <p>No hay servicios disponibles en esta categoría.</p>
            </div>
          }
        </div>
      </div>
    </section>

    <app-footer></app-footer>
  `
})
export class ServiciosListaComponent {
  private servicioService = inject(ServicioService);
  
  categoriaActiva = signal<CategoriaFiltro>('todos');
  ordenActivo = signal<OrdenFiltro>('popularidad');

  serviciosFiltrados = () => {
    let servicios = [...this.servicioService.servicios()];
    
    // Filtrar por categoría
    if (this.categoriaActiva() !== 'todos') {
      servicios = servicios.filter(s => s.categoria === this.categoriaActiva());
    }
    
    // Ordenar
    switch (this.ordenActivo()) {
      case 'precio_asc':
        servicios.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio_desc':
        servicios.sort((a, b) => b.precio - a.precio);
        break;
      case 'duracion':
        servicios.sort((a, b) => a.duracionMinutos - b.duracionMinutos);
        break;
      case 'popularidad':
      default:
        servicios.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
        break;
    }
    
    return servicios;
  };

  filtrarCategoria(categoria: CategoriaFiltro): void {
    this.categoriaActiva.set(categoria);
  }

  ordenar(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.ordenActivo.set(select.value as OrdenFiltro);
  }
}

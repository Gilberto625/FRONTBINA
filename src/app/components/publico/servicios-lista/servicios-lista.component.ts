import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ServicioService } from '../../../services/servicio.service';
import { AuthService } from '../../../services/auth.service';

type CategoriaFiltro = 'todos' | 'corte' | 'barba' | 'tratamiento' | 'combo';
type OrdenFiltro = 'popularidad' | 'precio_asc' | 'precio_desc' | 'duracion';

@Component({
  selector: 'app-servicios-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './servicios-lista.component.html'
})
export class ServiciosListaComponent implements OnInit {
  private servicioService = inject(ServicioService);
  private authService = inject(AuthService);
  
  categoriaActiva = signal<CategoriaFiltro>('todos');
  ordenActivo = signal<OrdenFiltro>('popularidad');
  isLoggedIn = false;

  ngOnInit(): void {
    const usuario = this.authService.getCurrentUser();
    this.isLoggedIn = !!usuario;
  }

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

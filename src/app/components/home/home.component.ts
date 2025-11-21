import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CitasService, Servicio } from '../../services/citas.service';
import { ProductosService, Producto } from '../../services/productos.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  serviciosDestacados: Servicio[] = [];
  productosDestacados: Producto[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private citasService: CitasService,
    private productosService: ProductosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
  }

  private async loadHomeData(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Cargar servicios y productos en paralelo
      const [servicios, productos] = await Promise.all([
        this.citasService.getServicios().toPromise(),
        this.productosService.getProductosDestacados().toPromise()
      ]);

      // Tomar solo los primeros 4 servicios
      this.serviciosDestacados = servicios?.slice(0, 4) || [];
      this.productosDestacados = productos?.slice(0, 4) || [];

    } catch (error) {
      console.error('Error loading home data:', error);
      this.error = 'Error al cargar los datos. Por favor, intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get isCliente(): boolean {
    return this.authService.isCliente();
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

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { AdminService, DashboardStats, Producto } from '../../../services/admin.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, BreadcrumbComponent],
  templateUrl: './admin-dashboard.component.html'
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = true;
  error = '';
  
  nombreAdmin = 'Administrador';
  inicialesAdmin = 'AD';
  
  stats: DashboardStats = {
    ventas_dia: 0,
    citas_hoy: 0,
    citas_pendientes: 0,
    productos_stock_bajo: 0,
    total_clientes: 0,
    servicios_activos: 0,
    productos_activos: 0
  };
  
  productosStockBajo: Producto[] = [];
  topServicios: any[] = [];

  ngOnInit(): void {
    const usuario = this.authService.getCurrentUser();
    
    // Verificar que sea admin
    if (!usuario || usuario.rol !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }
    
    // Establecer nombre del admin
    if (usuario.nombre) {
      this.nombreAdmin = usuario.nombre;
      this.inicialesAdmin = usuario.nombre.substring(0, 2).toUpperCase();
    } else if (usuario.username) {
      this.nombreAdmin = usuario.username;
      this.inicialesAdmin = usuario.username.substring(0, 2).toUpperCase();
    }
    
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading = true;
    this.error = '';
    
    // Cargar estadísticas del dashboard desde el backend
    this.adminService.getDashboardStats().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          this.stats = response.stats;
          this.productosStockBajo = response.productos_stock_bajo || [];
          this.topServicios = response.top_servicios || [];
        } else {
          this.error = response.error || 'Error al cargar datos';
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error cargando dashboard:', err);
        this.error = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
      }
    });
  }

  get fechaHoy(): string {
    return new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // Datos mock para horarios mientras no hay histórico real
  horariosPopulares = [
    { hora: '10:00', porcentaje: 95 },
    { hora: '11:00', porcentaje: 88 },
    { hora: '17:00', porcentaje: 82 },
    { hora: '18:00', porcentaje: 78 }
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

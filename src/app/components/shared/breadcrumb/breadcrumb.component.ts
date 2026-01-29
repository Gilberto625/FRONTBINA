import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';

export interface BreadcrumbItem {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.css'
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: BreadcrumbItem[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => this.activatedRoute),
        map(route => {
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        })
      )
      .subscribe(route => {
        this.breadcrumbs = this.buildBreadcrumbs(route);
      });

    // Construir breadcrumbs iniciales
    this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute);
  }

  private buildBreadcrumbs(route: ActivatedRoute): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [];
    const routeLabels: Record<string, string> = {
      'servicios': 'Servicios',
      'productos': 'Productos',
      'login': 'Iniciar Sesión',
      'register': 'Registro',
      'forgot-password': 'Recuperar Contraseña',
      'reset-password': 'Restablecer Contraseña',
      'verify-2fa': 'Verificación 2FA',
      'cliente': 'Panel Cliente',
      'perfil': 'Mi Perfil',
      'agendar': 'Agendar Cita',
      'citas': 'Mis Citas',
      'carrito': 'Carrito',
      'pedidos': 'Mis Pedidos',
      'apartados': 'Apartados',
      'admin': 'Panel Administrador',
      'empleados': 'Empleados',
      'servicios': 'Servicios',
      'productos': 'Productos',
      'inventario': 'Inventario',
      'reportes': 'Reportes',
      'configuracion': 'Configuración',
      'promociones': 'Promociones',
      'secretaria': 'Panel Secretaria',
      'agenda': 'Agenda General',
      'crear-cita': 'Crear Cita',
      'transferencias': 'Transferencias',
      'ventas': 'Punto de Venta',
      'catalogo': 'Catálogo',
      'pedidos': 'Pedidos',
      'entregas': 'Entregas',
      'barbero': 'Panel Barbero',
      'tiempos': 'Tiempos de Servicio',
      'notificaciones': 'Notificaciones',
      'profile': 'Perfil',
      'security': 'Seguridad',
      'setup-totp': 'Configurar TOTP',
      'backup-codes': 'Códigos de Respaldo',
      'change-password': 'Cambiar Contraseña',
      'home': 'Inicio'
    };

    let currentRoute = route;
    const urlSegments: string[] = [];

    // Construir la ruta completa desde la raíz
    while (currentRoute) {
      if (currentRoute.snapshot.url.length > 0) {
        urlSegments.unshift(...currentRoute.snapshot.url.map(segment => segment.path));
      }
      currentRoute = currentRoute.parent!;
    }

    // Siempre agregar "Inicio" como primer breadcrumb
    breadcrumbs.push({ label: 'Inicio', url: '/' });

    // Construir breadcrumbs basados en los segmentos de URL
    let currentPath = '';
    for (let i = 0; i < urlSegments.length; i++) {
      const segment = urlSegments[i];
      currentPath += (currentPath ? '/' : '') + segment;
      
      // Obtener el label del breadcrumb
      // Primero intentar con la ruta completa, luego solo el segmento
      let label = routeLabels[currentPath] || routeLabels[segment] || this.formatLabel(segment);
      
      // Construir la URL completa
      const url = '/' + currentPath;
      
      breadcrumbs.push({ label, url });
    }

    return breadcrumbs;
  }

  private formatLabel(segment: string): string {
    // Convertir "mi-perfil" a "Mi Perfil"
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

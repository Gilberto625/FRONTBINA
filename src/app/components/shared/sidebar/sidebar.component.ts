import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RolUsuario } from '../../../models';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <a routerLink="/" class="sidebar-logo">Stylo <span>Barber</span></a>
      
      @if (rolLabel) {
        <p class="text-small" style="color: var(--color-accent); margin-bottom: var(--spacing-lg);">
          Panel {{ rolLabel }}
        </p>
      }
      
      <ul class="sidebar-menu">
        @for (item of menuItems; track item.route) {
          <li class="sidebar-item">
            <a [routerLink]="item.route" routerLinkActive="active" class="sidebar-link">
              <span [innerHTML]="item.icon"></span>
              {{ item.label }}
            </a>
          </li>
        }
      </ul>
      
      <div style="margin-top: auto; padding-top: var(--spacing-xl);">
        <a routerLink="/login" class="sidebar-link" (click)="onLogout()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Cerrar sesión
        </a>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() rol: RolUsuario = 'cliente';
  
  get rolLabel(): string {
    const labels: Record<RolUsuario, string> = {
      cliente: '',
      secretaria: 'Secretaría',
      barbero: 'Barbero',
      admin: 'Administrador'
    };
    return labels[this.rol];
  }

  get menuItems(): MenuItem[] {
    const menus: Record<RolUsuario, MenuItem[]> = {
      cliente: [
        { label: 'Dashboard', route: '/cliente', icon: this.iconDashboard },
        { label: 'Mi Perfil', route: '/cliente/perfil', icon: this.iconUser },
        { label: 'Agendar Cita', route: '/cliente/agendar', icon: this.iconCalendar },
        { label: 'Mis Citas', route: '/cliente/citas', icon: this.iconDocument },
        { label: 'Carrito', route: '/cliente/carrito', icon: this.iconCart },
        { label: 'Mis Pedidos', route: '/cliente/pedidos', icon: this.iconPackage },
        { label: 'Apartados', route: '/cliente/apartados', icon: this.iconBookmark }
      ],
      secretaria: [
        { label: 'Dashboard', route: '/secretaria', icon: this.iconDashboard },
        { label: 'Agenda General', route: '/secretaria/agenda', icon: this.iconCalendar },
        { label: 'Crear Cita', route: '/secretaria/crear-cita', icon: this.iconPlus },
        { label: 'Transferencias', route: '/secretaria/transferencias', icon: this.iconCard },
        { label: 'Punto de Venta', route: '/secretaria/ventas', icon: this.iconDollar },
        { label: 'Catálogo', route: '/secretaria/catalogo', icon: this.iconPackage },
        { label: 'Inventario', route: '/secretaria/inventario', icon: this.iconFolder },
        { label: 'Pedidos', route: '/secretaria/pedidos', icon: this.iconDocument },
        { label: 'Entregas', route: '/secretaria/entregas', icon: this.iconTruck }
      ],
      barbero: [
        { label: 'Dashboard', route: '/barbero', icon: this.iconDashboard },
        { label: 'Mi Agenda', route: '/barbero/agenda', icon: this.iconCalendar },
        { label: 'Tiempos de Servicio', route: '/barbero/tiempos', icon: this.iconClock },
        { label: 'Notificaciones', route: '/barbero/notificaciones', icon: this.iconBell }
      ],
      admin: [
        { label: 'Dashboard', route: '/admin', icon: this.iconDashboard },
        { label: 'Empleados', route: '/admin/empleados', icon: this.iconUsers },
        { label: 'Servicios', route: '/admin/servicios', icon: this.iconScissors },
        { label: 'Productos', route: '/admin/productos', icon: this.iconPackage },
        { label: 'Inventario', route: '/admin/inventario', icon: this.iconSliders },
        { label: 'Reportes', route: '/admin/reportes', icon: this.iconChart },
        { label: 'Configuración', route: '/admin/configuracion', icon: this.iconSettings },
        { label: 'Promociones', route: '/admin/promociones', icon: this.iconTag }
      ]
    };
    return menus[this.rol];
  }

  onLogout(): void {
    // Lógica de logout
    localStorage.removeItem('authToken');
  }

  // SVG Icons
  private iconDashboard = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>';
  private iconUser = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  private iconUsers = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>';
  private iconCalendar = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  private iconDocument = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>';
  private iconCart = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>';
  private iconPackage = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>';
  private iconBookmark = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>';
  private iconPlus = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>';
  private iconCard = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>';
  private iconDollar = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';
  private iconFolder = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>';
  private iconTruck = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16,8 20,8 23,11 23,16 16,16 16,8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>';
  private iconClock = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>';
  private iconBell = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';
  private iconScissors = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
  private iconSliders = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>';
  private iconChart = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>';
  private iconSettings = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>';
  private iconTag = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>';
}

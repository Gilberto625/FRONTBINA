import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

@Component({
  selector: 'app-mapa-sitio',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './mapa-sitio.component.html',
  styleUrl: './mapa-sitio.component.css'
})
export class MapaSitioComponent {
  secciones = [
    {
      titulo: 'Páginas Públicas',
      enlaces: [
        { label: 'Inicio', route: '/' },
        { label: 'Servicios', route: '/servicios' },
        { label: 'Productos', route: '/productos' },
        { label: 'Ayuda', route: '/ayuda' },
        { label: 'Contáctanos', route: '/contacto' },
        { label: 'Mapa del Sitio', route: '/mapa-sitio' }
      ]
    },
    {
      titulo: 'Autenticación',
      enlaces: [
        { label: 'Iniciar Sesión', route: '/login' },
        { label: 'Registro', route: '/register' },
        { label: 'Recuperar Contraseña', route: '/forgot-password' }
      ]
    },
    {
      titulo: 'Panel Cliente',
      enlaces: [
        { label: 'Dashboard', route: '/cliente' },
        { label: 'Agendar Cita', route: '/cliente/agendar' },
        { label: 'Mis Citas', route: '/cliente/citas' },
        { label: 'Carrito', route: '/cliente/carrito' },
        { label: 'Mis Pedidos', route: '/cliente/pedidos' },
        { label: 'Mi Perfil', route: '/cliente/perfil' }
      ]
    },
    {
      titulo: 'Panel Administrador',
      enlaces: [
        { label: 'Dashboard', route: '/admin' },
        { label: 'Empleados', route: '/admin/empleados' },
        { label: 'Servicios', route: '/admin/servicios' },
        { label: 'Productos', route: '/admin/productos' },
        { label: 'Inventario', route: '/admin/inventario' },
        { label: 'Configuración', route: '/admin/configuracion' }
      ]
    },
    {
      titulo: 'Soporte',
      enlaces: [
        { label: 'Ayuda', route: '/ayuda' },
        { label: 'Contáctanos', route: '/contacto' },
        { label: 'Chat', route: '/chat' }
      ]
    }
  ];
}

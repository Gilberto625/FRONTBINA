import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Navbar Desktop -->
    <nav class="navbar">
      <a routerLink="/" class="navbar-logo">Stylo <span>Barber</span></a>
      <ul class="navbar-links">
        <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="navbar-link">Inicio</a></li>
        <li><a routerLink="/servicios" routerLinkActive="active" class="navbar-link">Servicios</a></li>
        <li><a routerLink="/productos" routerLinkActive="active" class="navbar-link">Productos</a></li>
        @if (!isLoggedIn) {
          <li><a routerLink="/login" class="btn btn-secondary btn-sm">Iniciar Sesión</a></li>
          <li><a routerLink="/agendar" class="btn btn-primary btn-sm">Agendar Cita</a></li>
        } @else {
          <li><a routerLink="/cliente" class="btn btn-primary btn-sm">Mi Panel</a></li>
        }
      </ul>
    </nav>

    <!-- Mobile Bottom Nav -->
    <nav class="navbar-mobile">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
        Inicio
      </a>
      <a routerLink="/servicios" routerLinkActive="active" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="6" cy="6" r="3"/><path d="M6 9v12"/><path d="M13 6l-3 9 7 4"/>
        </svg>
        Servicios
      </a>
      <a routerLink="/productos" routerLinkActive="active" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        Tienda
      </a>
      <a [routerLink]="isLoggedIn ? '/cliente' : '/login'" routerLinkActive="active" class="navbar-mobile-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
        {{ isLoggedIn ? 'Perfil' : 'Cuenta' }}
      </a>
    </nav>
  `
})
export class NavbarComponent {
  @Input() isLoggedIn = false;
}

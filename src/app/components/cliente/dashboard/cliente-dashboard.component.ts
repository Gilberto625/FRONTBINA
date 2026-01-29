import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { CitaService } from '../../../services/cita.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-cliente-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  templateUrl: './cliente-dashboard.component.html',
  styleUrl: './cliente-dashboard.component.css'
})
export class ClienteDashboardComponent implements OnInit {
  private citaService = inject(CitaService);
  private authService = inject(AuthService);
  private router = inject(Router);
  
  proximaCita = this.citaService.citasProximas()[0];
  nombreUsuario = 'Usuario';
  inicialesUsuario = 'U';

  ngOnInit(): void {
    const usuario = this.authService.getCurrentUser();
    if (usuario) {
      this.nombreUsuario = usuario.username || usuario.email?.split('@')[0] || 'Usuario';
      this.inicialesUsuario = this.nombreUsuario.substring(0, 2).toUpperCase();
    }
  }

  formatearFecha(fecha: Date): string {
    const opciones: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short' 
    };
    return new Date(fecha).toLocaleDateString('es-MX', opciones);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

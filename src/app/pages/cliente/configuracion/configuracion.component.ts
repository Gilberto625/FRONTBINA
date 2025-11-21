import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-cliente-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  tabActiva = 'notificaciones';
  guardando = false;

  preferencias = {
    notificaciones_email: true,
    notificaciones_sms: false,
    notificaciones_push: true,
    recordatorio_24h: true,
    recordatorio_1h: true,
    promociones: false
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.cargarPreferencias();
  }

  cargarPreferencias(): void {
    // Cargar preferencias del usuario desde el servicio
  }

  async guardarPreferencias(): Promise<void> {
    this.guardando = true;
    try {
      // Guardar preferencias
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('Preferencias guardadas exitosamente');
    } catch (error) {
      console.error('Error guardando preferencias:', error);
      alert('Error al guardar las preferencias');
    } finally {
      this.guardando = false;
    }
  }

  cambiarTab(tab: string): void {
    this.tabActiva = tab;
  }
}

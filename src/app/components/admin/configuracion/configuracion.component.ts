import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { AdminService, Configuracion } from '../../../services/admin.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent, BreadcrumbComponent],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.css'
})
export class ConfiguracionComponent implements OnInit {
  private adminService = inject(AdminService);
  private modalService = inject(ModalService);

  tabActivo = 'general';
  guardando = false;
  
  config: Configuracion = {
    nombre_negocio: 'Stylo Barber',
    direccion: '',
    telefono: '',
    email_contacto: '',
    horario_apertura: '09:00',
    horario_cierre: '20:00',
    porcentaje_anticipo: 30,
    tiempo_espera_maximo: 10,
    citas_penalizacion: 10
  };

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    this.adminService.getConfiguracion().subscribe({
      next: (response) => {
        if (response.ok) {
          this.config = { ...this.config, ...response.configuracion };
        }
      },
      error: () => {
        console.log('Usando configuración por defecto');
      }
    });
  }

  guardarConfiguracion(): void {
    this.guardando = true;
    this.adminService.actualizarConfiguracion(this.config).subscribe({
      next: (response) => {
        this.guardando = false;
        if (response.ok) {
          this.modalService.showSuccess('Configuración guardada exitosamente');
        } else {
          this.modalService.showError(response.error || 'Error al guardar');
        }
      },
      error: () => {
        this.guardando = false;
        this.modalService.showError('Error al guardar configuración');
      }
    });
  }

  restaurarDefectos(): void {
    if (confirm('¿Restaurar todos los valores a sus valores por defecto?')) {
      this.config = {
        nombre_negocio: 'Stylo Barber',
        direccion: '',
        telefono: '',
        email_contacto: '',
        horario_apertura: '09:00',
        horario_cierre: '20:00',
        porcentaje_anticipo: 30,
        tiempo_espera_maximo: 10,
        citas_penalizacion: 10
      };
      this.modalService.showInfo('Valores restaurados. No olvides guardar los cambios.');
    }
  }
}

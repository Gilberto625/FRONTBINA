import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-admin-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-empleados.component.html',
  styleUrl: './admin-empleados.component.css'
})
export class AdminEmpleadosComponent implements OnInit {
  cargando = false;
  empleados: any[] = [];
  rol = '';

  // crear
  nuevo: any = { email: '', password: '', rol: 'secretaria', first_name: '', last_name: '', telefono: '' };

  constructor(private adminService: AdminService, private modalService: ModalService) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.adminService.listarEmpleados({ rol: this.rol || undefined }).subscribe({
      next: (r: any) => {
        this.cargando = false;
        if (r?.exito) this.empleados = r.datos?.empleados || [];
        else this.modalService.showError(r?.mensaje || 'No se pudieron cargar empleados.');
      },
      error: () => {
        this.cargando = false;
        this.modalService.showError('No se pudieron cargar empleados.');
      }
    });
  }

  async crear(): Promise<void> {
    if (!this.nuevo.email || !this.nuevo.password || !this.nuevo.rol) {
      this.modalService.mostrarError('Error', 'email, password y rol son requeridos.');
      return;
    }
    this.adminService.crearEmpleado(this.nuevo).subscribe({
      next: async (r: any) => {
        if (r?.exito) {
          await this.modalService.mostrarExito('Empleado creado', r.mensaje || 'Creado.');
          this.nuevo = { email: '', password: '', rol: 'secretaria', first_name: '', last_name: '', telefono: '' };
          this.cargar();
        } else this.modalService.mostrarError('Error', r?.mensaje || 'No se pudo crear.');
      },
      error: (e: any) => this.modalService.mostrarError('Error', e?.error?.mensaje || 'No se pudo crear.')
    });
  }

  toggleActivo(emp: any): void {
    this.adminService.actualizarEmpleado(emp.id, { activo: !emp.activo }).subscribe({
      next: () => this.cargar(),
      error: () => this.modalService.showError('No se pudo actualizar empleado.')
    });
  }
}


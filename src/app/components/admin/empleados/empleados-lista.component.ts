import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { AdminService, Empleado } from '../../../services/admin.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-empleados-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent, BreadcrumbComponent],
  templateUrl: './empleados-lista.component.html'
})
export class EmpleadosListaComponent implements OnInit {
  private adminService = inject(AdminService);
  private modalService = inject(ModalService);
  private router = inject(Router);

  empleados: Empleado[] = [];
  empleadosFiltrados: Empleado[] = [];
  loading = true;
  
  // Filtros
  filtro = '';
  filtroRol = '';
  filtroEstado = '';

  // Modal
  mostrarModal = false;
  empleadoEditar: Empleado | null = null;
  guardando = false;
  formulario = {
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    rol: 'cliente'
  };

  get empleadosActivos(): number {
    return this.empleados.filter(e => e.activo).length;
  }

  get admins(): number {
    return this.empleados.filter(e => e.rol === 'admin').length;
  }

  get clientes(): number {
    return this.empleados.filter(e => e.rol === 'cliente').length;
  }

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.loading = true;
    this.adminService.getEmpleados().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          this.empleados = response.empleados;
          this.filtrarEmpleados();
        }
      },
      error: (error) => {
        this.loading = false;
        this.modalService.showError('Error al cargar empleados');
        console.error(error);
      }
    });
  }

  filtrarEmpleados(): void {
    this.empleadosFiltrados = this.empleados.filter(e => {
      const matchNombre = !this.filtro || 
        `${e.nombre} ${e.apellido} ${e.email}`.toLowerCase().includes(this.filtro.toLowerCase());
      const matchRol = !this.filtroRol || e.rol === this.filtroRol;
      const matchEstado = !this.filtroEstado || 
        (this.filtroEstado === 'activo' ? e.activo : !e.activo);
      return matchNombre && matchRol && matchEstado;
    });
  }

  getIniciales(empleado: Empleado): string {
    const nombre = empleado.nombre || empleado.email.split('@')[0];
    const apellido = empleado.apellido || '';
    return `${nombre[0] || ''}${apellido[0] || nombre[1] || ''}`.toUpperCase();
  }

  abrirModalCrear(): void {
    this.empleadoEditar = null;
    this.formulario = {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      telefono: '',
      rol: 'cliente'
    };
    this.mostrarModal = true;
  }

  editarEmpleado(empleado: Empleado, event?: Event): void {
    // Prevenir propagación del evento
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    this.empleadoEditar = empleado;
    this.formulario = {
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      email: empleado.email,
      password: '',
      telefono: empleado.telefono,
      rol: empleado.rol
    };
    
    // Abrir modal inmediatamente
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.empleadoEditar = null;
  }

  guardarEmpleado(): void {
    if (!this.formulario.nombre || !this.formulario.email) {
      this.modalService.showError('Nombre y email son requeridos');
      return;
    }

    if (!this.empleadoEditar && !this.formulario.password) {
      this.modalService.showError('La contraseña es requerida');
      return;
    }

    this.guardando = true;

    const observable = this.empleadoEditar
      ? this.adminService.actualizarEmpleado(this.empleadoEditar.id, this.formulario)
      : this.adminService.crearEmpleado(this.formulario);

    observable.subscribe({
      next: (response) => {
        this.guardando = false;
        if (response.ok) {
          this.modalService.showSuccess(
            this.empleadoEditar ? 'Usuario actualizado' : 'Usuario creado exitosamente'
          );
          this.cerrarModal();
          this.cargarEmpleados();
        } else {
          this.modalService.showError(response.error || 'Error al guardar');
        }
      },
      error: (error) => {
        this.guardando = false;
        this.modalService.showError(error.error?.error || 'Error al guardar usuario');
      }
    });
  }

  desactivarEmpleado(empleado: Empleado): void {
    if (confirm(`¿Desactivar a ${empleado.nombre}?`)) {
      this.adminService.actualizarEmpleado(empleado.id, { activo: false }).subscribe({
        next: () => {
          this.modalService.showSuccess('Usuario desactivado');
          this.cargarEmpleados();
        },
        error: () => this.modalService.showError('Error al desactivar')
      });
    }
  }

  activarEmpleado(empleado: Empleado): void {
    this.adminService.actualizarEmpleado(empleado.id, { activo: true }).subscribe({
      next: () => {
        this.modalService.showSuccess('Usuario activado');
        this.cargarEmpleados();
      },
      error: () => this.modalService.showError('Error al activar')
    });
  }
}

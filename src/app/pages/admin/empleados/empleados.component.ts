import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpleadosService } from '../../../services/empleados.service';
import { AuthService } from '../../../services/auth.service';

interface Empleado {
  id?: number;
  usuario: {
    id?: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
  };
  telefono: string;
  direccion: string;
  fecha_contratacion: string;
  salario: number;
  rol: string;
  activo: boolean;
  especialidades?: string[];
  horario_trabajo?: {
    lunes?: { inicio: string; fin: string; };
    martes?: { inicio: string; fin: string; };
    miercoles?: { inicio: string; fin: string; };
    jueves?: { inicio: string; fin: string; };
    viernes?: { inicio: string; fin: string; };
    sabado?: { inicio: string; fin: string; };
    domingo?: { inicio: string; fin: string; };
  };
  estadisticas?: {
    citas_mes: number;
    ingresos_mes: number;
    calificacion_promedio: number;
    clientes_atendidos: number;
  };
}

interface Rol {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
}

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css']
})
export class EmpleadosComponent implements OnInit {
  empleados: Empleado[] = [];
  empleadosFiltrados: Empleado[] = [];
  roles: Rol[] = [];
  
  // Estados
  cargando = false;
  guardandoEmpleado = false;
  
  // Filtros
  filtros = {
    buscar: '',
    rol: '',
    estado: '',
    especialidad: ''
  };
  
  // Modal
  mostrarModalEmpleado = false;
  empleadoEditando: any = {};
  
  // Estadísticas
  estadisticas = {
    total_empleados: 0,
    empleados_activos: 0,
    barberos: 0,
    secretarias: 0,
    nomina_mensual: 0
  };
  
  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalPaginas = 1;

  constructor(
    private empleadosService: EmpleadosService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    this.cargando = true;
    try {
      await Promise.all([
        this.cargarEmpleados(),
        this.cargarRoles(),
        this.cargarEstadisticas()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      this.cargando = false;
    }
  }

  async cargarEmpleados(): Promise<void> {
    try {
      const response = await this.empleadosService.getEmpleados({
        page: this.paginaActual,
        page_size: this.elementosPorPagina
      }).toPromise();
      
      this.empleados = response?.results || [];
      this.empleadosFiltrados = [...this.empleados];
      this.totalPaginas = Math.ceil((response?.count || 0) / this.elementosPorPagina);
    } catch (error) {
      console.error('Error cargando empleados:', error);
    }
  }

  async cargarRoles(): Promise<void> {
    try {
      this.roles = await this.empleadosService.getRoles().toPromise() || [];
    } catch (error) {
      console.error('Error cargando roles:', error);
    }
  }

  async cargarEstadisticas(): Promise<void> {
    try {
      this.estadisticas = await this.empleadosService.getEstadisticasEmpleados().toPromise() || this.estadisticas;
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  filtrarEmpleados(): void {
    let filtrados = [...this.empleados];

    if (this.filtros.buscar) {
      const buscar = this.filtros.buscar.toLowerCase();
      filtrados = filtrados.filter(empleado => 
        empleado.usuario.first_name.toLowerCase().includes(buscar) ||
        empleado.usuario.last_name.toLowerCase().includes(buscar) ||
        empleado.usuario.email.toLowerCase().includes(buscar) ||
        empleado.telefono.includes(buscar)
      );
    }

    if (this.filtros.rol) {
      filtrados = filtrados.filter(empleado => empleado.rol === this.filtros.rol);
    }

    if (this.filtros.estado) {
      const activo = this.filtros.estado === 'activo';
      filtrados = filtrados.filter(empleado => empleado.activo === activo);
    }

    this.empleadosFiltrados = filtrados;
  }

  abrirModalEmpleado(empleado?: Empleado): void {
    if (empleado) {
      this.empleadoEditando = {
        ...empleado,
        usuario: { ...empleado.usuario }
      };
    } else {
      this.empleadoEditando = {
        usuario: {
          username: '',
          email: '',
          first_name: '',
          last_name: '',
          is_active: true
        },
        telefono: '',
        direccion: '',
        fecha_contratacion: new Date().toISOString().split('T')[0],
        salario: 0,
        rol: '',
        activo: true,
        especialidades: [],
        horario_trabajo: {}
      };
    }
    this.mostrarModalEmpleado = true;
  }

  cerrarModalEmpleado(): void {
    this.mostrarModalEmpleado = false;
    this.empleadoEditando = {};
  }

  async guardarEmpleado(): Promise<void> {
    if (!this.validarEmpleado()) {
      return;
    }

    this.guardandoEmpleado = true;
    try {
      if (this.empleadoEditando.id) {
        await this.empleadosService.actualizarEmpleado(this.empleadoEditando.id, this.empleadoEditando).toPromise();
      } else {
        await this.empleadosService.crearEmpleado(this.empleadoEditando).toPromise();
      }
      
      await this.cargarEmpleados();
      this.cerrarModalEmpleado();
    } catch (error) {
      console.error('Error guardando empleado:', error);
    } finally {
      this.guardandoEmpleado = false;
    }
  }

  validarEmpleado(): boolean {
    const usuario = this.empleadoEditando.usuario;
    return !!(
      usuario.first_name &&
      usuario.last_name &&
      usuario.email &&
      usuario.username &&
      this.empleadoEditando.telefono &&
      this.empleadoEditando.rol
    );
  }

  async toggleEstadoEmpleado(empleado: Empleado): Promise<void> {
    try {
      const nuevoEstado = !empleado.activo;
      await this.empleadosService.toggleEstadoEmpleado(empleado.id!, nuevoEstado).toPromise();
      empleado.activo = nuevoEstado;
      empleado.usuario.is_active = nuevoEstado;
    } catch (error) {
      console.error('Error cambiando estado del empleado:', error);
    }
  }

  async eliminarEmpleado(empleado: Empleado): Promise<void> {
    if (!confirm(`¿Estás seguro de que deseas eliminar al empleado ${empleado.usuario.first_name} ${empleado.usuario.last_name}?`)) {
      return;
    }

    try {
      await this.empleadosService.eliminarEmpleado(empleado.id!).toPromise();
      await this.cargarEmpleados();
    } catch (error) {
      console.error('Error eliminando empleado:', error);
    }
  }

  verDetallesEmpleado(empleado: Empleado): void {
    // Implementar vista de detalles
    console.log('Ver detalles de:', empleado);
  }

  async resetearPassword(empleado: Empleado): Promise<void> {
    if (!confirm(`¿Deseas resetear la contraseña de ${empleado.usuario.first_name} ${empleado.usuario.last_name}?`)) {
      return;
    }

    try {
      await this.empleadosService.resetearPassword(empleado.usuario.id!).toPromise();
      alert('Contraseña reseteada exitosamente. Se ha enviado un email con las nuevas credenciales.');
    } catch (error) {
      console.error('Error reseteando contraseña:', error);
    }
  }

  agregarEspecialidad(): void {
    if (!this.empleadoEditando.especialidades) {
      this.empleadoEditando.especialidades = [];
    }
    this.empleadoEditando.especialidades.push('');
  }

  eliminarEspecialidad(index: number): void {
    this.empleadoEditando.especialidades?.splice(index, 1);
  }

  getRolNombre(rolId: string): string {
    const rol = this.roles.find(r => r.id === rolId);
    return rol ? rol.nombre : rolId;
  }

  getEstadoTexto(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.cargarEmpleados();
    }
  }

  exportarEmpleados(): void {
    // Implementar exportación
    console.log('Exportar empleados');
  }

  onImageError(event: any): void {
    event.target.src = '/assets/images/avatar-default.jpg';
  }
}


import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { AdminService, Servicio } from '../../../services/admin.service';
import { ModalService } from '../../../services/modal.service';

@Component({
  selector: 'app-servicios-lista',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, SidebarComponent, BreadcrumbComponent],
  templateUrl: './servicios-lista.component.html',
  styleUrl: './servicios-lista.component.css'
})
export class ServiciosListaComponent implements OnInit {
  private adminService = inject(AdminService);
  private modalService = inject(ModalService);

  servicios: Servicio[] = [];
  serviciosFiltrados: Servicio[] = [];
  loading = true;
  
  filtro = '';
  filtroCategoria = '';
  filtroEstado = '';

  mostrarModal = false;
  abriendoModal = false; // Flag para prevenir cierre inmediato
  servicioEditar: Servicio | null = null;
  guardando = false;
  subiendoImagen = false;
  imagenPreview: string | null = null;
  imagenFile: File | null = null;

  formulario = {
    nombre: '',
    descripcion: '',
    precio: 0,
    duracion_minutos: 30,
    categoria: 'corte',
    imagen_url: '',
    popular: false
  };

  get serviciosActivos(): number {
    return this.servicios.filter(s => s.activo).length;
  }

  get precioPromedio(): number {
    if (this.servicios.length === 0) return 0;
    const total = this.servicios.reduce((sum, s) => sum + Number(s.precio), 0);
    return Math.round(total / this.servicios.length);
  }

  ngOnInit(): void {
    this.cargarServicios();
  }

  cargarServicios(): void {
    this.loading = true;
    this.adminService.getServicios().subscribe({
      next: (response) => {
        this.loading = false;
        if (response.ok) {
          this.servicios = response.servicios;
          this.filtrarServicios();
        }
      },
      error: (error) => {
        this.loading = false;
        this.modalService.showError('Error al cargar servicios');
      }
    });
  }

  filtrarServicios(): void {
    this.serviciosFiltrados = this.servicios.filter(s => {
      const matchNombre = !this.filtro || s.nombre.toLowerCase().includes(this.filtro.toLowerCase());
      const matchCategoria = !this.filtroCategoria || s.categoria === this.filtroCategoria;
      const matchEstado = !this.filtroEstado || 
        (this.filtroEstado === 'activo' ? s.activo : !s.activo);
      return matchNombre && matchCategoria && matchEstado;
    });
  }

  getCategoriaLabel(categoria: string): string {
    const labels: Record<string, string> = {
      'corte': 'Cortes',
      'barba': 'Barba',
      'tratamiento': 'Tratamientos',
      'combo': 'Paquetes'
    };
    return labels[categoria] || categoria;
  }

  abrirModalCrear(): void {
    this.servicioEditar = null;
    this.imagenPreview = null;
    this.imagenFile = null;
    this.formulario = {
      nombre: '',
      descripcion: '',
      precio: 0,
      duracion_minutos: 30,
      categoria: 'corte',
      imagen_url: '',
      popular: false
    };
    this.mostrarModal = true;
  }

  editarServicio(servicio: Servicio, event?: Event): void {
    // Prevenir propagación del evento CRÍTICO
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      event.stopImmediatePropagation();
    }
    
    // Cerrar modal si está abierto
    if (this.mostrarModal) {
      this.mostrarModal = false;
      // Esperar un ciclo antes de abrir el nuevo
      setTimeout(() => {
        this.abrirModalEditar(servicio);
      }, 100);
    } else {
      this.abrirModalEditar(servicio);
    }
  }

  private abrirModalEditar(servicio: Servicio): void {
    this.abriendoModal = true; // Marcar que estamos abriendo
    this.servicioEditar = servicio;
    this.imagenPreview = servicio.imagen_url || null;
    this.imagenFile = null;
    this.formulario = {
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: Number(servicio.precio),
      duracion_minutos: servicio.duracion_minutos,
      categoria: servicio.categoria,
      imagen_url: servicio.imagen_url || '',
      popular: servicio.popular
    };
    
    // Usar setTimeout para asegurar que el DOM se actualice antes de abrir el modal
    setTimeout(() => {
      this.mostrarModal = true;
      // Permitir cierre después de que el modal esté completamente renderizado
      setTimeout(() => {
        this.abriendoModal = false;
      }, 200);
    }, 100);
  }

  private overlayClickTarget: HTMLElement | null = null;

  onOverlayMouseDown(event: MouseEvent): void {
    // Guardar el elemento donde se inició el mousedown
    this.overlayClickTarget = event.target as HTMLElement;
  }

  onOverlayClick(event: MouseEvent): void {
    // Solo cerrar si el mousedown y click fueron en el mismo elemento (overlay)
    if (this.overlayClickTarget === event.currentTarget) {
      this.cerrarModal();
    }
    this.overlayClickTarget = null;
  }

  cerrarModal(): void {
    // Prevenir cierre si estamos abriendo el modal
    if (this.abriendoModal) {
      return;
    }
    
    this.mostrarModal = false;
    this.servicioEditar = null;
    this.imagenPreview = null;
    this.imagenFile = null;
  }

  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    
    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      this.modalService.showError('La imagen no debe superar 2MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      this.modalService.showError('Solo se permiten archivos de imagen');
      return;
    }

    this.imagenFile = file;

    // Preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagenPreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  eliminarImagen(): void {
    this.imagenPreview = null;
    this.imagenFile = null;
    this.formulario.imagen_url = '';
  }

  async guardarServicio(): Promise<void> {
    if (!this.formulario.nombre || !this.formulario.precio) {
      this.modalService.showError('Nombre y precio son requeridos');
      return;
    }

    this.guardando = true;

    try {
      // Si hay una imagen nueva para subir
      if (this.imagenFile) {
        this.subiendoImagen = true;
        
        const uploadResponse = await this.adminService.uploadImage(
          this.imagenFile, 
          'servicios'
        ).toPromise();
        
        this.subiendoImagen = false;
        
        if (uploadResponse?.ok) {
          this.formulario.imagen_url = uploadResponse.url;
        } else {
          throw new Error('Error al subir imagen');
        }
      }

      // Guardar el servicio
      const observable = this.servicioEditar
        ? this.adminService.actualizarServicio(this.servicioEditar.id, this.formulario)
        : this.adminService.crearServicio(this.formulario);

      observable.subscribe({
        next: (response) => {
          this.guardando = false;
          if (response.ok) {
            this.modalService.showSuccess(
              this.servicioEditar ? 'Servicio actualizado' : 'Servicio creado exitosamente'
            );
            this.cerrarModal();
            this.cargarServicios();
          } else {
            this.modalService.showError(response.error || 'Error al guardar');
          }
        },
        error: (error) => {
          this.guardando = false;
          this.modalService.showError(error.error?.error || 'Error al guardar servicio');
        }
      });
    } catch (error: any) {
      this.guardando = false;
      this.subiendoImagen = false;
      this.modalService.showError(error.message || 'Error al subir imagen');
    }
  }

  toggleEstado(servicio: Servicio): void {
    const nuevoEstado = !servicio.activo;
    this.adminService.actualizarServicio(servicio.id, { activo: nuevoEstado }).subscribe({
      next: () => {
        this.modalService.showSuccess(nuevoEstado ? 'Servicio activado' : 'Servicio desactivado');
        this.cargarServicios();
      },
      error: () => this.modalService.showError('Error al cambiar estado')
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  duracion: number;
  precio: number;
  categoria: string;
  activo: boolean;
}

@Component({
  selector: 'app-gestion-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './servicios.component.html',
  styleUrls: ['./servicios.component.css']
})
export class GestionServiciosComponent implements OnInit {
  servicios: Servicio[] = [];
  isLoading = true;
  mostrarModal = false;
  editando = false;

  servicioActual: Servicio = {
    id: 0,
    nombre: '',
    descripcion: '',
    duracion: 30,
    precio: 0,
    categoria: 'Corte',
    activo: true
  };

  categorias = ['Corte', 'Barba', 'Combo', 'Tratamiento', 'Otro'];

  mockServicios: Servicio[] = [
    { id: 1, nombre: 'Corte Clasico', descripcion: 'Corte tradicional', duracion: 30, precio: 150, categoria: 'Corte', activo: true },
    { id: 2, nombre: 'Corte Moderno', descripcion: 'Estilos contemporaneos', duracion: 35, precio: 200, categoria: 'Corte', activo: true },
    { id: 3, nombre: 'Arreglo Barba', descripcion: 'Recorte y perfilado', duracion: 20, precio: 100, categoria: 'Barba', activo: true },
    { id: 4, nombre: 'Combo Completo', descripcion: 'Corte + Barba', duracion: 60, precio: 300, categoria: 'Combo', activo: true }
  ];

  ngOnInit(): void {
    this.loadServicios();
  }

  loadServicios(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.servicios = [...this.mockServicios];
      this.isLoading = false;
    }, 300);
  }

  abrirModal(servicio?: Servicio): void {
    if (servicio) {
      this.servicioActual = { ...servicio };
      this.editando = true;
    } else {
      this.servicioActual = { id: 0, nombre: '', descripcion: '', duracion: 30, precio: 0, categoria: 'Corte', activo: true };
      this.editando = false;
    }
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarServicio(): void {
    if (this.editando) {
      const index = this.servicios.findIndex(s => s.id === this.servicioActual.id);
      if (index >= 0) this.servicios[index] = { ...this.servicioActual };
    } else {
      this.servicioActual.id = Date.now();
      this.servicios.push({ ...this.servicioActual });
    }
    this.cerrarModal();
  }

  eliminarServicio(id: number): void {
    if (confirm('Eliminar este servicio?')) {
      this.servicios = this.servicios.filter(s => s.id !== id);
    }
  }

  toggleActivo(servicio: Servicio): void {
    servicio.activo = !servicio.activo;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  }
}

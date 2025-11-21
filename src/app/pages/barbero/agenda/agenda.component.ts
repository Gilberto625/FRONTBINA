import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { CitasService } from '../../../services/citas.service';

interface CitaAgenda {
  id: number;
  cliente: string;
  telefono: string;
  servicios: string[];
  fecha: string;
  hora: string;
  duracion: number;
  precio: number;
  estado: 'pendiente' | 'confirmada' | 'en_proceso' | 'completada' | 'cancelada';
  notas?: string;
}

@Component({
  selector: 'app-barbero-agenda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './agenda.component.html',
  styleUrls: ['./agenda.component.css']
})
export class BarberoAgendaComponent implements OnInit {
  citas: CitaAgenda[] = [];
  fechaSeleccionada = new Date();
  isLoading = true;

  mockCitas: CitaAgenda[] = [
    {
      id: 1,
      cliente: 'Juan Perez',
      telefono: '555-0123',
      servicios: ['Corte Clasico', 'Arreglo Barba'],
      fecha: new Date().toISOString().split('T')[0],
      hora: '09:00',
      duracion: 50,
      precio: 250,
      estado: 'confirmada'
    },
    {
      id: 2,
      cliente: 'Carlos Ruiz',
      telefono: '555-0456',
      servicios: ['Corte Moderno'],
      fecha: new Date().toISOString().split('T')[0],
      hora: '10:30',
      duracion: 35,
      precio: 200,
      estado: 'pendiente'
    }
  ];

  constructor(
    private authService: AuthService,
    private citasService: CitasService
  ) {}

  ngOnInit(): void {
    this.loadCitas();
  }

  async loadCitas(): Promise<void> {
    this.isLoading = true;
    try {
      this.citas = this.mockCitas;
    } finally {
      this.isLoading = false;
    }
  }

  get citasDelDia(): CitaAgenda[] {
    const fechaStr = this.fechaSeleccionada.toISOString().split('T')[0];
    return this.citas
      .filter(cita => cita.fecha === fechaStr)
      .sort((a, b) => a.hora.localeCompare(b.hora));
  }

  cambiarFecha(dias: number): void {
    const nuevaFecha = new Date(this.fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    this.fechaSeleccionada = nuevaFecha;
  }

  async cambiarEstado(cita: CitaAgenda, estado: CitaAgenda['estado']): Promise<void> {
    cita.estado = estado;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  getEstadoClass(estado: string): string {
    const clases: { [key: string]: string } = {
      'confirmada': 'estado-confirmada',
      'pendiente': 'estado-pendiente',
      'en_proceso': 'estado-proceso',
      'completada': 'estado-completada',
      'cancelada': 'estado-cancelada'
    };
    return clases[estado] || '';
  }
}

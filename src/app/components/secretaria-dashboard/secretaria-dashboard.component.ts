import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { SecretariaService } from '../../services/secretaria.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-secretaria-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './secretaria-dashboard.component.html',
  styleUrl: './secretaria-dashboard.component.css'
})
export class SecretariaDashboardComponent implements OnInit {
  estadisticas: {
    citasHoy: number;
    citasPendientes: number;
    comprasPendientes: number;
    pagosPendientes: number;
    productosBajoStock: number;
  } = {
    citasHoy: 0,
    citasPendientes: 0,
    comprasPendientes: 0,
    pagosPendientes: 0,
    productosBajoStock: 0
  };
  cargando = true;

  constructor(
    private secretariaService: SecretariaService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  cargarEstadisticas(): void {
    this.cargando = true;
    
    // Obtener fecha de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicio = hoy.toISOString();
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    const fechaFin = manana.toISOString();

    forkJoin({
      agendaHoy: this.secretariaService.obtenerAgenda({ fecha_inicio: fechaInicio, fecha_fin: fechaFin }),
      agendaPendiente: this.secretariaService.obtenerAgenda({ estado: 'pendiente' }),
      compras: this.secretariaService.listarCompras({ estado: 'apartado', pagado: false }),
      pagos: this.secretariaService.listarPagos({ estado: 'pendiente' }),
      productos: this.secretariaService.productosBajoStock()
    }).subscribe({
      next: ({ agendaHoy, agendaPendiente, compras, pagos, productos }: any) => {
        if (agendaHoy?.exito) this.estadisticas.citasHoy = agendaHoy.datos?.citas?.length || 0;
        if (agendaPendiente?.exito) this.estadisticas.citasPendientes = agendaPendiente.datos?.citas?.length || 0;
        if (compras?.exito) this.estadisticas.comprasPendientes = compras.datos?.compras?.length || 0;
        if (pagos?.exito) this.estadisticas.pagosPendientes = pagos.datos?.pagos?.length || 0;
        if (productos?.exito) this.estadisticas.productosBajoStock = productos.datos?.productos?.length || 0;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
        this.modalService.showError('Error al cargar estadísticas del dashboard');
        this.cargando = false;
      }
    });
  }

  formatearNumero(num: number): string {
    return num.toLocaleString('es-MX');
  }
}

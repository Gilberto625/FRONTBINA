import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportesService } from '../../../services/reportes.service';

interface ReporteConfig {
  tipo: string;
  nombre: string;
  descripcion: string;
  icono: string;
  parametros: any;
  generando?: boolean;
}

interface FiltroReporte {
  fecha_inicio: string;
  fecha_fin: string;
  tipo_reporte: string;
  formato: 'excel' | 'pdf';
  incluir_graficos: boolean;
  barbero_id?: number;
  servicio_id?: number;
  categoria_id?: number;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.css']
})
export class ReportesComponent implements OnInit {
  reportesDisponibles: ReporteConfig[] = [
    {
      tipo: 'ventas',
      nombre: 'Reporte de Ventas',
      descripcion: 'Análisis detallado de ventas por período, productos y servicios',
      icono: 'fas fa-chart-line',
      parametros: {}
    },
    {
      tipo: 'citas',
      nombre: 'Reporte de Citas',
      descripcion: 'Estadísticas de citas agendadas, completadas y canceladas',
      icono: 'fas fa-calendar-check',
      parametros: {}
    },
    {
      tipo: 'productos',
      nombre: 'Reporte de Productos',
      descripcion: 'Inventario, rotación y productos más vendidos',
      icono: 'fas fa-boxes',
      parametros: {}
    },
    {
      tipo: 'empleados',
      nombre: 'Reporte de Empleados',
      descripcion: 'Rendimiento, productividad y estadísticas del personal',
      icono: 'fas fa-users',
      parametros: {}
    },
    {
      tipo: 'clientes',
      nombre: 'Reporte de Clientes',
      descripcion: 'Análisis de clientes, frecuencia y preferencias',
      icono: 'fas fa-user-friends',
      parametros: {}
    },
    {
      tipo: 'financiero',
      nombre: 'Reporte Financiero',
      descripcion: 'Ingresos, gastos y análisis de rentabilidad',
      icono: 'fas fa-dollar-sign',
      parametros: {}
    },
    {
      tipo: 'demanda',
      nombre: 'Análisis de Demanda',
      descripcion: 'Patrones de demanda por días, horas y servicios',
      icono: 'fas fa-chart-bar',
      parametros: {}
    },
    {
      tipo: 'personalizado',
      nombre: 'Reporte Personalizado',
      descripcion: 'Crea reportes con métricas específicas',
      icono: 'fas fa-cogs',
      parametros: {}
    }
  ];

  filtros: FiltroReporte = {
    fecha_inicio: '',
    fecha_fin: '',
    tipo_reporte: '',
    formato: 'excel',
    incluir_graficos: true
  };

  reporteSeleccionado: ReporteConfig | null = null;
  mostrarModalReporte = false;
  generandoReporte = false;

  // Datos para filtros
  barberos: any[] = [];
  servicios: any[] = [];
  categorias: any[] = [];

  // Historial de reportes
  historialReportes: any[] = [];
  cargandoHistorial = false;

  constructor(private reportesService: ReportesService) {
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    this.filtros.fecha_fin = hoy.toISOString().split('T')[0];
    this.filtros.fecha_inicio = hace30Dias.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.cargarDatosIniciales();
  }

  async cargarDatosIniciales(): Promise<void> {
    try {
      await Promise.all([
        this.cargarBarberos(),
        this.cargarServicios(),
        this.cargarCategorias(),
        this.cargarHistorialReportes()
      ]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  }

  async cargarBarberos(): Promise<void> {
    try {
      this.barberos = await this.reportesService.getBarberos().toPromise() || [];
    } catch (error) {
      console.error('Error cargando barberos:', error);
    }
  }

  async cargarServicios(): Promise<void> {
    try {
      this.servicios = await this.reportesService.getServicios().toPromise() || [];
    } catch (error) {
      console.error('Error cargando servicios:', error);
    }
  }

  async cargarCategorias(): Promise<void> {
    try {
      this.categorias = await this.reportesService.getCategorias().toPromise() || [];
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  }

  async cargarHistorialReportes(): Promise<void> {
    this.cargandoHistorial = true;
    try {
      this.historialReportes = await this.reportesService.getHistorialReportes().toPromise() || [];
    } catch (error) {
      console.error('Error cargando historial:', error);
    } finally {
      this.cargandoHistorial = false;
    }
  }

  seleccionarReporte(reporte: ReporteConfig): void {
    this.reporteSeleccionado = { ...reporte };
    this.filtros.tipo_reporte = reporte.tipo;
    this.mostrarModalReporte = true;
  }

  cerrarModalReporte(): void {
    this.mostrarModalReporte = false;
    this.reporteSeleccionado = null;
    this.resetearFiltros();
  }

  resetearFiltros(): void {
    const fechaInicio = this.filtros.fecha_inicio;
    const fechaFin = this.filtros.fecha_fin;
    
    this.filtros = {
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      tipo_reporte: '',
      formato: 'excel',
      incluir_graficos: true
    };
  }

  async generarReporte(): Promise<void> {
    if (!this.validarFiltros()) {
      return;
    }

    this.generandoReporte = true;
    try {
      const blob = await this.reportesService.generarReporte(this.filtros).toPromise();
      
      if (blob) {
        this.descargarArchivo(blob, this.generarNombreArchivo());
        await this.cargarHistorialReportes();
        this.cerrarModalReporte();
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte. Por favor, inténtalo de nuevo.');
    } finally {
      this.generandoReporte = false;
    }
  }

  validarFiltros(): boolean {
    if (!this.filtros.fecha_inicio || !this.filtros.fecha_fin) {
      alert('Por favor, selecciona las fechas de inicio y fin.');
      return false;
    }

    if (new Date(this.filtros.fecha_inicio) > new Date(this.filtros.fecha_fin)) {
      alert('La fecha de inicio no puede ser mayor que la fecha de fin.');
      return false;
    }

    return true;
  }

  generarNombreArchivo(): string {
    const fecha = new Date().toISOString().split('T')[0];
    const tipo = this.filtros.tipo_reporte;
    const extension = this.filtros.formato === 'excel' ? 'xlsx' : 'pdf';
    
    return `reporte_${tipo}_${fecha}.${extension}`;
  }

  descargarArchivo(blob: Blob, nombreArchivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  async descargarReporteHistorial(reporte: any): Promise<void> {
    try {
      const blob = await this.reportesService.descargarReporte(reporte.id).toPromise();
      if (blob) {
        this.descargarArchivo(blob, reporte.nombre_archivo);
      }
    } catch (error) {
      console.error('Error descargando reporte:', error);
      alert('Error al descargar el reporte.');
    }
  }

  async eliminarReporteHistorial(reporte: any): Promise<void> {
    if (!confirm(`¿Estás seguro de que deseas eliminar el reporte "${reporte.nombre}"?`)) {
      return;
    }

    try {
      await this.reportesService.eliminarReporte(reporte.id).toPromise();
      await this.cargarHistorialReportes();
    } catch (error) {
      console.error('Error eliminando reporte:', error);
      alert('Error al eliminar el reporte.');
    }
  }

  establecerPeriodoRapido(periodo: string): void {
    const hoy = new Date();
    let fechaInicio = new Date();

    switch (periodo) {
      case 'hoy':
        fechaInicio = new Date(hoy);
        break;
      case 'semana':
        fechaInicio.setDate(hoy.getDate() - 7);
        break;
      case 'mes':
        fechaInicio.setMonth(hoy.getMonth() - 1);
        break;
      case 'trimestre':
        fechaInicio.setMonth(hoy.getMonth() - 3);
        break;
      case 'año':
        fechaInicio.setFullYear(hoy.getFullYear() - 1);
        break;
    }

    this.filtros.fecha_inicio = fechaInicio.toISOString().split('T')[0];
    this.filtros.fecha_fin = hoy.toISOString().split('T')[0];
  }

  async programarReporte(): Promise<void> {
    // Implementar programación de reportes automáticos
    console.log('Programar reporte automático');
  }

  async enviarReportePorEmail(): Promise<void> {
    if (!this.validarFiltros()) {
      return;
    }

    try {
      await this.reportesService.enviarReportePorEmail(this.filtros).toPromise();
      alert('Reporte enviado por email exitosamente.');
      this.cerrarModalReporte();
    } catch (error) {
      console.error('Error enviando reporte por email:', error);
      alert('Error al enviar el reporte por email.');
    }
  }

  getIconoFormato(formato: string): string {
    switch (formato) {
      case 'excel':
        return 'fas fa-file-excel';
      case 'pdf':
        return 'fas fa-file-pdf';
      default:
        return 'fas fa-file';
    }
  }

  getColorFormato(formato: string): string {
    switch (formato) {
      case 'excel':
        return 'success';
      case 'pdf':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

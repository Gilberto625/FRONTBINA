import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfiguracionService } from '../../../services/configuracion.service';

interface ConfiguracionGeneral {
  nombre_negocio: string;
  direccion: string;
  telefono: string;
  email: string;
  sitio_web: string;
  descripcion: string;
  horario_atencion: {
    lunes: { abierto: boolean; inicio: string; fin: string; };
    martes: { abierto: boolean; inicio: string; fin: string; };
    miercoles: { abierto: boolean; inicio: string; fin: string; };
    jueves: { abierto: boolean; inicio: string; fin: string; };
    viernes: { abierto: boolean; inicio: string; fin: string; };
    sabado: { abierto: boolean; inicio: string; fin: string; };
    domingo: { abierto: boolean; inicio: string; fin: string; };
  };
}

interface ConfiguracionCitas {
  anticipacion_minima_alta_demanda: number;
  anticipacion_minima_baja_demanda: number;
  cancelacion_minima_alta_demanda: number;
  cancelacion_minima_baja_demanda: number;
  duracion_cita_default: number;
  tiempo_espera_maximo: number;
  permitir_citas_simultaneas: boolean;
  recordatorio_24h: boolean;
  recordatorio_1_5h: boolean;
  anticipo_primera_cita: boolean;
  porcentaje_anticipo: number;
  citas_penalizacion: number;
}

interface ConfiguracionPagos {
  metodos_pago_activos: string[];
  banorte_activo: boolean;
  efectivo_activo: boolean;
  transferencia_activa: boolean;
  comision_tarjeta: number;
  iva_incluido: boolean;
  porcentaje_iva: number;
}

interface ConfiguracionNotificaciones {
  email_activo: boolean;
  sms_activo: boolean;
  whatsapp_activo: boolean;
  push_activo: boolean;
  plantillas_email: any[];
  plantillas_sms: any[];
  plantillas_whatsapp: any[];
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  tabActiva = 'general';
  guardando = false;
  cargando = false;

  configuracionGeneral: ConfiguracionGeneral = {
    nombre_negocio: '',
    direccion: '',
    telefono: '',
    email: '',
    sitio_web: '',
    descripcion: '',
    horario_atencion: {
      lunes: { abierto: true, inicio: '09:00', fin: '18:00' },
      martes: { abierto: true, inicio: '09:00', fin: '18:00' },
      miercoles: { abierto: true, inicio: '09:00', fin: '18:00' },
      jueves: { abierto: true, inicio: '09:00', fin: '18:00' },
      viernes: { abierto: true, inicio: '09:00', fin: '18:00' },
      sabado: { abierto: true, inicio: '09:00', fin: '16:00' },
      domingo: { abierto: false, inicio: '09:00', fin: '16:00' }
    }
  };

  configuracionCitas: ConfiguracionCitas = {
    anticipacion_minima_alta_demanda: 3,
    anticipacion_minima_baja_demanda: 1,
    cancelacion_minima_alta_demanda: 2,
    cancelacion_minima_baja_demanda: 1,
    duracion_cita_default: 60,
    tiempo_espera_maximo: 10,
    permitir_citas_simultaneas: false,
    recordatorio_24h: true,
    recordatorio_1_5h: true,
    anticipo_primera_cita: false,
    porcentaje_anticipo: 50,
    citas_penalizacion: 10
  };

  configuracionPagos: ConfiguracionPagos = {
    metodos_pago_activos: ['efectivo', 'transferencia', 'banorte'],
    banorte_activo: true,
    efectivo_activo: true,
    transferencia_activa: true,
    comision_tarjeta: 3.5,
    iva_incluido: true,
    porcentaje_iva: 16
  };

  configuracionNotificaciones: ConfiguracionNotificaciones = {
    email_activo: true,
    sms_activo: false,
    whatsapp_activo: true,
    push_activo: true,
    plantillas_email: [],
    plantillas_sms: [],
    plantillas_whatsapp: []
  };

  // Configuraciones adicionales
  diasSemana = [
    { key: 'lunes', nombre: 'Lunes' },
    { key: 'martes', nombre: 'Martes' },
    { key: 'miercoles', nombre: 'Miércoles' },
    { key: 'jueves', nombre: 'Jueves' },
    { key: 'viernes', nombre: 'Viernes' },
    { key: 'sabado', nombre: 'Sábado' },
    { key: 'domingo', nombre: 'Domingo' }
  ];

  metodosPagoDisponibles = [
    { key: 'efectivo', nombre: 'Efectivo' },
    { key: 'transferencia', nombre: 'Transferencia Bancaria' },
    { key: 'banorte', nombre: 'Tarjeta (Banorte)' }
  ];

  constructor(private configuracionService: ConfiguracionService) {}

  ngOnInit(): void {
    this.cargarConfiguraciones();
  }

  async cargarConfiguraciones(): Promise<void> {
    this.cargando = true;
    try {
      await Promise.all([
        this.cargarConfiguracionGeneral(),
        this.cargarConfiguracionCitas(),
        this.cargarConfiguracionPagos(),
        this.cargarConfiguracionNotificaciones()
      ]);
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    } finally {
      this.cargando = false;
    }
  }

  async cargarConfiguracionGeneral(): Promise<void> {
    try {
      const config = await this.configuracionService.getConfiguracionGeneral().toPromise();
      if (config) {
        this.configuracionGeneral = { ...this.configuracionGeneral, ...config };
      }
    } catch (error) {
      console.error('Error cargando configuración general:', error);
    }
  }

  async cargarConfiguracionCitas(): Promise<void> {
    try {
      const config = await this.configuracionService.getConfiguracionCitas().toPromise();
      if (config) {
        this.configuracionCitas = { ...this.configuracionCitas, ...config };
      }
    } catch (error) {
      console.error('Error cargando configuración de citas:', error);
    }
  }

  async cargarConfiguracionPagos(): Promise<void> {
    try {
      const config = await this.configuracionService.getConfiguracionPagos().toPromise();
      if (config) {
        this.configuracionPagos = { ...this.configuracionPagos, ...config };
      }
    } catch (error) {
      console.error('Error cargando configuración de pagos:', error);
    }
  }

  async cargarConfiguracionNotificaciones(): Promise<void> {
    try {
      const config = await this.configuracionService.getConfiguracionNotificaciones().toPromise();
      if (config) {
        this.configuracionNotificaciones = { ...this.configuracionNotificaciones, ...config };
      }
    } catch (error) {
      console.error('Error cargando configuración de notificaciones:', error);
    }
  }

  cambiarTab(tab: string): void {
    this.tabActiva = tab;
  }

  async guardarConfiguracion(): Promise<void> {
    this.guardando = true;
    try {
      switch (this.tabActiva) {
        case 'general':
          await this.configuracionService.actualizarConfiguracionGeneral(this.configuracionGeneral).toPromise();
          break;
        case 'citas':
          await this.configuracionService.actualizarConfiguracionCitas(this.configuracionCitas).toPromise();
          break;
        case 'pagos':
          await this.configuracionService.actualizarConfiguracionPagos(this.configuracionPagos).toPromise();
          break;
        case 'notificaciones':
          await this.configuracionService.actualizarConfiguracionNotificaciones(this.configuracionNotificaciones).toPromise();
          break;
      }
      
      alert('Configuración guardada exitosamente');
    } catch (error) {
      console.error('Error guardando configuración:', error);
      alert('Error al guardar la configuración');
    } finally {
      this.guardando = false;
    }
  }

  toggleMetodoPago(metodo: string): void {
    const index = this.configuracionPagos.metodos_pago_activos.indexOf(metodo);
    if (index > -1) {
      this.configuracionPagos.metodos_pago_activos.splice(index, 1);
    } else {
      this.configuracionPagos.metodos_pago_activos.push(metodo);
    }
  }

  isMetodoPagoActivo(metodo: string): boolean {
    return this.configuracionPagos.metodos_pago_activos.includes(metodo);
  }

  getHorarioDia(dia: string): { abierto: boolean; inicio: string; fin: string } {
    return this.configuracionGeneral.horario_atencion[dia as keyof typeof this.configuracionGeneral.horario_atencion];
  }

  toggleDiaAbierto(dia: string): void {
    this.configuracionGeneral.horario_atencion[dia as keyof typeof this.configuracionGeneral.horario_atencion].abierto = 
      !this.configuracionGeneral.horario_atencion[dia as keyof typeof this.configuracionGeneral.horario_atencion].abierto;
  }

  copiarHorario(diaOrigen: string): void {
    const horarioOrigen = this.configuracionGeneral.horario_atencion[diaOrigen as keyof typeof this.configuracionGeneral.horario_atencion];
    
    this.diasSemana.forEach(dia => {
      if (dia.key !== diaOrigen) {
        this.configuracionGeneral.horario_atencion[dia.key as keyof typeof this.configuracionGeneral.horario_atencion] = {
          ...horarioOrigen
        };
      }
    });
  }

  async resetearConfiguracion(): Promise<void> {
    if (!confirm('¿Estás seguro de que deseas resetear la configuración a los valores por defecto?')) {
      return;
    }

    try {
      await this.configuracionService.resetearConfiguracion(this.tabActiva).toPromise();
      await this.cargarConfiguraciones();
      alert('Configuración reseteada exitosamente');
    } catch (error) {
      console.error('Error reseteando configuración:', error);
      alert('Error al resetear la configuración');
    }
  }

  async exportarConfiguracion(): Promise<void> {
    try {
      const blob = await this.configuracionService.exportarConfiguracion().toPromise();
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `configuracion_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exportando configuración:', error);
      alert('Error al exportar la configuración');
    }
  }

  async importarConfiguracion(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await this.configuracionService.importarConfiguracion(file).toPromise();
      await this.cargarConfiguraciones();
      alert('Configuración importada exitosamente');
    } catch (error) {
      console.error('Error importando configuración:', error);
      alert('Error al importar la configuración');
    }
  }

  async probarNotificacion(tipo: string): Promise<void> {
    try {
      await this.configuracionService.probarNotificacion(tipo).toPromise();
      alert(`Notificación de prueba enviada por ${tipo}`);
    } catch (error) {
      console.error('Error enviando notificación de prueba:', error);
      alert('Error al enviar la notificación de prueba');
    }
  }

  validarConfiguracion(): boolean {
    switch (this.tabActiva) {
      case 'general':
        return !!(this.configuracionGeneral.nombre_negocio && 
                 this.configuracionGeneral.telefono && 
                 this.configuracionGeneral.email);
      case 'citas':
        return this.configuracionCitas.anticipacion_minima_alta_demanda > 0 &&
               this.configuracionCitas.anticipacion_minima_baja_demanda > 0;
      case 'pagos':
        return this.configuracionPagos.metodos_pago_activos.length > 0;
      case 'notificaciones':
        return true; // Las notificaciones son opcionales
      default:
        return true;
    }
  }

  getTabTitle(tab: string): string {
    const titles: { [key: string]: string } = {
      'general': 'Configuración General',
      'citas': 'Configuración de Citas',
      'pagos': 'Configuración de Pagos',
      'notificaciones': 'Configuración de Notificaciones'
    };
    return titles[tab] || 'Configuración';
  }
}

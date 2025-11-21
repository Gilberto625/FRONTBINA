import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CuentasNegocioService, CuentaBancariaNegocio, EstadisticasCuentas } from '../../../services/cuentas-negocio.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-cuentas-bancarias',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './cuentas-bancarias.component.html',
  styleUrls: ['./cuentas-bancarias.component.css']
})
export class CuentasBancariasComponent implements OnInit {
  cuentas: CuentaBancariaNegocio[] = [];
  estadisticas: EstadisticasCuentas | null = null;
  bancosDisponibles: any[] = [];
  
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Modales
  showCrearModal = false;
  showEditarModal = false;
  showEliminarModal = false;
  
  // Formularios
  crearForm: FormGroup;
  editarForm: FormGroup;
  
  // Cuenta seleccionada
  cuentaSeleccionada: CuentaBancariaNegocio | null = null;
  
  // Estados de carga
  isCreating = false;
  isUpdating = false;
  isDeleting = false;
  isTesting = false;

  constructor(
    private cuentasService: CuentasNegocioService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.crearForm = this.fb.group({
      nombre_cuenta: ['', [Validators.required, Validators.minLength(3)]],
      banco: ['', Validators.required],
      numero_cuenta: ['', [Validators.required, Validators.pattern(/^\d{10,18}$/)]],
      clabe: ['', [Validators.required, Validators.pattern(/^\d{18}$/)]],
      nombre_titular: ['', [Validators.required, Validators.minLength(3)]],
      sucursal: [''],
      es_principal: [false],
      merchant_id_banorte: [''],
      terminal_id_banorte: [''],
      notas_internas: ['']
    });

    this.editarForm = this.fb.group({
      nombre_cuenta: ['', [Validators.required, Validators.minLength(3)]],
      numero_cuenta: ['', [Validators.required, Validators.pattern(/^\d{10,18}$/)]],
      clabe: ['', [Validators.required, Validators.pattern(/^\d{18}$/)]],
      nombre_titular: ['', [Validators.required, Validators.minLength(3)]],
      sucursal: [''],
      merchant_id_banorte: [''],
      terminal_id_banorte: [''],
      notas_internas: ['']
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;

      // Cargar datos en paralelo
      const [cuentas, estadisticas, bancos] = await Promise.all([
        this.cuentasService.getCuentasNegocio().toPromise(),
        this.cuentasService.getEstadisticasCuentas().toPromise(),
        this.cuentasService.getBancosDisponibles().toPromise()
      ]);

      this.cuentas = cuentas || [];
      this.estadisticas = estadisticas || null;
      this.bancosDisponibles = bancos || [];

    } catch (error) {
      console.error('Error loading data:', error);
      this.error = 'Error al cargar los datos. Por favor, intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  // Gestión de modales
  abrirModalCrear(): void {
    this.showCrearModal = true;
    this.crearForm.reset();
    this.clearMessages();
  }

  abrirModalEditar(cuenta: CuentaBancariaNegocio): void {
    this.cuentaSeleccionada = cuenta;
    this.showEditarModal = true;
    
    // Llenar formulario con datos actuales
    this.editarForm.patchValue({
      nombre_cuenta: cuenta.nombre_cuenta,
      numero_cuenta: cuenta.numero_cuenta,
      clabe: cuenta.clabe,
      nombre_titular: cuenta.nombre_titular,
      sucursal: cuenta.sucursal || '',
      merchant_id_banorte: cuenta.merchant_id_banorte || '',
      terminal_id_banorte: cuenta.terminal_id_banorte || '',
      notas_internas: cuenta.notas_internas || ''
    });
    
    this.clearMessages();
  }

  abrirModalEliminar(cuenta: CuentaBancariaNegocio): void {
    this.cuentaSeleccionada = cuenta;
    this.showEliminarModal = true;
    this.clearMessages();
  }

  cerrarModales(): void {
    this.showCrearModal = false;
    this.showEditarModal = false;
    this.showEliminarModal = false;
    this.cuentaSeleccionada = null;
    this.clearMessages();
  }

  // CRUD Operations
  async crearCuenta(): Promise<void> {
    if (this.crearForm.invalid) {
      this.markFormGroupTouched(this.crearForm);
      return;
    }

    try {
      this.isCreating = true;
      this.clearMessages();

      const nuevaCuenta = await this.cuentasService.crearCuentaNegocio(this.crearForm.value).toPromise();
      
      if (nuevaCuenta) {
        this.cuentas.push(nuevaCuenta);
        this.successMessage = 'Cuenta bancaria creada exitosamente';
        this.cerrarModales();
        await this.loadData(); // Recargar para actualizar estadísticas
      }

    } catch (error: any) {
      console.error('Error creating account:', error);
      this.error = error.message || 'Error al crear la cuenta bancaria';
    } finally {
      this.isCreating = false;
    }
  }

  async editarCuenta(): Promise<void> {
    if (this.editarForm.invalid || !this.cuentaSeleccionada) {
      this.markFormGroupTouched(this.editarForm);
      return;
    }

    try {
      this.isUpdating = true;
      this.clearMessages();

      const cuentaActualizada = await this.cuentasService.modificarCuentaNegocio(
        this.cuentaSeleccionada.id,
        this.editarForm.value
      ).toPromise();

      if (cuentaActualizada) {
        // Actualizar en la lista local
        const index = this.cuentas.findIndex(c => c.id === this.cuentaSeleccionada!.id);
        if (index !== -1) {
          this.cuentas[index] = cuentaActualizada;
        }
        
        this.successMessage = 'Cuenta bancaria actualizada exitosamente';
        this.cerrarModales();
      }

    } catch (error: any) {
      console.error('Error updating account:', error);
      this.error = error.message || 'Error al actualizar la cuenta bancaria';
    } finally {
      this.isUpdating = false;
    }
  }

  async eliminarCuenta(motivo: string): Promise<void> {
    if (!this.cuentaSeleccionada || !motivo.trim()) {
      this.error = 'Debe proporcionar un motivo para eliminar la cuenta';
      return;
    }

    try {
      this.isDeleting = true;
      this.clearMessages();

      await this.cuentasService.eliminarCuentaNegocio(this.cuentaSeleccionada.id, motivo).toPromise();
      
      // Remover de la lista local
      this.cuentas = this.cuentas.filter(c => c.id !== this.cuentaSeleccionada!.id);
      
      this.successMessage = 'Cuenta bancaria eliminada exitosamente';
      this.cerrarModales();
      await this.loadData(); // Recargar estadísticas

    } catch (error: any) {
      console.error('Error deleting account:', error);
      this.error = error.message || 'Error al eliminar la cuenta bancaria';
    } finally {
      this.isDeleting = false;
    }
  }

  async marcarComoPrincipal(cuenta: CuentaBancariaNegocio): Promise<void> {
    if (cuenta.es_principal) return;

    try {
      this.clearMessages();
      
      await this.cuentasService.marcarComoPrincipal(cuenta.id).toPromise();
      
      // Actualizar estado local
      this.cuentas.forEach(c => {
        c.es_principal = c.id === cuenta.id;
      });
      
      this.successMessage = `"${cuenta.nombre_cuenta}" marcada como cuenta principal`;
      await this.loadData(); // Recargar estadísticas

    } catch (error: any) {
      console.error('Error setting as principal:', error);
      this.error = error.message || 'Error al marcar como cuenta principal';
    }
  }

  async cambiarEstado(cuenta: CuentaBancariaNegocio, nuevoEstado: 'activa' | 'inactiva' | 'suspendida'): Promise<void> {
    if (cuenta.estado === nuevoEstado) return;

    const motivo = prompt(`Motivo para ${nuevoEstado === 'activa' ? 'activar' : 'desactivar'} la cuenta:`);
    if (!motivo) return;

    try {
      this.clearMessages();
      
      await this.cuentasService.cambiarEstadoCuenta(cuenta.id, nuevoEstado, motivo).toPromise();
      
      // Actualizar estado local
      const index = this.cuentas.findIndex(c => c.id === cuenta.id);
      if (index !== -1) {
        this.cuentas[index].estado = nuevoEstado;
      }
      
      this.successMessage = `Estado de cuenta actualizado a "${nuevoEstado}"`;

    } catch (error: any) {
      console.error('Error changing status:', error);
      this.error = error.message || 'Error al cambiar el estado de la cuenta';
    }
  }

  async probarConexion(cuenta: CuentaBancariaNegocio): Promise<void> {
    try {
      this.isTesting = true;
      this.clearMessages();

      const resultado = await this.cuentasService.probarConexionBanorte(cuenta.id).toPromise();
      
      if (resultado?.exitosa) {
        this.successMessage = `Conexión exitosa: ${resultado.mensaje}`;
      } else {
        this.error = `Error en conexión: ${resultado?.mensaje || 'Error desconocido'}`;
      }

    } catch (error: any) {
      console.error('Error testing connection:', error);
      this.error = error.message || 'Error al probar la conexión';
    } finally {
      this.isTesting = false;
    }
  }

  // Utilidades
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private clearMessages(): void {
    this.error = null;
    this.successMessage = null;
  }

  // Getters para templates
  get cuentaPrincipal(): CuentaBancariaNegocio | null {
    return this.cuentas.find(c => c.es_principal) || null;
  }

  get cuentasSecundarias(): CuentaBancariaNegocio[] {
    return this.cuentas.filter(c => !c.es_principal);
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'activa': return 'estado-activa';
      case 'inactiva': return 'estado-inactiva';
      case 'suspendida': return 'estado-suspendida';
      default: return '';
    }
  }

  getEstadoText(estado: string): string {
    switch (estado) {
      case 'activa': return 'Activa';
      case 'inactiva': return 'Inactiva';
      case 'suspendida': return 'Suspendida';
      default: return estado;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PagoService, MetodoPago } from '../../services/pago.service';
import { CompraService } from '../../services/compra.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-pagar-compra',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './pagar-compra.component.html',
  styleUrl: './pagar-compra.component.css'
})
export class PagarCompraComponent implements OnInit {
  compraId!: number;
  cargando = false;
  procesando = false;

  // Datos de la compra (estético + para monto)
  compra: any = null;

  metodoPago: MetodoPago = 'transferencia';
  idOperacion = '';

  // Para mostrar “congelado” / error Mercado Pago SDK
  errorCode: number | null = null;
  errorMensaje = '';
  mpInitPoint: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pagoService: PagoService,
    private compraService: CompraService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    const idStr = this.route.snapshot.paramMap.get('id');
    const id = idStr ? Number(idStr) : NaN;
    if (!id || Number.isNaN(id)) {
      this.modalService.mostrarError('Error', 'Compra inválida.');
      this.router.navigate(['/mis-compras']);
      return;
    }
    this.compraId = id;
    this.cargarCompra();
  }

  cargarCompra(): void {
    this.cargando = true;
    this.compraService.obtenerDetalleCompra(this.compraId).subscribe({
      next: (resp: any) => {
        this.cargando = false;
        if (resp?.exito) {
          this.compra = resp.datos?.compra || null;
        } else {
          this.compra = null;
        }
      },
      error: () => {
        this.cargando = false;
        this.compra = null;
      }
    });
  }

  getMonto(): number {
    return Number(this.compra?.total || 0);
  }

  async crearPagoTransferencia(): Promise<void> {
    this.errorCode = null;
    this.errorMensaje = '';
    this.mpInitPoint = null;

    if (!this.idOperacion.trim()) {
      this.modalService.mostrarError('Error', 'Ingresa el ID de operación bancaria.');
      return;
    }

    this.procesando = true;
    try {
      await firstValueFrom(
        this.pagoService.crearPagoCompra({
          compra_id: this.compraId,
          monto: this.getMonto(),
          metodo_pago: 'transferencia',
          id_operacion: this.idOperacion.trim()
        })
      );
      await this.modalService.mostrarExito('Pago creado', 'Tu pago quedó en revisión/validación.');
      this.router.navigate(['/mis-compras']);
    } catch (e: any) {
      this.errorCode = e?.status ?? null;
      this.errorMensaje = e?.error?.mensaje || e?.message || 'Error al crear el pago.';
      this.modalService.mostrarError('Error', `${this.errorMensaje} (${this.errorCode || 'sin código'})`);
    } finally {
      this.procesando = false;
    }
  }

  /**
   * Mercado Pago SDK: lo dejamos pendiente, pero “visible”.
   * - Si el backend no tiene credenciales, normalmente devuelve 500. Mostramos ese error (congelado).
   */
  async intentarMercadoPago(): Promise<void> {
    this.errorCode = null;
    this.errorMensaje = '';
    this.mpInitPoint = null;

    this.procesando = true;
    try {
      const resp: any = await firstValueFrom(
        this.pagoService.crearPagoCompra({
          compra_id: this.compraId,
          monto: this.getMonto(),
          metodo_pago: 'mercado_pago'
        })
      );

      const mp = resp?.datos?.pago?.mercado_pago;
      this.mpInitPoint = mp?.init_point || mp?.sandbox_init_point || null;
      if (!this.mpInitPoint) {
        // “Congelado” como 501 si el backend devuelve respuesta sin init_point
        this.errorCode = 501;
        this.errorMensaje = 'Mercado Pago SDK (frontend) pendiente. No se recibió init_point.';
      }
    } catch (e: any) {
      // Mostrar el error real (400/500) del backend si falta config
      this.errorCode = e?.status ?? null;
      this.errorMensaje = e?.error?.mensaje || e?.message || 'Error Mercado Pago';
    } finally {
      this.procesando = false;
    }
  }

  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(precio);
  }
}


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SecretariaService, CompraSecretaria } from '../../services/secretaria.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-secretaria-compras',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './secretaria-compras.component.html',
  styleUrl: './secretaria-compras.component.css'
})
export class SecretariaComprasComponent implements OnInit {
  cargando = false;
  compras: CompraSecretaria[] = [];

  filtroEstado = '';
  filtroPagado = '';
  idPago: Record<number, string> = {};

  constructor(
    private secretariaService: SecretariaService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    const filtros: any = {};
    if (this.filtroEstado) filtros.estado = this.filtroEstado;
    if (this.filtroPagado === 'true') filtros.pagado = true;
    if (this.filtroPagado === 'false') filtros.pagado = false;

    this.secretariaService.listarCompras(filtros).subscribe({
      next: (r: any) => {
        this.cargando = false;
        if (r?.exito) {
          this.compras = r.datos?.compras || [];
        } else {
          this.modalService.mostrarError('Error', r?.mensaje || 'No se pudieron cargar compras.');
        }
      },
      error: (e: any) => {
        this.cargando = false;
        const msg = e?.error?.mensaje || 'No se pudieron cargar compras.';
        this.modalService.mostrarError('Error', msg);
      }
    });
  }

  async validarPago(compra: CompraSecretaria): Promise<void> {
    const id = (this.idPago[compra.id] || '').trim();
    if (!id) {
      this.modalService.mostrarError('Error', 'Ingresa id_pago_transferencia.');
      return;
    }

    const ok = await this.modalService.mostrarConfirmacion(
      'Validar pago de compra',
      `¿Validar compra #${compra.id} con ID "${id}"?`,
      'Validar',
      'Cancelar'
    );
    if (!ok) return;

    this.secretariaService.validarPagoCompra(compra.id, id).subscribe({
      next: async (r: any) => {
        if (r?.exito) {
          await this.modalService.mostrarExito('Compra pagada', 'Pago validado y compra marcada como pagada.');
          this.cargar();
        } else {
          this.modalService.mostrarError('Error', r?.mensaje || 'No se pudo validar.');
        }
      },
      error: (e: any) => {
        const msg = e?.error?.mensaje || 'No se pudo validar.';
        this.modalService.mostrarError('Error', msg);
      }
    });
  }

  totalProductos(compra: CompraSecretaria): number {
    return (compra.productos || []).reduce((acc, it) => acc + (it.cantidad || 0), 0);
  }
}


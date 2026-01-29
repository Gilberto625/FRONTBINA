import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SecretariaService, PagoSecretaria } from '../../services/secretaria.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-secretaria-validar-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './secretaria-validar-pagos.component.html',
  styleUrl: './secretaria-validar-pagos.component.css'
})
export class SecretariaValidarPagosComponent implements OnInit {
  cargando = false;
  pagos: PagoSecretaria[] = [];
  filtroEstado = 'procesando';
  filtroMetodo = 'transferencia';

  // form por pago
  idOperacion: Record<number, string> = {};

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
    if (this.filtroMetodo) filtros.metodo_pago = this.filtroMetodo;

    this.secretariaService.listarPagos(filtros).subscribe({
      next: (r: any) => {
        this.cargando = false;
        if (r?.exito) {
          this.pagos = r.datos?.pagos || [];
        } else {
          this.modalService.mostrarError('Error', r?.mensaje || 'No se pudieron cargar pagos.');
        }
      },
      error: (e: any) => {
        this.cargando = false;
        const msg = e?.error?.mensaje || 'No se pudieron cargar pagos.';
        this.modalService.mostrarError('Error', msg);
      }
    });
  }

  async validar(p: PagoSecretaria): Promise<void> {
    const idOp = (this.idOperacion[p.id] || '').trim();
    if (!idOp) {
      this.modalService.mostrarError('Error', 'Ingresa el ID de operación.');
      return;
    }

    const ok = await this.modalService.mostrarConfirmacion(
      'Validar transferencia',
      `¿Confirmas validar el pago #${p.id} con ID operación "${idOp}"?`,
      'Validar',
      'Cancelar'
    );
    if (!ok) return;

    this.secretariaService.validarTransferencia(p.id, idOp).subscribe({
      next: async (r: any) => {
        if (r?.exito) {
          await this.modalService.mostrarExito('Pago validado', 'Transferencia validada.');
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
}


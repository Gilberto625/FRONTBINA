import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SecretariaService } from '../../services/secretaria.service';
import { ModalService } from '../../services/modal.service';

type OperacionStock = 'aumentar' | 'reducir';

@Component({
  selector: 'app-secretaria-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './secretaria-productos.component.html',
  styleUrl: './secretaria-productos.component.css'
})
export class SecretariaProductosComponent implements OnInit {
  cargando = false;
  productos: any[] = [];

  operacion: OperacionStock = 'aumentar';
  cantidad = 1;
  productoIdManual = '';

  constructor(
    private secretariaService: SecretariaService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.secretariaService.productosBajoStock().subscribe({
      next: (r: any) => {
        this.cargando = false;
        if (r?.exito) this.productos = r.datos?.productos || [];
        else this.modalService.mostrarError('Error', r?.mensaje || 'No se pudo cargar stock bajo.');
      },
      error: (e: any) => {
        this.cargando = false;
        const msg = e?.error?.mensaje || 'No se pudo cargar stock bajo.';
        this.modalService.mostrarError('Error', msg);
      }
    });
  }

  async aplicarStock(productoId: number): Promise<void> {
    if (!this.cantidad || this.cantidad <= 0) {
      this.modalService.mostrarError('Error', 'Cantidad inválida.');
      return;
    }

    const ok = await this.modalService.mostrarConfirmacion(
      'Actualizar stock',
      `¿Confirmas ${this.operacion} ${this.cantidad} unidades al producto #${productoId}?`,
      'Confirmar',
      'Cancelar'
    );
    if (!ok) return;

    this.secretariaService.actualizarStock(productoId, this.operacion, this.cantidad).subscribe({
      next: async (r: any) => {
        if (r?.exito) {
          await this.modalService.mostrarExito('Stock actualizado', r.mensaje || 'Actualizado.');
          this.cargar();
        } else {
          this.modalService.mostrarError('Error', r?.mensaje || 'No se pudo actualizar stock.');
        }
      },
      error: (e: any) => {
        const msg = e?.error?.mensaje || 'No se pudo actualizar stock.';
        this.modalService.mostrarError('Error', msg);
      }
    });
  }

  aplicarManual(): void {
    const id = Number(this.productoIdManual);
    if (!id || Number.isNaN(id)) {
      this.modalService.mostrarError('Error', 'Producto ID inválido.');
      return;
    }
    this.aplicarStock(id);
  }
}


import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalData {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  isVisible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalData>({
    type: 'info',
    title: '',
    message: '',
    isVisible: false
  });

  public modal$ = this.modalSubject.asObservable();

  constructor() {}

  /**
   * Mostrar modal de éxito
   */
  showSuccess(message: string, title: string = 'Éxito'): void {
    this.showModal('success', title, message);
  }

  /**
   * Mostrar modal de error
   */
  showError(message: string, title: string = 'Error'): void {
    this.showModal('error', title, message);
  }

  /**
   * Mostrar modal de información
   */
  showInfo(message: string, title: string = 'Información'): void {
    this.showModal('info', title, message);
  }

  /**
   * Mostrar modal de advertencia
   */
  showWarning(message: string, title: string = 'Advertencia'): void {
    this.showModal('warning', title, message);
  }

  /**
   * Mostrar modal genérico
   */
  private showModal(type: 'success' | 'error' | 'info' | 'warning', title: string, message: string): void {
    this.modalSubject.next({
      type,
      title,
      message,
      isVisible: true
    });

    // Auto-cerrar después de 5 segundos para success e info
    if (type === 'success' || type === 'info') {
      setTimeout(() => {
        this.hideModal();
      }, 5000);
    }
  }

  /**
   * Ocultar modal
   */
  hideModal(): void {
    const currentModal = this.modalSubject.value;
    this.modalSubject.next({
      ...currentModal,
      isVisible: false
    });
  }

  /**
   * Verificar si el modal está visible
   */
  get isVisible(): boolean {
    return this.modalSubject.value.isVisible;
  }
}

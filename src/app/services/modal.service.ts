import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ModalData {
  type: 'success' | 'error' | 'info' | 'warning' | 'confirm';
  title: string;
  message: string;
  showConfirm?: boolean;
  confirmText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalData | null>(null);
  public modal$ = this.modalSubject.asObservable();

  private confirmResolve: ((value: boolean) => void) | null = null;

  constructor() { }

  showSuccess(message: string, title: string = 'Éxito'): void {
    this.modalSubject.next({
      type: 'success',
      title,
      message,
      showConfirm: false
    });
  }

  showError(message: string, title: string = 'Error'): void {
    this.modalSubject.next({
      type: 'error',
      title,
      message,
      showConfirm: false
    });
  }

  showInfo(message: string, title: string = 'Información'): void {
    this.modalSubject.next({
      type: 'info',
      title,
      message,
      showConfirm: false
    });
  }

  showWarning(message: string, title: string = 'Advertencia'): void {
    this.modalSubject.next({
      type: 'warning',
      title,
      message,
      showConfirm: false
    });
  }

  showConfirm(
    message: string, 
    title: string = 'Confirmar',
    confirmText: string = 'Confirmar',
    cancelText: string = 'Cancelar'
  ): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmResolve = resolve;
      this.modalSubject.next({
        type: 'confirm',
        title,
        message,
        showConfirm: true,
        confirmText,
        cancelText
      });
    });
  }

  confirm(): void {
    if (this.confirmResolve) {
      this.confirmResolve(true);
      this.confirmResolve = null;
    }
    this.close();
  }

  cancel(): void {
    if (this.confirmResolve) {
      this.confirmResolve(false);
      this.confirmResolve = null;
    }
    this.close();
  }

  close(): void {
    this.modalSubject.next(null);
  }

  // Métodos de conveniencia para mostrar alertas simples
  alert(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info'): void {
    switch (type) {
      case 'success':
        this.showSuccess(message);
        break;
      case 'error':
        this.showError(message);
        break;
      case 'warning':
        this.showWarning(message);
        break;
      default:
        this.showInfo(message);
        break;
    }
  }

  // Método para mostrar loading
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  showLoading(): void {
    this.loadingSubject.next(true);
  }

  hideLoading(): void {
    this.loadingSubject.next(false);
  }
}
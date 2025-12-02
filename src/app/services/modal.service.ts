import { Injectable } from '@angular/core';

export interface ModalOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  showCancel?: boolean;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  
  /**
   * Mostrar modal de alerta
   */
  showAlert(options: ModalOptions): void {
    try {
      console.log('ModalService: Mostrando modal', options);
      const modal = this.createModal(options);
      document.body.appendChild(modal);
      
      // Animar entrada
      setTimeout(() => {
        modal.classList.add('show');
        console.log('ModalService: Modal mostrado con clase "show"');
      }, 10);
    } catch (error) {
      console.error('ModalService: Error al mostrar modal', error);
      // Fallback: usar alert nativo si falla el modal
      alert(`${options.title || 'Mensaje'}: ${options.message}`);
    }
  }

  /**
   * Mostrar modal de éxito
   */
  showSuccess(message: string, title: string = 'Éxito'): void {
    this.showAlert({
      title,
      message,
      type: 'success'
    });
  }

  /**
   * Mostrar modal de error
   */
  showError(message: string, title: string = 'Error'): void {
    this.showAlert({
      title,
      message,
      type: 'error'
    });
  }

  /**
   * Mostrar modal de información
   */
  showInfo(message: string, title: string = 'Información'): void {
    this.showAlert({
      title,
      message,
      type: 'info'
    });
  }

  /**
   * Mostrar modal de advertencia
   */
  showWarning(message: string, title: string = 'Advertencia'): void {
    this.showAlert({
      title,
      message,
      type: 'warning'
    });
  }

  /**
   * Mostrar modal de confirmación
   */
  showConfirm(options: ModalOptions): void {
    const modal = this.createModal({
      ...options,
      showCancel: true,
      confirmText: options.confirmText || 'Confirmar',
      cancelText: options.cancelText || 'Cancelar'
    });
    document.body.appendChild(modal);
    
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  /**
   * Crear elemento modal (usando createElement en lugar de innerHTML para compatibilidad con CSP)
   */
  private createModal(options: ModalOptions): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    
    const icon = this.getIcon(options.type || 'info');
    const typeClass = options.type || 'info';
    
    // Crear contenedor del modal
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    
    // Crear header
    const modalHeader = document.createElement('div');
    modalHeader.className = `modal-header ${typeClass}`;
    
    const modalIcon = document.createElement('span');
    modalIcon.className = 'modal-icon';
    modalIcon.textContent = icon;
    
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = options.title || this.getDefaultTitle(options.type);
    
    const modalClose = document.createElement('button');
    modalClose.className = 'modal-close';
    modalClose.textContent = '×';
    modalClose.setAttribute('aria-label', 'Cerrar');
    
    modalHeader.appendChild(modalIcon);
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(modalClose);
    
    // Crear body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    const modalMessage = document.createElement('p');
    modalMessage.className = 'modal-message';
    modalMessage.textContent = options.message;
    
    modalBody.appendChild(modalMessage);
    
    // Crear footer
    const modalFooter = document.createElement('div');
    modalFooter.className = 'modal-footer';
    
    let cancelButton: HTMLButtonElement | null = null;
    
    if (options.showCancel) {
      cancelButton = document.createElement('button');
      cancelButton.className = 'modal-btn modal-btn-cancel';
      cancelButton.textContent = options.cancelText || 'Cancelar';
      modalFooter.appendChild(cancelButton);
    }
    
    const confirmButton = document.createElement('button');
    confirmButton.className = `modal-btn modal-btn-confirm ${typeClass}`;
    confirmButton.textContent = options.confirmText || 'Aceptar';
    modalFooter.appendChild(confirmButton);
    
    // Ensamblar modal
    modalContainer.appendChild(modalHeader);
    modalContainer.appendChild(modalBody);
    modalContainer.appendChild(modalFooter);
    modal.appendChild(modalContainer);
    
    // Agregar eventos directamente a los elementos creados
    // Botón cerrar
    modalClose.addEventListener('click', () => {
      this.closeModal(modal);
    });
    
    // Botón confirmar
    confirmButton.addEventListener('click', () => {
      if (options.onConfirm) {
        options.onConfirm();
      }
      this.closeModal(modal);
    });
    
    // Botón cancelar
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        if (options.onCancel) {
          options.onCancel();
        }
        this.closeModal(modal);
      });
    }
    
    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal(modal);
      }
    });
    
    // Cerrar con ESC
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeModal(modal);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
    
    return modal;
  }

  /**
   * Cerrar modal
   */
  private closeModal(modal: HTMLElement): void {
    modal.classList.remove('show');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }

  /**
   * Obtener icono según tipo
   */
  private getIcon(type: string): string {
    switch (type) {
      case 'success': return '✓';
      case 'error': return '✗';
      case 'warning': return '⚠';
      case 'info': return 'ℹ';
      default: return 'ℹ';
    }
  }

  /**
   * Obtener título por defecto
   */
  private getDefaultTitle(type?: string): string {
    switch (type) {
      case 'success': return 'Éxito';
      case 'error': return 'Error';
      case 'warning': return 'Advertencia';
      case 'info': return 'Información';
      default: return 'Mensaje';
    }
  }
}


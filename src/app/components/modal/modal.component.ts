import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ModalService, ModalData } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit, OnDestroy {
  modalData: ModalData | null = null;
  isVisible = false;
  private subscription?: Subscription;

  constructor(private modalService: ModalService) {}

  ngOnInit(): void {
    this.subscription = this.modalService.modal$.subscribe(data => {
      this.modalData = data;
      this.isVisible = !!data;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onConfirm(): void {
    this.modalService.confirm();
  }

  onCancel(): void {
    this.modalService.cancel();
  }

  onClose(): void {
    this.modalService.close();
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      if (this.modalData?.type === 'confirm') {
        this.onCancel();
      } else {
        this.onClose();
      }
    }
  }

  getIconClass(): string {
    switch (this.modalData?.type) {
      case 'success':
        return 'fas fa-check-circle text-success';
      case 'error':
        return 'fas fa-exclamation-circle text-danger';
      case 'warning':
        return 'fas fa-exclamation-triangle text-warning';
      case 'confirm':
        return 'fas fa-question-circle text-primary';
      default:
        return 'fas fa-info-circle text-info';
    }
  }

  getModalClass(): string {
    switch (this.modalData?.type) {
      case 'success':
        return 'modal-success';
      case 'error':
        return 'modal-error';
      case 'warning':
        return 'modal-warning';
      case 'confirm':
        return 'modal-confirm';
      default:
        return 'modal-info';
    }
  }
}

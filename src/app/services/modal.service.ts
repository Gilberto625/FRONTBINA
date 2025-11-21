import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  showError(message: string): void {
    alert('Error: ' + message);
  }

  showSuccess(message: string): void {
    alert(message);
  }

  showInfo(message: string): void {
    alert(message);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, Usuario } from '../../services/auth.service';
import { ProductService, Product } from '../../services/product.service';
import { ModalService } from '../../services/modal.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  currentUser: Usuario | null = null;
  products: Product[] = [];
  loadingProducts = false;
  notificacionesCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private productService: ProductService,
    private modalService: ModalService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Obtener usuario actual
    this.currentUser = this.authService.getCurrentUser();
    // Obtener productos desde backend
    this.loadingProducts = true;
    this.productService.fetchProducts({ solo_disponibles: true }).subscribe({
      next: (resp: any) => {
        this.loadingProducts = false;
        if (resp?.exito) {
          this.products = resp.datos?.productos || [];
        } else {
          this.products = [];
        }
      },
      error: () => {
        this.loadingProducts = false;
        this.products = [];
      }
    });

    // Badge básico: cuenta de notificaciones (sin "leídas" porque backend no tiene ese estado)
    this.notificationService.misNotificaciones().subscribe({
      next: (resp: any) => {
        if (resp?.exito) this.notificacionesCount = (resp.datos?.notificaciones || []).length;
      },
      error: () => {
        this.notificacionesCount = 0;
      }
    });
  }

  addToCart(product: Product): void {
    this.productService.addToCart(product, 1);
    this.showMessage(`${product.nombre} agregado al carrito`, 'success');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    if (type === 'error') {
      this.modalService.showError(message);
    } else if (type === 'success') {
      this.modalService.showSuccess(message);
    } else {
      this.modalService.showInfo(message);
    }
  }
}

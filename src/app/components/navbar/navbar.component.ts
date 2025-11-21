import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isMenuOpen = false;
  private userSubscription?: Subscription;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser$.subscribe(
      user => this.currentUser = user
    );
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
    this.closeMenu();
  }

  navigateToRegister(): void {
    this.router.navigate(['/register']);
    this.closeMenu();
  }

  navigateToProfile(): void {
    this.router.navigate(['/cliente/perfil']);
    this.closeMenu();
  }

  navigateToDashboard(): void {
    if (this.currentUser) {
      switch (this.currentUser.rol) {
        case 'administrador':
          this.router.navigate(['/admin/dashboard']);
          break;
        case 'secretaria':
          this.router.navigate(['/secretaria/dashboard']);
          break;
        case 'barbero':
          this.router.navigate(['/barbero/dashboard']);
          break;
        case 'cliente':
        default:
          this.router.navigate(['/cliente/dashboard']);
          break;
      }
    }
    this.closeMenu();
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get isCliente(): boolean {
    return this.authService.isCliente();
  }

  get isStaff(): boolean {
    return this.authService.canAccessAdmin();
  }

  get isAdmin(): boolean {
    return this.currentUser?.rol === 'administrador';
  }

  get userName(): string {
    if (this.currentUser) {
      return `${this.currentUser.nombre} ${this.currentUser.apellido}`;
    }
    return '';
  }
}

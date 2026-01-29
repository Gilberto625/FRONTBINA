import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="container text-center">
        <a routerLink="/" class="navbar-logo" style="margin-bottom: var(--spacing-md); display: inline-block;">
          Stylo <span>Barber</span>
        </a>
        <p class="text-small" style="color: rgba(255,255,255,0.5); margin-bottom: 0;">
          © 2024 Stylo Barber Connect. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--color-primary-dark);
      color: rgba(255,255,255,0.7);
      padding: var(--spacing-xl) 0;
      margin-top: auto;
    }
  `]
})
export class FooterComponent {}

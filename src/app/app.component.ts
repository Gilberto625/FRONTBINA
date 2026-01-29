import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoaderComponent } from './components/global-loader/global-loader.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalLoaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'frontendAngular';

  ngOnInit(): void {
    console.log('🎯 AppComponent inicializado');
    console.log('📍 Ubicación actual:', window.location.href);
    this.registerServiceWorker();
  }

  private registerServiceWorker(): void {
    if ('serviceWorker' in navigator && environment.production) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then((registration) => {
            console.log('✅ Service Worker registrado:', registration.scope);
          })
          .catch((error) => {
            console.warn('⚠️ Error al registrar Service Worker:', error);
          });
      });
    }
  }
}

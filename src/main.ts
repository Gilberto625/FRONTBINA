import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => {
    console.error('Error al inicializar la aplicación:', err);
    // Mostrar un mensaje de error en la página si es posible
    document.body.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif;">
        <h1>Error al cargar la aplicación</h1>
        <p>Por favor, recarga la página. Si el problema persiste, verifica la consola del navegador (F12).</p>
        <p>Error: ${err.message || 'Error desconocido'}</p>
      </div>
    `;
  });

import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { environment } from '../environments/environment';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    // Firebase - inicialización con manejo de errores
    provideFirebaseApp(() => {
      try {
        if (environment.firebase && environment.firebase.apiKey) {
          return initializeApp(environment.firebase);
        } else {
          console.warn('Firebase config no disponible');
          // Retornar una instancia dummy o manejar el caso
          return initializeApp({
            apiKey: 'dummy',
            authDomain: 'dummy',
            projectId: 'dummy',
            storageBucket: 'dummy',
            messagingSenderId: 'dummy',
            appId: 'dummy'
          });
        }
      } catch (error) {
        console.error('Error inicializando Firebase:', error);
        // Continuar sin Firebase si hay error
        return initializeApp({
          apiKey: 'dummy',
          authDomain: 'dummy',
          projectId: 'dummy',
          storageBucket: 'dummy',
          messagingSenderId: 'dummy',
          appId: 'dummy'
        });
      }
    }),
    provideAuth(() => {
      try {
        return getAuth();
      } catch (error) {
        console.error('Error obteniendo Auth de Firebase:', error);
        // Intentar obtener auth de todas formas
        return getAuth();
      }
    })
  ]
};

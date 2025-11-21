import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Notificacion {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'error' | 'cita' | 'producto' | 'pago';
  leida: boolean;
  fecha_creacion: string;
  url_accion?: string;
  datos_extra?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notificacionesSubject = new BehaviorSubject<Notificacion[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  private noLeidasSubject = new BehaviorSubject<number>(0);
  public noLeidas$ = this.noLeidasSubject.asObservable();

  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.isConnectedSubject.asObservable();

  constructor(private api: ApiService) {
    this.initializeNotifications();
  }

  private initializeNotifications(): void {
    this.cargarNotificaciones();
    this.setupPeriodicRefresh();
  }

  // Cargar notificaciones del servidor
  async cargarNotificaciones(): Promise<void> {
    try {
      const notificaciones = await this.api.get<Notificacion[]>('/notificaciones/').toPromise();
      this.notificacionesSubject.next(notificaciones || []);
      this.actualizarContadorNoLeidas();
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  }

  // Marcar notificación como leída
  async marcarComoLeida(notificacionId: number): Promise<void> {
    try {
      await this.api.patch(`/notificaciones/${notificacionId}/`, { leida: true }).toPromise();
      
      const notificaciones = this.notificacionesSubject.value;
      const index = notificaciones.findIndex(n => n.id === notificacionId);
      if (index !== -1) {
        notificaciones[index].leida = true;
        this.notificacionesSubject.next([...notificaciones]);
        this.actualizarContadorNoLeidas();
      }
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  }

  // Marcar todas como leídas
  async marcarTodasComoLeidas(): Promise<void> {
    try {
      await this.api.post('/notificaciones/marcar-todas-leidas/', {}).toPromise();
      
      const notificaciones = this.notificacionesSubject.value.map(n => ({
        ...n,
        leida: true
      }));
      this.notificacionesSubject.next(notificaciones);
      this.noLeidasSubject.next(0);
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }
  }

  // Eliminar notificación
  async eliminarNotificacion(notificacionId: number): Promise<void> {
    try {
      await this.api.delete(`/notificaciones/${notificacionId}/`).toPromise();
      
      const notificaciones = this.notificacionesSubject.value.filter(n => n.id !== notificacionId);
      this.notificacionesSubject.next(notificaciones);
      this.actualizarContadorNoLeidas();
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  }

  // Obtener configuración de notificaciones
  getConfiguracionNotificaciones(): Observable<any> {
    return this.api.get('/notificaciones/configuracion/');
  }

  // Actualizar configuración de notificaciones
  actualizarConfiguracionNotificaciones(config: any): Observable<any> {
    return this.api.put('/notificaciones/configuracion/', config);
  }

  // Suscribirse a notificaciones push
  async suscribirseAPush(): Promise<void> {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(this.getVapidPublicKey())
        });

        // Enviar suscripción al servidor
        await this.api.post('/notificaciones/suscripcion-push/', {
          subscription: subscription.toJSON()
        }).toPromise();

        console.log('Suscrito a notificaciones push');
      } catch (error) {
        console.error('Error suscribiéndose a push notifications:', error);
      }
    }
  }

  // Desuscribirse de notificaciones push
  async desuscribirseDeush(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
            
            // Notificar al servidor
            await this.api.delete('/notificaciones/suscripcion-push/').toPromise();
            
            console.log('Desuscrito de notificaciones push');
          }
        }
      } catch (error) {
        console.error('Error desuscribiéndose de push notifications:', error);
      }
    }
  }

  // Solicitar permisos de notificación
  async solicitarPermisos(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Mostrar notificación local
  mostrarNotificacionLocal(titulo: string, mensaje: string, icono?: string): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(titulo, {
        body: mensaje,
        icon: icono || '/assets/logos/TONYSTYLO-AMARILLO_PNG.png',
        badge: '/assets/logos/TONYSTYLO-AMARILLO_PNG.png'
      });
    }
  }

  // Agregar notificación localmente (para testing)
  agregarNotificacionLocal(notificacion: Omit<Notificacion, 'id'>): void {
    const nuevaNotificacion: Notificacion = {
      ...notificacion,
      id: Date.now(), // ID temporal
      fecha_creacion: new Date().toISOString()
    };

    const notificaciones = [nuevaNotificacion, ...this.notificacionesSubject.value];
    this.notificacionesSubject.next(notificaciones);
    this.actualizarContadorNoLeidas();

    // Mostrar notificación del navegador si está permitido
    this.mostrarNotificacionLocal(notificacion.titulo, notificacion.mensaje);
  }

  // Configurar actualización periódica
  private setupPeriodicRefresh(): void {
    // Actualizar cada 30 segundos
    setInterval(() => {
      this.cargarNotificaciones();
    }, 30000);
  }

  // Actualizar contador de no leídas
  private actualizarContadorNoLeidas(): void {
    const noLeidas = this.notificacionesSubject.value.filter(n => !n.leida).length;
    this.noLeidasSubject.next(noLeidas);
  }

  // Obtener notificaciones por tipo
  getNotificacionesPorTipo(tipo: string): Observable<Notificacion[]> {
    return this.api.get<Notificacion[]>(`/notificaciones/?tipo=${tipo}`);
  }

  // Obtener estadísticas de notificaciones
  getEstadisticasNotificaciones(): Observable<any> {
    return this.api.get('/notificaciones/estadisticas/');
  }

  // Utilidades para push notifications
  private getVapidPublicKey(): string {
    // Esta clave debe venir del backend o configuración
    return 'YOUR_VAPID_PUBLIC_KEY';
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Limpiar todas las notificaciones
  async limpiarNotificaciones(): Promise<void> {
    try {
      await this.api.delete('/notificaciones/limpiar/').toPromise();
      this.notificacionesSubject.next([]);
      this.noLeidasSubject.next(0);
    } catch (error) {
      console.error('Error limpiando notificaciones:', error);
    }
  }

  // Obtener notificaciones recientes
  getNotificacionesRecientes(limite: number = 5): Notificacion[] {
    return this.notificacionesSubject.value.slice(0, limite);
  }

  // Verificar si hay notificaciones no leídas
  tieneNotificacionesNoLeidas(): boolean {
    return this.noLeidasSubject.value > 0;
  }
}


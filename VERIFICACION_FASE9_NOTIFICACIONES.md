# Verificación Fase 9: Notificaciones - Frontend

## ✅ Backend (endpoints usados)
- `GET /api/notificaciones/mis-notificaciones/`
- `GET /api/notificaciones/historial/` (admin/secretaria)
- `POST /api/notificaciones/enviar/` (admin/secretaria)
- `POST /api/notificaciones/procesar-programadas/` (admin)

## ✅ Frontend (HTML/CSS puro)

### Servicio
- `NotificationService` (CSRF incluido para POST).

### Rutas
- `/notificaciones` (usuario autenticado)
- `/admin/notificaciones` (admin)

### Componentes
- **Centro de notificaciones**: lista + filtros por canal/estado (conectado).
- **Admin notificaciones**: historial + enviar manual + procesar programadas (conectado).
- **Badge en Home**: muestra conteo de notificaciones.

## ⚠️ Pendientes (según requerimiento)
- Integración con **Firebase Cloud Messaging (push)**: pendiente.
- Push real y “no leídas” real: pendiente (backend no expone leído/no leído).

## ✅ Verificación
- `npm run build` OK (sin errores).
- Lints OK.


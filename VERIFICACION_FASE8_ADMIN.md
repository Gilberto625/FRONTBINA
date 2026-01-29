# Verificación Fase 8: Panel Administrador - Frontend

## ✅ Backend (endpoints usados)
Todos viven bajo `GET/POST/PUT /api/admin/*` (en `configuracion/urls.py`):
- `GET /api/admin/metricas/`
- `GET /api/admin/reportes/`
- `POST /api/admin/dias/clasificar/`
- `GET /api/admin/empleados/`
- `POST /api/admin/empleados/crear/`
- `PUT /api/admin/empleados/{id}/`
- `GET /api/admin/configuracion/`
- `PUT /api/admin/configuracion/actualizar/`

## ✅ Frontend (HTML/CSS puro)

### Rutas (todas protegidas con `adminGuard`)
- `/admin/dashboard`
- `/admin/empleados`
- `/admin/configuracion`
- `/admin/reportes`
- `/admin/dias`

### Componentes
- **AdminDashboardComponent**: métricas (rango fechas) + navegación.
- **AdminEmpleadosComponent**: listar/filtrar por rol, crear empleado, activar/desactivar.
- **AdminConfigComponent**: ver/editar configuración por día (edición básica).
- **AdminReportesComponent**: generar reporte (muestra JSON).
- **AdminDiasComponent**: clasificar día por demanda.

### Servicios/Guards
- `AdminService`: consume `/api/admin/*` y maneja CSRF para PUT/POST.
- `adminGuard`: solo rol `administrador`.

## ✅ Verificación
- `npm run build` sin errores.
- Linter sin errores en archivos tocados.


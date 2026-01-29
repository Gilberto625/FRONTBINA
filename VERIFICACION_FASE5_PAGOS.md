# Verificación Fase 5 - Pagos (Frontend)

## ✅ Objetivo
Permitir al cliente iniciar el pago de una **compra por carrito** y dejar visible la sección de **Mercado Pago** como “congelada” (pendiente de SDK), mostrando errores reales del backend.

---

## ✅ Backend usado (endpoints)
- `POST /api/pagos/crear/`
- `GET /api/pagos/historial/`
- `GET /api/pagos/{id}/`

> Nota: el webhook de Mercado Pago es **backend** (`/api/pagos/webhook/mercado-pago/`).

---

## ✅ Frontend (pantallas)
- Ruta: `/pagar-compra/:id`
  - Transferencia: crea pago con `metodo_pago='transferencia'` e `id_operacion`
  - Mercado Pago: **pendiente** (congelado). Intenta llamar backend y:
    - muestra error real (400/500) si falta configuración
    - o muestra 501 si no hay `init_point` recibido

---

## ✅ Integración desde “Mis Compras”
- Botón **Pagar** disponible cuando la compra está en `apartado` y no está pagada.


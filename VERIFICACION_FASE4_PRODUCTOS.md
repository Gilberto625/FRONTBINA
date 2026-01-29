# Verificación Fase 4 - Módulo de Productos (Frontend) - COMPRA POR CARRITO

## ✅ Objetivo
Confirmar que el **catálogo**, **detalle**, **carrito** y **checkout** funcionan y que el checkout crea **una sola compra por carrito** (una orden con múltiples productos) en el backend.

---

## ✅ Contrato Backend (actualizado)

### `POST /api/productos/crear-compra/`
Ahora acepta:

- `productos`: lista de items `{ producto_id, cantidad }`
- `metodo_entrega`: `local | moto_mandado | paqueteria`
- `direccion_entrega` (si aplica)
- `notas` (opcional)

Respuesta incluye:
- `subtotal`, `costo_envio`, `total`
- `productos`: lista con `producto`, `cantidad`, `precio_unitario`, `subtotal`

---

## ✅ Rutas en Frontend
- `/productos`
- `/productos/:id`
- `/carrito`
- `/checkout`
- `/mis-compras`

---

## ✅ Servicios

### Productos

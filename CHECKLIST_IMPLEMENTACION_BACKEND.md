# ✅ Checklist de Implementación - OTP con SendGrid

## 📋 Resumen Rápido

Sigue estos pasos en orden para implementar OTP con SendGrid en tu backend.

---

## 1️⃣ INSTALACIÓN

```bash
pip install sendgrid python-dotenv
```

---

## 2️⃣ CONFIGURACIÓN

### Archivo `.env` (raíz del proyecto)
```env
SENDGRID_API_KEY=TU_SENDGRID_API_KEY_AQUI
SENDGRID_FROM_EMAIL=tu_email@ejemplo.com
SENDGRID_FROM_NAME=modulo usuario
```

### Archivo `settings.py`
```python
import os
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
SENDGRID_FROM_EMAIL = os.getenv('SENDGRID_FROM_EMAIL')
SENDGRID_FROM_NAME = os.getenv('SENDGRID_FROM_NAME')
```

---

## 3️⃣ MODELO DE USUARIO

Agregar estos campos a tu modelo `Usuario`:

```python
codigo_otp = models.CharField(max_length=6, null=True, blank=True)
otp_expira = models.DateTimeField(null=True, blank=True)
confirmado = models.BooleanField(default=False)
```

**Ejecutar migración:**
```bash
python manage.py makemigrations
python manage.py migrate
```

---

## 4️⃣ CREAR SERVICIO

Crear archivo: `utils/sendgrid_otp_service.py`

**Copiar código completo de:** `backend_reference/sendgrid_otp_service.py`

---

## 5️⃣ CREAR VISTAS

Crear/actualizar vistas en `views.py`:

- ✅ `verificar_otp_registro()` - Verificar OTP de registro
- ✅ `reenviar_otp()` - Reenviar OTP de registro
- ✅ `solicitar_recuperacion_otp()` - Solicitar recuperación
- ✅ `verificar_otp_recuperacion()` - Verificar OTP de recuperación
- ✅ `reenviar_otp_recuperacion()` - Reenviar OTP de recuperación
- ✅ `actualizar_contrasena_otp()` - Actualizar contraseña

**Código completo en:** `INSTRUCCIONES_BACKEND_OTP.md` (PASO 5)

---

## 6️⃣ ACTUALIZAR REGISTRO

Modificar tu vista `register()` para:
- Generar código OTP
- Guardar código y expiración
- Enviar email con SendGrid
- Retornar `tempToken`

**Código en:** `INSTRUCCIONES_BACKEND_OTP.md` (PASO 6)

---

## 7️⃣ AGREGAR URLs

En `urls.py`, agregar:

```python
path('api/usuarios/verificar-otp/', views.verificar_otp_registro),
path('api/usuarios/reenviar-otp/', views.reenviar_otp),
path('api/usuarios/recuperar-otp/', views.solicitar_recuperacion_otp),
path('api/usuarios/verificar-otp-recuperacion/', views.verificar_otp_recuperacion),
path('api/usuarios/reenviar-otp-recuperacion/', views.reenviar_otp_recuperacion),
path('api/usuarios/actualizar-contrasena-otp/', views.actualizar_contrasena_otp),
```

---

## 8️⃣ PROBAR

### Prueba 1: Registro
1. POST `/api/usuarios/register/` → Debe enviar email con OTP
2. POST `/api/usuarios/verificar-otp/` → Debe activar cuenta

### Prueba 2: Recuperación
1. POST `/api/usuarios/recuperar-otp/` → Debe enviar email con OTP
2. POST `/api/usuarios/verificar-otp-recuperacion/` → Debe validar código
3. POST `/api/usuarios/actualizar-contrasena-otp/` → Debe cambiar contraseña

---

## 📁 ARCHIVOS A CREAR/MODIFICAR

```
tu_backend/
├── .env                          # ✅ Crear (variables de entorno)
├── settings.py                   # ✅ Modificar (agregar config SendGrid)
├── models.py                     # ✅ Modificar (agregar campos OTP)
├── views.py                      # ✅ Modificar (agregar vistas OTP)
├── urls.py                       # ✅ Modificar (agregar rutas)
└── utils/
    └── sendgrid_otp_service.py   # ✅ Crear (servicio SendGrid)
```

---

## 🔗 ENDPOINTS REQUERIDOS

| Endpoint | Método | Función |
|----------|--------|---------|
| `/api/usuarios/verificar-otp/` | POST | Verificar OTP registro |
| `/api/usuarios/reenviar-otp/` | POST | Reenviar OTP registro |
| `/api/usuarios/recuperar-otp/` | POST | Solicitar recuperación |
| `/api/usuarios/verificar-otp-recuperacion/` | POST | Verificar OTP recuperación |
| `/api/usuarios/reenviar-otp-recuperacion/` | POST | Reenviar OTP recuperación |
| `/api/usuarios/actualizar-contrasena-otp/` | POST | Actualizar contraseña |

---

## 📚 DOCUMENTACIÓN COMPLETA

Para instrucciones detalladas con código completo, ver:
- **`INSTRUCCIONES_BACKEND_OTP.md`** - Guía paso a paso completa
- **`backend_reference/sendgrid_otp_service.py`** - Servicio SendGrid
- **`backend_reference/views_otp_example.py`** - Ejemplos de vistas

---

## ⚠️ IMPORTANTE

1. **No hardcodees las credenciales** - Usa variables de entorno
2. **Hashea las contraseñas** - Usa `make_password()` de Django
3. **Valida expiración** - Los códigos expiran en 10 minutos
4. **Limpia códigos usados** - Elimina OTP después de usar

---

## ✅ CHECKLIST FINAL

- [ ] Dependencias instaladas
- [ ] Variables de entorno configuradas
- [ ] Modelo actualizado con campos OTP
- [ ] Migración ejecutada
- [ ] Servicio SendGrid creado
- [ ] Vistas OTP implementadas
- [ ] Vista de registro actualizada
- [ ] URLs agregadas
- [ ] Pruebas realizadas
- [ ] Frontend conectado correctamente

---

## 🆘 AYUDA

Si tienes problemas:
1. Revisa `INSTRUCCIONES_BACKEND_OTP.md` (PASO 9: Solución de Problemas)
2. Verifica que las credenciales de SendGrid sean correctas
3. Revisa los logs del servidor para errores
4. Asegúrate de que el email remitente esté verificado en SendGrid


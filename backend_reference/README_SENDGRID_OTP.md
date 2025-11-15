# 📧 Implementación de OTP con SendGrid para Django

Esta guía te ayudará a implementar verificación OTP (One-Time Password) con SendGrid en tu backend Django, basado en la implementación de Nova_Graf-main.

## 🔑 Credenciales de SendGrid

```
SENDGRID_API_KEY=TU_SENDGRID_API_KEY_AQUI
SENDGRID_FROM_EMAIL=tu_email@ejemplo.com
SENDGRID_FROM_NAME=modulo usuario
```

## 📦 Instalación

### 1. Instalar dependencias

```bash
pip install sendgrid django
```

### 2. Configurar variables de entorno

Agrega estas variables a tu archivo `.env` o `settings.py`:

```python
# settings.py
import os
from dotenv import load_dotenv

load_dotenv()

SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', 'TU_SENDGRID_API_KEY_AQUI')
SENDGRID_FROM_EMAIL = os.getenv('SENDGRID_FROM_EMAIL', 'tu_email@ejemplo.com')
SENDGRID_FROM_NAME = os.getenv('SENDGRID_FROM_NAME', 'modulo usuario')
```

## 🗄️ Modelo de Usuario

Asegúrate de que tu modelo `Usuario` tenga estos campos:

```python
# models.py
from django.db import models
from django.utils import timezone
from datetime import timedelta

class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    apellidopaterno = models.CharField(max_length=100)
    apellidomaterno = models.CharField(max_length=100, blank=True)
    username = models.CharField(max_length=50, unique=True)
    correo = models.EmailField(unique=True)
    contrasena = models.CharField(max_length=255)  # Deberías usar hashing
    telefono = models.CharField(max_length=20, blank=True)
    preguntasecreta = models.CharField(max_length=255)
    respuestasecreta = models.CharField(max_length=255)
    
    # Campos para OTP
    codigo_otp = models.CharField(max_length=6, null=True, blank=True)
    otp_expira = models.DateTimeField(null=True, blank=True)
    confirmado = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.correo
```

## 🔧 Servicio de SendGrid

Crea el archivo `sendgrid_otp_service.py` (ya incluido en `backend_reference/`):

```python
# utils/sendgrid_otp_service.py
import os
import random
from datetime import timedelta
from django.utils import timezone
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.conf import settings

def generar_codigo_otp() -> str:
    """Genera un código OTP de 6 dígitos"""
    return str(random.randint(100000, 999999))

def enviar_otp_email(correo: str, codigo_otp: str) -> bool:
    """Envía un código OTP por email usando SendGrid"""
    try:
        message = Mail(
            from_email=(settings.SENDGRID_FROM_EMAIL, settings.SENDGRID_FROM_NAME),
            to_emails=correo,
            subject='Código de verificación - Módulo Usuario',
            html_content=f'''
                <h2>Bienvenido</h2>
                <p>Tu código de verificación es:</p>
                <h3 style="font-size: 24px; color: #1976d2; letter-spacing: 4px;">{codigo_otp}</h3>
                <p>Este código expira en 10 minutos.</p>
                <p>Si no solicitaste este código, ignora este mensaje.</p>
            '''
        )
        
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        
        return response.status_code == 202
    except Exception as e:
        print(f"Error enviando correo OTP: {str(e)}")
        return False
```

## 🛣️ URLs y Vistas

### 1. Agregar URLs

```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ... otras rutas
    path('api/usuarios/verificar-otp/', views.verificar_otp_registro, name='verificar_otp'),
    path('api/usuarios/reenviar-otp/', views.reenviar_otp, name='reenviar_otp'),
    path('api/usuarios/recuperar-otp/', views.solicitar_recuperacion_otp, name='recuperar_otp'),
    path('api/usuarios/verificar-otp-recuperacion/', views.verificar_otp_recuperacion, name='verificar_otp_recuperacion'),
    path('api/usuarios/reenviar-otp-recuperacion/', views.reenviar_otp_recuperacion, name='reenviar_otp_recuperacion'),
    path('api/usuarios/actualizar-contrasena-otp/', views.actualizar_contrasena_otp, name='actualizar_contrasena_otp'),
]
```

### 2. Implementar Vistas

Ver el archivo `views_otp_example.py` en `backend_reference/` para ejemplos completos de implementación.

## 📝 Endpoints Requeridos

### 1. Registro con OTP

**Endpoint:** `POST /api/usuarios/register/`

**Body:**
```json
{
  "nombre": "Juan",
  "apellidopaterno": "Pérez",
  "apellidomaterno": "García",
  "username": "juanperez",
  "correo": "juan@example.com",
  "contrasena": "password123",
  "telefono": "1234567890",
  "preguntasecreta": "¿Cuál es tu color favorito?",
  "respuestasecreta": "azul"
}
```

**Response (201):**
```json
{
  "message": "Usuario registrado. Ingresa el código OTP enviado a tu correo.",
  "tempToken": "token_temporal",
  "destino": "email"
}
```

### 2. Verificar OTP de Registro

**Endpoint:** `POST /api/usuarios/verificar-otp/`

**Body:**
```json
{
  "tempToken": "token_temporal",
  "codigo": "123456"
}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Cuenta activada correctamente"
}
```

### 3. Reenviar OTP

**Endpoint:** `POST /api/usuarios/reenviar-otp/`

**Body:**
```json
{
  "correo": "juan@example.com"
}
```

**Response (200):**
```json
{
  "message": "Nuevo código enviado a tu correo. Expira en 10 minutos."
}
```

### 4. Recuperación de Contraseña con OTP

**Endpoint:** `POST /api/usuarios/recuperar-otp/`

**Body:**
```json
{
  "email": "juan@example.com"
}
```

**Response (200):**
```json
{
  "message": "Código de recuperación enviado a tu correo. Expira en 10 minutos.",
  "tempToken": "token_temporal"
}
```

### 5. Verificar OTP de Recuperación

**Endpoint:** `POST /api/usuarios/verificar-otp-recuperacion/`

**Body:**
```json
{
  "tempToken": "token_temporal",
  "codigo": "123456"
}
```

**Response (200):**
```json
{
  "ok": true,
  "message": "Código verificado. Ahora puedes cambiar tu contraseña."
}
```

### 6. Actualizar Contraseña después de OTP

**Endpoint:** `POST /api/usuarios/actualizar-contrasena-otp/`

**Body:**
```json
{
  "tempToken": "token_temporal",
  "nuevaContrasena": "nueva_password123"
}
```

**Response (200):**
```json
{
  "message": "Contraseña actualizada correctamente"
}
```

## 🔒 Seguridad

1. **Hashear contraseñas:** Usa `django.contrib.auth.hashers.make_password()` para hashear contraseñas
2. **Validar expiración:** Los códigos OTP expiran en 10 minutos
3. **Limpiar códigos:** Elimina códigos OTP después de usarlos o cuando expiren
4. **Rate limiting:** Implementa límites de intentos para prevenir ataques de fuerza bruta

## 🧪 Pruebas

Para probar la implementación:

1. Registra un usuario → Deberías recibir un email con código OTP
2. Verifica el código → La cuenta debería activarse
3. Intenta iniciar sesión → Debería funcionar correctamente
4. Solicita recuperación → Deberías recibir un código OTP
5. Verifica y cambia contraseña → Debería actualizarse correctamente

## 📚 Referencias

- [SendGrid Python SDK](https://github.com/sendgrid/sendgrid-python)
- [Django Documentation](https://docs.djangoproject.com/)
- Implementación base: `Nova_Graf-main/backend/`

## ⚠️ Notas Importantes

1. **Variables de entorno:** Nunca hardcodees las credenciales de SendGrid en el código
2. **Manejo de errores:** Implementa manejo robusto de errores para fallos de SendGrid
3. **Logging:** Registra los intentos de envío de emails para debugging
4. **Testing:** Prueba con emails reales antes de desplegar a producción


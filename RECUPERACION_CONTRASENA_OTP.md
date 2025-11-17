# Sistema de Recuperación de Contraseña por OTP

## Descripción

El sistema de recuperación de contraseña utiliza **únicamente el método de código OTP (One-Time Password) por correo electrónico** para mayor seguridad y simplicidad.

## Flujo de Recuperación

### 1. Solicitar Código OTP
```
Usuario → Ingresa email → Backend envía código de 6 dígitos por email
```

**Endpoint:** `POST /recuperar-otp/`
- **Request:** `{ "email": "usuario@example.com" }`
- **Response:** `{ "ok": true, "tempToken": "user_id", "message": "Código enviado..." }`

### 2. Verificar Código OTP
```
Usuario → Ingresa código de 6 dígitos → Backend valida el código
```

**Endpoint:** `POST /verificar-otp-recuperacion/`
- **Request:** `{ "tempToken": "user_id", "codigo": "123456" }`
- **Response:** `{ "ok": true, "message": "Código verificado..." }`

### 3. Actualizar Contraseña
```
Usuario → Ingresa nueva contraseña → Backend actualiza la contraseña
```

**Endpoint:** `POST /actualizar-contrasena-otp/`
- **Request:** `{ "tempToken": "user_id", "nuevaContrasena": "NuevaPass123" }`
- **Response:** `{ "ok": true, "message": "Contraseña actualizada correctamente" }`

## Características

### Seguridad
- ✅ Código OTP de 6 dígitos aleatorios
- ✅ Expiración de 10 minutos
- ✅ Token temporal es el ID del usuario
- ✅ Validación en base de datos (no sesiones)
- ✅ Compatible con CORS/CSRF en entornos cross-origin

### Funcionalidades
- ✅ Envío de código por email con SendGrid
- ✅ Opción de reenviar código
- ✅ Mensajes de feedback claros al usuario
- ✅ Validación de formato de código (6 dígitos)
- ✅ Validación de contraseña fuerte (8+ caracteres, mayúscula, minúscula, número)

## Componentes Frontend

### `forgot-password.component.ts`

**Estados:**
- `step: 'email' | 'verify-otp'` - Solo dos pasos
- `userEmail` - Email del usuario
- `tempToken` - Token temporal para validación

**Métodos principales:**
1. `onSubmitEmail()` - Solicita código OTP
2. `onSubmitOTP()` - Verifica el código OTP
3. `onResendOTP()` - Reenvía el código

### `reset-password.component.ts`

**Funcionalidad:**
- Recibe `tempToken` del localStorage
- Valida requisitos de contraseña en tiempo real
- Llama a `actualizarContrasenaOTP()` del AuthService
- Muestra feedback de éxito/error

## Modelo de Datos Backend

### Usuario (campos relevantes)
```python
codigo_otp = models.CharField(max_length=6, null=True, blank=True)
otp_expira = models.DateTimeField(null=True, blank=True)
```

El mismo campo `codigo_otp` se usa para:
- Verificación de registro
- Verificación de login 2FA
- **Recuperación de contraseña**

## Endpoints Backend

### Recuperación de Contraseña

```python
# 1. Solicitar código OTP
POST /recuperar-otp/
Body: { "email": "usuario@example.com" }
Response: { "ok": true, "tempToken": "123", "message": "Código enviado..." }

# 2. Verificar código OTP
POST /verificar-otp-recuperacion/
Body: { "tempToken": "123", "codigo": "654321" }
Response: { "ok": true, "message": "Código verificado..." }

# 3. Reenviar código OTP (opcional)
POST /reenviar-otp-recuperacion/
Body: { "correo": "usuario@example.com" }
Response: { "ok": true, "message": "Nuevo código enviado..." }

# 4. Actualizar contraseña
POST /actualizar-contrasena-otp/
Body: { "tempToken": "123", "nuevaContrasena": "NuevaPass123" }
Response: { "ok": true, "message": "Contraseña actualizada correctamente" }
```

## Validaciones

### Backend
- Email debe existir en la base de datos
- Código debe ser de 6 dígitos
- Código no debe haber expirado (10 minutos)
- Nueva contraseña debe tener al menos 8 caracteres

### Frontend
- Email con formato válido
- Código debe ser exactamente 6 dígitos numéricos
- Nueva contraseña:
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número
- Confirmación de contraseña debe coincidir

## Mensajes al Usuario

### Éxito
- ✅ "Código enviado a tu correo. Revisa tu bandeja de entrada."
- ✅ "Código verificado correctamente"
- ✅ "¡Contraseña actualizada exitosamente!"

### Error
- ❌ "No se encontró una cuenta con ese correo"
- ❌ "Código incorrecto o expirado"
- ❌ "Error al enviar código OTP"
- ❌ "Token inválido o expirado"
- ❌ "Las contraseñas no coinciden"

## Configuración SendGrid

### Variables de Entorno (Backend)
```bash
SENDGRID_API_KEY=tu_api_key_aqui
SENDGRID_FROM_EMAIL=tu_email_verificado@example.com
SENDGRID_FROM_NAME=Tu Aplicación
```

### Archivo: `sendgrid_otp_service.py`
```python
def enviar_otp_recuperacion(email_destino, codigo_otp):
    """Envía código OTP para recuperación de contraseña"""
    # Implementación con SendGrid API
```

## Flujo Visual para el Usuario

```
┌─────────────────────────────────────────┐
│  1. Página "Olvidé mi Contraseña"      │
│     - Ingresar email                    │
│     - Click en "Enviar Código"          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  2. Verificar Código OTP                │
│     - Código enviado al email           │
│     - Ingresar código de 6 dígitos      │
│     - Opción: "Reenviar código"         │
│     - Click en "Verificar Código"       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  3. Restablecer Contraseña              │
│     - Ingresar nueva contraseña         │
│     - Confirmar contraseña              │
│     - Ver requisitos en tiempo real     │
│     - Click en "Restablecer Contraseña" │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  4. Éxito                               │
│     - "¡Contraseña actualizada!"        │
│     - Redirección a Login               │
└─────────────────────────────────────────┘
```

## Mejoras Implementadas

### Experiencia de Usuario
- ✅ Flujo simplificado de 3 pasos
- ✅ Feedback visual inmediato
- ✅ Mensajes claros de éxito/error
- ✅ Indicadores de carga
- ✅ Opción de reenviar código
- ✅ Validación en tiempo real

### Técnicas
- ✅ Sin dependencia de sesiones Django
- ✅ Compatible con CORS cross-origin
- ✅ Token temporal basado en ID de usuario
- ✅ Almacenamiento en modelo de base de datos
- ✅ Expiración automática de códigos
- ✅ Limpieza automática de códigos usados

## Testing

### Caso de Uso Normal
1. ✅ Ir a `/forgot-password`
2. ✅ Ingresar email registrado
3. ✅ Recibir código por email
4. ✅ Ingresar código correcto
5. ✅ Ver mensaje "Código verificado correctamente"
6. ✅ Ingresar nueva contraseña válida
7. ✅ Ver mensaje "¡Contraseña actualizada exitosamente!"
8. ✅ Login con nueva contraseña

### Casos de Error
- ❌ Email no registrado → Mensaje genérico por seguridad
- ❌ Código incorrecto → "Código incorrecto o expirado"
- ❌ Código expirado (>10 min) → "Código expirado. Solicita uno nuevo"
- ❌ Contraseña débil → Muestra requisitos no cumplidos
- ❌ Contraseñas no coinciden → "Las contraseñas no coinciden"

## Archivos Modificados

### Backend
- `backendbina/accounts/views.py`
  - `solicitar_recuperacion_otp()` (líneas 764-820)
  - `verificar_otp_recuperacion()` (líneas 823-884)
  - `reenviar_otp_recuperacion()` (líneas 887-941)
  - `actualizar_contrasena_otp()` (líneas 944-1006)

### Frontend
- `FRONTBINA/src/app/components/forgot-password/`
  - `forgot-password.component.ts` - Simplificado a 2 pasos
  - `forgot-password.component.html` - Eliminada opción de preguntas secretas
  
- `FRONTBINA/src/app/components/reset-password/`
  - `reset-password.component.ts` - Usa `actualizarContrasenaOTP()`
  
- `FRONTBINA/src/app/services/auth.service.ts`
  - `solicitarRecuperacionOTP()`
  - `verificarOTPRecuperacion()`
  - `reenviarOTPRecuperacion()`
  - `actualizarContrasenaOTP()`

## Conclusión

El sistema de recuperación por OTP proporciona:
- **Seguridad**: Códigos temporales de un solo uso
- **Simplicidad**: Flujo directo de 3 pasos
- **Confiabilidad**: Sin dependencia de sesiones
- **Experiencia**: Feedback claro y mensajes útiles

Este método es más seguro y fácil de usar que las preguntas secretas, y es compatible con las mejores prácticas de autenticación moderna.


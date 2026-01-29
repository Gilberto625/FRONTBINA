# Guía de Solución de Problemas

## Error 404 en Registro

Si estás recibiendo un error 404 al intentar registrar un usuario, verifica lo siguiente:

### 1. Verificar que el backend esté desplegado y funcionando

1. **Verifica que el backend esté en línea:**
   - Abre en tu navegador: `https://backendbina-1.onrender.com/api/usuarios/csrf/`
   - Deberías ver una respuesta JSON con `{"csrfToken": "..."}`
   - Si ves un error o no responde, el backend no está disponible

2. **Verifica el endpoint de registro:**
   - Abre en tu navegador: `https://backendbina-1.onrender.com/api/usuarios/register/`
   - Deberías ver un error 405 (Method Not Allowed) o un mensaje JSON, NO un 404
   - Si ves 404, el endpoint no existe en el backend

### 2. Verificar la configuración del frontend

1. **Verifica el archivo de environment:**
   - En producción, debe usar `environment.prod.ts`
   - La URL debe ser: `https://backendbina-1.onrender.com/api/usuarios`
   - Verifica que el build de Vercel esté usando la configuración de producción

2. **Verifica la consola del navegador:**
   - Abre las herramientas de desarrollador (F12)
   - Ve a la pestaña "Console"
   - Busca mensajes que empiecen con 🔵 (azul) que indican las URLs que se están llamando
   - Busca errores de red en la pestaña "Network"

### 3. Verificar CORS en el backend

El backend debe tener configurado CORS para permitir peticiones desde `frontbina.vercel.app`:

```python
# En backendbina/core/settings.py
CORS_ALLOWED_ORIGINS = [
    "https://frontbina.vercel.app",
    "https://frontbina-git-*.vercel.app",  # Para preview deployments
]
```

### 4. Verificar que el endpoint exista en el backend

El endpoint debe estar definido en `backendbina/accounts/urls.py`:

```python
path('register/', views.register_user, name='register'),
```

Y la vista debe estar en `backendbina/accounts/views.py` como `register_user`.

### 5. Verificar logs del backend

Si tienes acceso a los logs de Render:
- Revisa si hay errores al iniciar el servidor
- Verifica que las migraciones se hayan ejecutado correctamente
- Verifica que no haya errores de importación

## Error "Error al enviar mensaje" en Registro

Este error generalmente ocurre cuando:

1. **El servicio de correo no está configurado correctamente:**
   - Verifica que `SENDGRID_API_KEY` esté configurado en Render
   - Verifica que `SENDGRID_FROM_EMAIL` esté configurado
   - Verifica que el API key de SendGrid sea válido

2. **El correo no se puede enviar:**
   - El backend intenta enviar el correo pero falla
   - Revisa los logs del backend para ver el error específico
   - Verifica que SendGrid esté activo y funcional

3. **Solución temporal:**
   - Si el problema es solo el envío de correo, el usuario se crea pero no recibe el código
   - Puedes verificar en la base de datos si el usuario se creó
   - El código OTP se guarda en la sesión del servidor

## Error Firebase "auth/internal-error"

Ver el archivo `FIREBASE_SETUP.md` para instrucciones detalladas.

**Resumen rápido:**
1. Ve a Firebase Console → Authentication → Settings
2. Agrega `frontbina.vercel.app` en "Authorized domains"
3. Espera unos minutos y prueba de nuevo

## Verificar que todo esté funcionando

### Test rápido del backend:

```bash
# Test CSRF
curl https://backendbina-1.onrender.com/api/usuarios/csrf/

# Test Register (debería dar 400 por falta de datos, NO 404)
curl -X POST https://backendbina-1.onrender.com/api/usuarios/register/ \
  -H "Content-Type: application/json" \
  -d '{}'
```

Si el segundo comando da 404, el endpoint no existe en el backend desplegado.

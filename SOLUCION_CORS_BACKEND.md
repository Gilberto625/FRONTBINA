# 🔧 Solución: Error de CORS en el Backend Django

## ❌ Problema

El error que estás viendo:
```
Access to XMLHttpRequest at 'https://backendbina-1.onrender.com/api/usuarios/csrf/' 
from origin 'https://frontbina-wzyj79pky-20201171-8478s-projects.vercel.app' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present
```

**Causa:** El backend Django no está configurado para permitir peticiones desde tu frontend en Vercel.

---

## ✅ Solución: Configurar CORS en Django

### PASO 1: Instalar django-cors-headers

En tu proyecto backend Django, ejecuta:

```bash
pip install django-cors-headers
```

O si usas `requirements.txt`:

```txt
django-cors-headers>=4.0.0
```

---

### PASO 2: Configurar en settings.py

Abre tu archivo `settings.py` y agrega/modifica lo siguiente:

#### 2.1 Agregar a INSTALLED_APPS

```python
INSTALLED_APPS = [
    # ... tus apps existentes ...
    'corsheaders',  # ✅ Agregar esto
    # ... resto de apps ...
]
```

#### 2.2 Agregar al MIDDLEWARE (IMPORTANTE: Debe estar al principio)

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ✅ Debe estar PRIMERO
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    # ... resto de middlewares ...
]
```

#### 2.3 Configurar CORS_ALLOWED_ORIGINS

Agrega al final de `settings.py`:

```python
# Configuración CORS
CORS_ALLOWED_ORIGINS = [
    "https://frontbina-wzyj79pky-20201171-8478s-projects.vercel.app",
    "https://frontbina.vercel.app",  # Si tienes dominio personalizado
    "http://localhost:4200",  # Para desarrollo local
    "http://127.0.0.1:4200",  # Para desarrollo local
]

# O si prefieres permitir todos los orígenes de Vercel (menos seguro)
# CORS_ALLOW_ALL_ORIGINS = True  # ⚠️ Solo para desarrollo, NO en producción

# Permitir credenciales (cookies, headers de autenticación)
CORS_ALLOW_CREDENTIALS = True

# Headers permitidos
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Métodos permitidos
CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

---

### PASO 3: Configuración para Vercel (Múltiples URLs)

Si tu frontend en Vercel puede tener diferentes URLs (preview deployments), puedes usar:

```python
import os

# Obtener URL del frontend desde variables de entorno
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://frontbina.vercel.app')

CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:4200",
    "http://127.0.0.1:4200",
]

# O permitir todos los subdominios de Vercel
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",  # Permite cualquier subdominio de Vercel
]
```

---

### PASO 4: Configurar en Render (Variables de Entorno)

Si tu backend está en Render, agrega estas variables de entorno en el dashboard de Render:

1. Ve a tu servicio en Render
2. Settings → Environment Variables
3. Agrega:

```
FRONTEND_URL=https://frontbina.vercel.app
```

O directamente en `settings.py`:

```python
import os

# Para producción en Render
if os.getenv('RENDER'):
    CORS_ALLOWED_ORIGINS = [
        "https://frontbina.vercel.app",
        "https://frontbina-wzyj79pky-20201171-8478s-projects.vercel.app",
    ]
    # O permitir todos los deployments de Vercel
    CORS_ALLOWED_ORIGIN_REGEXES = [
        r"^https://.*\.vercel\.app$",
    ]
else:
    # Para desarrollo local
    CORS_ALLOWED_ORIGINS = [
        "http://localhost:4200",
        "http://127.0.0.1:4200",
    ]
```

---

### PASO 5: Verificar configuración completa

Tu `settings.py` debería verse así (ejemplo):

```python
# ... imports ...

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',  # ✅ Agregado
    # ... tus apps ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ✅ PRIMERO
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ... resto de configuración ...

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "https://frontbina.vercel.app",
    "https://frontbina-wzyj79pky-20201171-8478s-projects.vercel.app",
    "http://localhost:4200",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

---

### PASO 6: Reiniciar el servidor

Después de hacer los cambios:

1. **Si estás en desarrollo local:**
   ```bash
   python manage.py runserver
   ```

2. **Si estás en Render:**
   - Los cambios se aplicarán automáticamente al hacer commit y push
   - O puedes hacer "Manual Deploy" desde el dashboard

---

## 🧪 Verificar que funciona

1. Abre tu frontend en Vercel
2. Abre la consola del navegador (F12)
3. Intenta hacer un registro
4. El error de CORS debería desaparecer

---

## 🔍 Debugging

Si aún tienes problemas:

### Verificar que CORS está activo

Agrega esto temporalmente a `settings.py` para debug:

```python
# Solo para debugging - NO en producción
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
```

Si funciona con esto, entonces el problema es la configuración de `CORS_ALLOWED_ORIGINS`.

### Verificar headers en la respuesta

En la consola del navegador, ve a Network → Headers y verifica que la respuesta tenga:

```
Access-Control-Allow-Origin: https://frontbina-wzyj79pky-20201171-8478s-projects.vercel.app
Access-Control-Allow-Credentials: true
```

---

## ⚠️ Importante

1. **NUNCA uses `CORS_ALLOW_ALL_ORIGINS = True` en producción** - Es un riesgo de seguridad
2. **Siempre lista explícitamente los orígenes permitidos**
3. **Verifica que el middleware de CORS esté PRIMERO en la lista**

---

## 📝 Checklist

- [ ] `django-cors-headers` instalado
- [ ] `corsheaders` agregado a `INSTALLED_APPS`
- [ ] `CorsMiddleware` agregado PRIMERO en `MIDDLEWARE`
- [ ] `CORS_ALLOWED_ORIGINS` configurado con la URL de Vercel
- [ ] `CORS_ALLOW_CREDENTIALS = True` configurado
- [ ] Servidor reiniciado
- [ ] Error de CORS desapareció

---

## 🆘 Si aún no funciona

1. Verifica que el backend esté corriendo
2. Verifica que la URL del frontend en `CORS_ALLOWED_ORIGINS` sea exactamente la misma que aparece en el error
3. Revisa los logs del backend para ver si hay errores
4. Prueba con `CORS_ALLOW_ALL_ORIGINS = True` temporalmente para confirmar que es un problema de CORS

---

## 📚 Referencias

- [django-cors-headers Documentation](https://github.com/adamchainz/django-cors-headers)
- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)


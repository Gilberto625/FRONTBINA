# 🔧 Solución: Error 500 en Registro de Usuario

## ❌ Problema

El error que estás viendo:
```
POST https://backendbina-1.onrender.com/api/usuarios/register/ 500 (Internal Server Error)
```

**Causa:** El backend Django está lanzando una excepción al procesar el registro.

---

## 🔍 PASO 1: Verificar Logs del Backend

El error 500 significa que hay un problema en el servidor. Necesitas ver los logs del backend para identificar el error exacto.

### En Render:

1. Ve a tu dashboard de Render
2. Selecciona tu servicio backend
3. Ve a la pestaña **"Logs"`** o **"Events"**
4. Busca el error que ocurrió al momento del registro
5. Copia el mensaje de error completo

### En desarrollo local:

Si estás corriendo el backend localmente, verás el error directamente en la terminal donde corre `python manage.py runserver`.

---

## 🐛 Errores Comunes y Soluciones

### Error 1: Campo faltante en el modelo

**Síntoma:** Error como `FieldError: Cannot resolve keyword 'campo' into field`

**Solución:** Verifica que tu modelo `Usuario` tenga todos los campos que el frontend está enviando:

```python
# models.py
class Usuario(models.Model):
    nombre = models.CharField(max_length=100)
    apellidopaterno = models.CharField(max_length=100)
    apellidomaterno = models.CharField(max_length=100, blank=True)
    username = models.CharField(max_length=50, unique=True)
    correo = models.EmailField(unique=True)
    contrasena = models.CharField(max_length=255)  # Hasheada
    telefono = models.CharField(max_length=20, blank=True)
    preguntasecreta = models.CharField(max_length=255)
    respuestasecreta = models.CharField(max_length=255)
    
    # Campos para OTP (si implementaste OTP)
    codigo_otp = models.CharField(max_length=6, null=True, blank=True)
    otp_expira = models.DateTimeField(null=True, blank=True)
    confirmado = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

**Ejecutar migración:**
```bash
python manage.py makemigrations
python manage.py migrate
```

---

### Error 2: Nombre de campo diferente

**Síntoma:** El frontend envía `apellidopaterno` pero el backend espera otro nombre.

**Solución:** Verifica que los nombres de los campos coincidan entre frontend y backend.

**Frontend envía:**
```typescript
{
  nombre: 'Miguel Angel',
  apellidopaterno: 'Perez',
  apellidomaterno: 'de la Cruz',
  username: '20201171@uthh.edu.mx',
  correo: 'miguelperezdelacruz095@gmail.com',
  contrasena: '12345678',
  telefono: '7717053256',
  preguntasecreta: '¿En qué ciudad naciste?',
  respuestasecreta: 'aqui'
}
```

**Backend debe recibir exactamente estos nombres** (o hacer un mapeo).

---

### Error 3: Error al hashear contraseña

**Síntoma:** Error relacionado con `make_password` o `bcrypt`

**Solución:** Asegúrate de importar y usar correctamente:

```python
from django.contrib.auth.hashers import make_password

# En tu vista de registro
usuario = Usuario.objects.create(
    # ... otros campos ...
    contrasena=make_password(data.get('contrasena')),  # ✅ Hashear
    # ...
)
```

---

### Error 4: Error al enviar email con SendGrid

**Síntoma:** Error relacionado con SendGrid o email

**Solución:** Si implementaste OTP con SendGrid, verifica:

1. **Variables de entorno configuradas:**
   ```env
   SENDGRID_API_KEY=tu_api_key
   SENDGRID_FROM_EMAIL=tu_email@ejemplo.com
   SENDGRID_FROM_NAME=modulo usuario
   ```

2. **SendGrid instalado:**
   ```bash
   pip install sendgrid
   ```

3. **Manejo de errores en el código:**
   ```python
   try:
       if enviar_otp_email(correo, codigo_otp):
           return JsonResponse({...}, status=201)
       else:
           return JsonResponse({
               'error': 'No se pudo enviar el correo'
           }, status=500)
   except Exception as e:
       print(f"Error enviando email: {str(e)}")
       return JsonResponse({
           'error': 'Error al enviar correo de activación'
       }, status=500)
   ```

---

### Error 5: Base de datos no disponible o error de conexión

**Síntoma:** Error de conexión a la base de datos

**Solución:** Verifica:
1. Que la base de datos esté corriendo
2. Que las credenciales en `settings.py` sean correctas
3. Que las migraciones estén aplicadas

---

### Error 6: Validación de datos fallando

**Síntoma:** Error de validación en el modelo

**Solución:** Agrega validación en la vista antes de crear el usuario:

```python
@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    try:
        data = json.loads(request.body)
        
        # Validaciones
        if not data.get('nombre'):
            return JsonResponse({'error': 'Nombre es requerido'}, status=400)
        if not data.get('correo'):
            return JsonResponse({'error': 'Correo es requerido'}, status=400)
        if not data.get('contrasena'):
            return JsonResponse({'error': 'Contraseña es requerida'}, status=400)
        
        # Verificar si el correo ya existe
        if Usuario.objects.filter(correo=data.get('correo')).exists():
            return JsonResponse({
                'error': 'Este correo ya está registrado'
            }, status=400)
        
        # Crear usuario
        usuario = Usuario.objects.create(
            nombre=data.get('nombre'),
            apellidopaterno=data.get('apellidopaterno', ''),
            apellidomaterno=data.get('apellidomaterno', ''),
            username=data.get('username', data.get('correo')),
            correo=data.get('correo'),
            contrasena=make_password(data.get('contrasena')),
            telefono=data.get('telefono', ''),
            preguntasecreta=data.get('preguntasecreta', ''),
            respuestasecreta=data.get('respuestasecreta', ''),
        )
        
        return JsonResponse({
            'message': 'Usuario registrado correctamente',
            'tempToken': str(usuario.id)
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        # ✅ IMPORTANTE: Loggear el error para debugging
        import traceback
        print(f"Error en registro: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({
            'error': f'Error al registrar usuario: {str(e)}'
        }, status=500)
```

---

## 🔧 PASO 2: Mejorar Manejo de Errores en el Backend

Agrega logging detallado para identificar el problema:

```python
import logging
import traceback

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    try:
        data = json.loads(request.body)
        logger.info(f"Datos recibidos: {data}")
        
        # ... tu código de registro ...
        
    except Exception as e:
        # Loggear el error completo
        logger.error(f"Error en registro: {str(e)}")
        logger.error(traceback.format_exc())
        
        return JsonResponse({
            'error': 'Error interno del servidor',
            'details': str(e) if settings.DEBUG else None  # Solo en desarrollo
        }, status=500)
```

---

## 🧪 PASO 3: Probar el Endpoint Directamente

Prueba el endpoint directamente con curl o Postman:

```bash
curl -X POST https://backendbina-1.onrender.com/api/usuarios/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test",
    "apellidopaterno": "User",
    "apellidomaterno": "Test",
    "username": "test@example.com",
    "correo": "test@example.com",
    "contrasena": "12345678",
    "telefono": "1234567890",
    "preguntasecreta": "Test?",
    "respuestasecreta": "test"
  }'
```

Esto te dará el mensaje de error exacto del backend.

---

## 📋 Checklist de Verificación

- [ ] Verificaste los logs del backend en Render
- [ ] El modelo `Usuario` tiene todos los campos necesarios
- [ ] Las migraciones están aplicadas (`python manage.py migrate`)
- [ ] Los nombres de los campos coinciden entre frontend y backend
- [ ] La contraseña se está hasheando correctamente
- [ ] Si usas SendGrid, las variables de entorno están configuradas
- [ ] El endpoint `/api/usuarios/register/` existe y está configurado
- [ ] Probaste el endpoint directamente

---

## 🔍 Código de Ejemplo Completo para la Vista de Registro

```python
# views.py
import json
import traceback
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.hashers import make_password
from .models import Usuario

@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    """
    Registra un nuevo usuario
    
    Body esperado:
    {
        "nombre": "Miguel Angel",
        "apellidopaterno": "Perez",
        "apellidomaterno": "de la Cruz",
        "username": "20201171@uthh.edu.mx",
        "correo": "miguelperezdelacruz095@gmail.com",
        "contrasena": "12345678",
        "telefono": "7717053256",
        "preguntasecreta": "¿En qué ciudad naciste?",
        "respuestasecreta": "aqui"
    }
    """
    try:
        # Parsear JSON
        data = json.loads(request.body)
        
        # Validaciones básicas
        correo = data.get('correo')
        if not correo:
            return JsonResponse({'error': 'Correo es requerido'}, status=400)
        
        # Verificar si el correo ya existe
        if Usuario.objects.filter(correo=correo).exists():
            return JsonResponse({
                'error': 'Este correo ya está registrado'
            }, status=400)
        
        # Crear usuario
        usuario = Usuario.objects.create(
            nombre=data.get('nombre', ''),
            apellidopaterno=data.get('apellidopaterno', ''),
            apellidomaterno=data.get('apellidomaterno', ''),
            username=data.get('username', correo),
            correo=correo,
            contrasena=make_password(data.get('contrasena', '')),
            telefono=data.get('telefono', ''),
            preguntasecreta=data.get('preguntasecreta', ''),
            respuestasecreta=data.get('respuestasecreta', ''),
            confirmado=False  # Si usas OTP
        )
        
        # Si implementaste OTP con SendGrid, aquí generarías y enviarías el código
        # codigo_otp = generar_codigo_otp()
        # enviar_otp_email(correo, codigo_otp)
        
        return JsonResponse({
            'message': 'Usuario registrado correctamente',
            'tempToken': str(usuario.id),
            'destino': 'email'
        }, status=201)
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        # Loggear error para debugging
        print(f"❌ Error en registro: {str(e)}")
        print(traceback.format_exc())
        
        return JsonResponse({
            'error': 'Error al registrar usuario',
            'details': str(e)  # Remover en producción
        }, status=500)
```

---

## 🆘 Si Aún No Funciona

1. **Revisa los logs de Render** - Ahí está el error exacto
2. **Prueba el endpoint con Postman/curl** - Para ver el error completo
3. **Verifica que el modelo esté correcto** - Todos los campos deben existir
4. **Verifica las migraciones** - `python manage.py showmigrations` y `python manage.py migrate`
5. **Revisa la configuración de la base de datos** - En `settings.py`

---

## 📝 Nota Importante

El error 500 es un error del servidor. **Necesitas ver los logs del backend** para saber exactamente qué está fallando. Sin los logs, es difícil diagnosticar el problema específico.

**Próximo paso:** Ve a Render → Logs y copia el error completo que aparece cuando intentas registrar.


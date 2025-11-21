# Instrucciones Backend - Problema de Redireccion al Home

## Problema
Despues de hacer login o verificar el codigo OTP, el usuario no es redirigido al home porque el backend no retorna el usuario en la respuesta o no establece la sesion correctamente.

## Solucion Requerida

### 1. Endpoint: `/api/usuarios/login/`

**Metodo:** POST

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response Esperada (CON 2FA):**
```json
{
  "requires2fa": true,
  "tempToken": "token_temporal_para_verificacion",
  "destino": "usuario@ejemplo.com",
  "metodos_disponibles": ["email"]
}
```

**Response Esperada (SIN 2FA - Login directo):**
```json
{
  "ok": true,
  "usuario": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "username": "usuario123"
  },
  "message": "Login exitoso"
}
```

**Response Esperada (ERROR):**
```json
{
  "ok": false,
  "error": "Credenciales incorrectas"
}
```

### 2. Endpoint: `/api/usuarios/login/2fa/verificar/`

**Metodo:** POST

**Request Body:**
```json
{
  "tempToken": "token_temporal_del_login",
  "codigo": "123456"
}
```

**Response Esperada (EXITO):**
```json
{
  "ok": true,
  "usuario": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "username": "usuario123"
  },
  "message": "Login exitoso"
}
```

**Response Esperada (ERROR):**
```json
{
  "ok": false,
  "error": "Codigo incorrecto o expirado"
}
```

## Puntos Criticos

### 1. El campo `ok` debe ser `true`
El frontend verifica `if (response.ok)` para saber si la verificacion fue exitosa.

### 2. El campo `usuario` es OBLIGATORIO
El frontend necesita el objeto `usuario` para:
- Guardarlo en localStorage
- Actualizar el estado de autenticacion
- Permitir el acceso al home (el guard verifica si hay usuario)

**Estructura del usuario:**
```python
{
    "id": usuario.id,
    "email": usuario.email,
    "username": usuario.username
}
```

### 3. Establecer sesion/cookie
Ademas de retornar el usuario en la respuesta, el backend debe:
- Establecer una cookie de sesion (si usas sesiones)
- O retornar un token JWT (si usas tokens)
- Configurar CORS para permitir cookies si es necesario

## Ejemplos de Vistas Django

### Vista 1: Login Inicial

```python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        # Validar credenciales
        usuario = autenticar_usuario(email, password)
        
        if usuario:
            # Si el usuario tiene 2FA habilitado
            if usuario.tiene_2fa:
                # Generar token temporal
                temp_token = generar_temp_token(usuario)
                
                # Enviar codigo 2FA
                enviar_codigo_2fa(usuario.email)
                
                return JsonResponse({
                    'requires2fa': True,
                    'tempToken': temp_token,
                    'destino': usuario.email,
                    'metodos_disponibles': ['email']
                })
            else:
                # Login directo sin 2FA
                request.session['user_id'] = usuario.id
                request.session['authenticated'] = True
                
                return JsonResponse({
                    'ok': True,
                    'usuario': {
                        'id': usuario.id,
                        'email': usuario.email,
                        'username': usuario.username
                    },
                    'message': 'Login exitoso'
                })
        else:
            return JsonResponse({
                'ok': False,
                'error': 'Credenciales incorrectas'
            }, status=401)
            
    except Exception as e:
        return JsonResponse({
            'ok': False,
            'error': str(e)
        }, status=500)
```

### Vista 2: Verificar Login 2FA

```python
@csrf_exempt
@require_http_methods(["POST"])
def verificar_login_2fa(request):
    try:
        data = json.loads(request.body)
        temp_token = data.get('tempToken')
        codigo = data.get('codigo')
        
        # Validar token y codigo
        # ... tu logica de validacion ...
        
        if codigo_valido:
            # Obtener usuario
            usuario = obtener_usuario_por_token(temp_token)
            
            # Establecer sesion (si usas sesiones)
            request.session['user_id'] = usuario.id
            request.session['authenticated'] = True
            
            # Retornar respuesta con usuario
            return JsonResponse({
                'ok': True,
                'usuario': {
                    'id': usuario.id,
                    'email': usuario.email,
                    'username': usuario.username
                },
                'message': 'Login exitoso'
            })
        else:
            return JsonResponse({
                'ok': False,
                'error': 'Codigo incorrecto o expirado'
            }, status=400)
            
    except Exception as e:
        return JsonResponse({
            'ok': False,
            'error': str(e)
        }, status=500)
```

## Si usas OTP SendGrid para Login

Si el backend tiene un endpoint separado para OTP SendGrid en login (por ejemplo `/api/usuarios/verificar-otp-login/`), debe retornar la misma estructura:

```json
{
  "ok": true,
  "usuario": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "username": "usuario123"
  }
}
```

## Verificacion

Para verificar que funciona:

1. Hacer login
2. Verificar codigo OTP
3. Revisar la respuesta del backend en Network tab del navegador
4. Debe incluir `ok: true` y `usuario` con los datos del usuario

## Notas Importantes

- El frontend usa `withCredentials: true` en las peticiones, asegurate de configurar CORS correctamente
- Si usas cookies de sesion, deben ser `HttpOnly` y `SameSite=None` (para cross-origin)
- El usuario debe tener los campos: `id`, `email`, `username` (al menos estos)


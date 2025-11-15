"""
Ejemplo de vistas Django para implementar OTP con SendGrid
Basado en la implementación de Nova_Graf-main

Este archivo muestra cómo implementar las vistas en Django para:
- Registro con OTP
- Verificación de OTP
- Reenvío de OTP
- Recuperación de contraseña con OTP
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from datetime import timedelta
import json
from .sendgrid_otp_service import generar_codigo_otp, enviar_otp_email, enviar_otp_recuperacion
from .models import Usuario  # Ajusta según tu modelo


@csrf_exempt
@require_http_methods(["POST"])
def registrar_usuario(request):
    """
    Registra un usuario y envía código OTP por email
    
    Body esperado:
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
    """
    try:
        data = json.loads(request.body)
        
        # Validaciones básicas
        correo = data.get('correo')
        if Usuario.objects.filter(correo=correo).exists():
            return JsonResponse({
                'error': 'Este correo ya está registrado'
            }, status=400)
        
        # Generar código OTP
        codigo_otp = generar_codigo_otp()
        otp_expira = timezone.now() + timedelta(minutes=10)
        
        # Crear usuario (ajusta según tu modelo)
        usuario = Usuario.objects.create(
            nombre=data.get('nombre'),
            apellidopaterno=data.get('apellidopaterno'),
            apellidomaterno=data.get('apellidomaterno'),
            username=data.get('username'),
            correo=correo,
            contrasena=data.get('contrasena'),  # Deberías hashear la contraseña
            telefono=data.get('telefono'),
            preguntasecreta=data.get('preguntasecreta'),
            respuestasecreta=data.get('respuestasecreta'),
            codigo_otp=codigo_otp,
            otp_expira=otp_expira,
            confirmado=False
        )
        
        # Enviar código OTP por email
        if enviar_otp_email(correo, codigo_otp):
            return JsonResponse({
                'message': 'Usuario registrado. Ingresa el código OTP enviado a tu correo.',
                'tempToken': str(usuario.id),  # O genera un token temporal
                'destino': 'email'
            }, status=201)
        else:
            return JsonResponse({
                'error': 'Usuario registrado, pero no se pudo enviar el correo de activación'
            }, status=500)
            
    except Exception as e:
        return JsonResponse({
            'error': f'Error al registrar usuario: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def verificar_otp_registro(request):
    """
    Verifica el código OTP durante el registro
    
    Body esperado:
    {
        "tempToken": "token_temporal",
        "codigo": "123456"
    }
    """
    try:
        data = json.loads(request.body)
        temp_token = data.get('tempToken')
        codigo = data.get('codigo')
        
        # Obtener usuario (ajusta según cómo manejes el tempToken)
        usuario = Usuario.objects.get(id=temp_token)
        
        # Verificar si el código ha expirado
        if usuario.otp_expira < timezone.now():
            return JsonResponse({
                'error': 'Código expirado. Solicita uno nuevo.'
            }, status=400)
        
        # Verificar código
        if usuario.codigo_otp != codigo:
            return JsonResponse({
                'error': 'Código incorrecto'
            }, status=400)
        
        # Activar cuenta
        usuario.confirmado = True
        usuario.codigo_otp = None
        usuario.otp_expira = None
        usuario.save()
        
        return JsonResponse({
            'ok': True,
            'message': 'Cuenta activada correctamente'
        }, status=200)
        
    except Usuario.DoesNotExist:
        return JsonResponse({
            'error': 'Usuario no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'error': f'Error al verificar código: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def reenviar_otp(request):
    """
    Reenvía un código OTP
    
    Body esperado:
    {
        "correo": "juan@example.com"
    }
    """
    try:
        data = json.loads(request.body)
        correo = data.get('correo')
        
        usuario = Usuario.objects.get(correo=correo)
        
        # Generar nuevo código
        nuevo_codigo = generar_codigo_otp()
        usuario.codigo_otp = nuevo_codigo
        usuario.otp_expira = timezone.now() + timedelta(minutes=10)
        usuario.save()
        
        # Enviar nuevo código
        if enviar_otp_email(correo, nuevo_codigo):
            return JsonResponse({
                'message': 'Nuevo código enviado a tu correo. Expira en 10 minutos.'
            }, status=200)
        else:
            return JsonResponse({
                'error': 'No se pudo enviar el código'
            }, status=500)
            
    except Usuario.DoesNotExist:
        return JsonResponse({
            'error': 'Usuario no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'error': f'Error al reenviar código: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def recuperar_contrasena(request):
    """
    Inicia el proceso de recuperación de contraseña enviando OTP
    
    Body esperado:
    {
        "email": "juan@example.com"
    }
    """
    try:
        data = json.loads(request.body)
        correo = data.get('email')
        
        usuario = Usuario.objects.get(correo=correo)
        
        # Generar código OTP
        codigo_otp = generar_codigo_otp()
        usuario.codigo_otp = codigo_otp
        usuario.otp_expira = timezone.now() + timedelta(minutes=10)
        usuario.save()
        
        # Enviar código por email
        if enviar_otp_recuperacion(correo, codigo_otp):
            return JsonResponse({
                'message': 'Código de recuperación enviado a tu correo. Expira en 10 minutos.',
                'tempToken': str(usuario.id)
            }, status=200)
        else:
            return JsonResponse({
                'error': 'No se pudo enviar el código de recuperación'
            }, status=500)
            
    except Usuario.DoesNotExist:
        return JsonResponse({
            'error': 'Usuario no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'error': f'Error al procesar solicitud: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def verificar_otp_recuperacion(request):
    """
    Verifica el código OTP para recuperación de contraseña
    
    Body esperado:
    {
        "tempToken": "token_temporal",
        "codigo": "123456"
    }
    """
    try:
        data = json.loads(request.body)
        temp_token = data.get('tempToken')
        codigo = data.get('codigo')
        
        usuario = Usuario.objects.get(id=temp_token)
        
        # Verificar expiración
        if usuario.otp_expira < timezone.now():
            usuario.codigo_otp = None
            usuario.otp_expira = None
            usuario.save()
            return JsonResponse({
                'error': 'Código expirado. Solicita uno nuevo.'
            }, status=400)
        
        # Verificar código
        if usuario.codigo_otp != codigo:
            return JsonResponse({
                'error': 'Código incorrecto'
            }, status=400)
        
        # Código correcto - mantener código activo para cambio de contraseña
        return JsonResponse({
            'ok': True,
            'message': 'Código verificado. Ahora puedes cambiar tu contraseña.'
        }, status=200)
        
    except Usuario.DoesNotExist:
        return JsonResponse({
            'error': 'Usuario no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'error': f'Error al verificar código: {str(e)}'
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def actualizar_contrasena(request):
    """
    Actualiza la contraseña después de verificar OTP
    
    Body esperado:
    {
        "tempToken": "token_temporal",
        "nuevaContrasena": "nueva_password123"
    }
    """
    try:
        data = json.loads(request.body)
        temp_token = data.get('tempToken')
        nueva_contrasena = data.get('nuevaContrasena')
        
        usuario = Usuario.objects.get(id=temp_token)
        
        # Verificar que el código OTP aún sea válido
        if not usuario.codigo_otp or usuario.otp_expira < timezone.now():
            return JsonResponse({
                'error': 'Sesión expirada. Solicita un nuevo código.'
            }, status=400)
        
        # Actualizar contraseña (deberías hashearla)
        usuario.contrasena = nueva_contrasena
        usuario.codigo_otp = None
        usuario.otp_expira = None
        usuario.save()
        
        return JsonResponse({
            'message': 'Contraseña actualizada correctamente'
        }, status=200)
        
    except Usuario.DoesNotExist:
        return JsonResponse({
            'error': 'Usuario no encontrado'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'error': f'Error al actualizar contraseña: {str(e)}'
        }, status=500)


"""
Vistas para el sistema de autenticación
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db import transaction
import logging

from .models import Usuario, Codigo2FA
from .utils import (
    generar_codigo_2fa_para_email,
    validar_codigo_2fa,
    verificar_firebase_token
)

logger = logging.getLogger(__name__)


@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def obtener_csrf_token(request):
    """
    Endpoint para obtener el CSRF token
    """
    csrf_token = get_token(request)
    return Response({
        'ok': True,
        'csrfToken': csrf_token
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def registro_paso1(request):
    """
    Paso 1 del registro: Validar datos y enviar código 2FA
    """
    try:
        # Obtener datos del request
        data = request.data
        nombre = data.get('nombre', '').strip()
        apellidopaterno = data.get('apellidopaterno', '').strip()
        apellidomaterno = data.get('apellidomaterno', '').strip()
        username = data.get('username', '').strip()
        correo = data.get('correo', '').strip().lower()
        contrasena = data.get('contrasena', '')
        telefono = data.get('telefono', '').strip()
        preguntasecreta = data.get('preguntasecreta', '').strip()
        respuestasecreta = data.get('respuestasecreta', '').strip()

        # Validaciones básicas
        if not all([nombre, apellidopaterno, username, correo, contrasena, preguntasecreta, respuestasecreta]):
            return Response({
                'ok': False,
                'mensaje': 'Todos los campos son obligatorios'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validar longitud de username
        if len(username) < 4:
            return Response({
                'ok': False,
                'mensaje': 'El username debe tener al menos 4 caracteres'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validar longitud de contraseña
        if len(contrasena) < 8:
            return Response({
                'ok': False,
                'mensaje': 'La contraseña debe tener al menos 8 caracteres'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si el email ya existe
        if Usuario.objects.filter(email=correo).exists():
            return Response({
                'ok': False,
                'mensaje': 'El correo ya está registrado'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si el username ya existe
        if Usuario.objects.filter(username=username).exists():
            return Response({
                'ok': False,
                'mensaje': 'El username ya está en uso'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Preparar datos temporales
        temp_data = {
            'nombre': nombre,
            'apellidopaterno': apellidopaterno,
            'apellidomaterno': apellidomaterno,
            'username': username,
            'correo': correo,
            'contrasena': contrasena,  # Se hasheará después de la verificación
            'telefono': telefono,
            'preguntasecreta': preguntasecreta,
            'respuestasecreta': respuestasecreta,
        }

        # Generar y enviar código 2FA
        codigo_obj, codigo_plano = generar_codigo_2fa_para_email(
            correo,
            tipo=Codigo2FA.TIPO_REGISTRO,
            temp_data=temp_data
        )

        if not codigo_obj:
            return Response({
                'ok': False,
                'mensaje': 'Error al generar código de verificación'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'ok': True,
            'mensaje': 'Código de verificación enviado a tu correo',
            'tempToken': codigo_obj.temp_token,
            'expiresIn': codigo_obj.expira_en.isoformat()
        })

    except Exception as e:
        logger.error(f"Error en registro_paso1: {str(e)}")
        return Response({
            'ok': False,
            'mensaje': 'Error al procesar el registro'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def registro_paso2_verificar(request):
    """
    Paso 2 del registro: Verificar código 2FA y crear usuario
    """
    try:
        temp_token = request.data.get('tempToken', '')
        codigo = request.data.get('codigo', '').strip()

        if not temp_token or not codigo:
            return Response({
                'ok': False,
                'mensaje': 'Token y código son obligatorios'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validar código 2FA
        valido, codigo_obj, mensaje = validar_codigo_2fa(temp_token, codigo)

        if not valido:
            return Response({
                'ok': False,
                'mensaje': mensaje
            }, status=status.HTTP_400_BAD_REQUEST)

        # Obtener datos temporales
        temp_data = codigo_obj.temp_data

        if not temp_data:
            return Response({
                'ok': False,
                'mensaje': 'Datos de registro no encontrados'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Crear usuario con transacción
        with transaction.atomic():
            usuario = Usuario.objects.create(
                email=temp_data['correo'],
                username=temp_data['username'],
                nombre=temp_data['nombre'],
                apellidopaterno=temp_data['apellidopaterno'],
                apellidomaterno=temp_data.get('apellidomaterno', ''),
                telefono=temp_data.get('telefono', ''),
                preguntasecreta=temp_data['preguntasecreta'],
                respuestasecreta=temp_data['respuestasecreta'],
                is_active=True
            )
            usuario.set_password(temp_data['contrasena'])
            usuario.save()

            # Eliminar código usado
            codigo_obj.delete()

        logger.info(f"Usuario registrado exitosamente: {usuario.email}")

        return Response({
            'ok': True,
            'mensaje': 'Registro completado exitosamente',
            'usuario': {
                'id': usuario.id,
                'email': usuario.email,
                'username': usuario.username,
            }
        })

    except Exception as e:
        logger.error(f"Error en registro_paso2_verificar: {str(e)}")
        return Response({
            'ok': False,
            'mensaje': 'Error al completar el registro'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_paso1(request):
    """
    Paso 1 del login: Validar credenciales y enviar código 2FA
    """
    try:
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response({
                'ok': False,
                'mensaje': 'Email y contraseña son obligatorios'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Autenticar usuario
        usuario = authenticate(request, username=email, password=password)

        if not usuario:
            return Response({
                'ok': False,
                'mensaje': 'Credenciales incorrectas'
            }, status=status.HTTP_401_UNAUTHORIZED)

        if not usuario.is_active:
            return Response({
                'ok': False,
                'mensaje': 'Usuario inactivo'
            }, status=status.HTTP_403_FORBIDDEN)

        # Generar y enviar código 2FA
        codigo_obj, codigo_plano = generar_codigo_2fa_para_email(
            email,
            tipo=Codigo2FA.TIPO_LOGIN,
            temp_data={'user_id': usuario.id}
        )

        if not codigo_obj:
            return Response({
                'ok': False,
                'mensaje': 'Error al generar código de verificación'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'ok': True,
            'mensaje': 'Código de verificación enviado a tu correo',
            'tempToken': codigo_obj.temp_token,
            'expiresIn': codigo_obj.expira_en.isoformat()
        })

    except Exception as e:
        logger.error(f"Error en login_paso1: {str(e)}")
        return Response({
            'ok': False,
            'mensaje': 'Error al procesar el inicio de sesión'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_paso2_verificar(request):
    """
    Paso 2 del login: Verificar código 2FA e iniciar sesión
    """
    try:
        temp_token = request.data.get('tempToken', '')
        codigo = request.data.get('codigo', '').strip()

        if not temp_token or not codigo:
            return Response({
                'ok': False,
                'mensaje': 'Token y código son obligatorios'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validar código 2FA
        valido, codigo_obj, mensaje = validar_codigo_2fa(temp_token, codigo)

        if not valido:
            return Response({
                'ok': False,
                'mensaje': mensaje
            }, status=status.HTTP_400_BAD_REQUEST)

        # Obtener usuario
        temp_data = codigo_obj.temp_data
        user_id = temp_data.get('user_id')

        if not user_id:
            return Response({
                'ok': False,
                'mensaje': 'Datos de sesión no encontrados'
            }, status=status.HTTP_400_BAD_REQUEST)

        usuario = Usuario.objects.get(id=user_id)

        # Iniciar sesión
        login(request, usuario)

        # Eliminar código usado
        codigo_obj.delete()

        logger.info(f"Usuario inició sesión exitosamente: {usuario.email}")

        return Response({
            'ok': True,
            'mensaje': 'Sesión iniciada correctamente',
            'usuario': {
                'id': usuario.id,
                'email': usuario.email,
                'username': usuario.username,
            }
        })

    except Usuario.DoesNotExist:
        return Response({
            'ok': False,
            'mensaje': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error en login_paso2_verificar: {str(e)}")
        return Response({
            'ok': False,
            'mensaje': 'Error al verificar código'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_con_google(request):
    """
    Iniciar sesión con Google OAuth (Firebase)
    """
    try:
        id_token = request.data.get('idToken', '')

        if not id_token:
            return Response({
                'ok': False,
                'mensaje': 'Token de Google es obligatorio'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar token de Firebase
        user_info = verificar_firebase_token(id_token)

        if not user_info:
            return Response({
                'ok': False,
                'mensaje': 'Token de Google inválido'
            }, status=status.HTTP_401_UNAUTHORIZED)

        email = user_info.get('email')
        google_uid = user_info.get('uid')
        name = user_info.get('name', '')

        if not email:
            return Response({
                'ok': False,
                'mensaje': 'No se pudo obtener el email de Google'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Buscar o crear usuario
        usuario, created = Usuario.objects.get_or_create(
            email=email,
            defaults={
                'username': email.split('@')[0],
                'nombre': name,
                'google_id': google_uid,
                'is_google_user': True,
                'is_active': True,
            }
        )

        # Si el usuario ya existía, actualizar google_id si no lo tenía
        if not created and not usuario.google_id:
            usuario.google_id = google_uid
            usuario.is_google_user = True
            usuario.save()

        # Iniciar sesión
        login(request, usuario)

        logger.info(f"Usuario inició sesión con Google: {usuario.email}")

        return Response({
            'ok': True,
            'mensaje': 'Sesión iniciada con Google correctamente',
            'usuario': {
                'id': usuario.id,
                'email': usuario.email,
                'username': usuario.username,
            }
        })

    except Exception as e:
        logger.error(f"Error en login_con_google: {str(e)}")
        return Response({
            'ok': False,
            'mensaje': 'Error al iniciar sesión con Google'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def recuperar_contrasena_paso1(request):
    """
    Paso 1 de recuperación: Validar pregunta secreta y enviar código
    """
    try:
        email = request.data.get('email', '').strip().lower()
        pregunta_secreta = request.data.get('preguntaSecreta', '').strip()
        respuesta_secreta = request.data.get('respuestaSecreta', '').strip()

        if not all([email, pregunta_secreta, respuesta_secreta]):
            return Response({
                'ok': False,
                'mensaje': 'Todos los campos son obligatorios'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Buscar usuario
        try:
            usuario = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response({
                'ok': False,
                'mensaje': 'Usuario no encontrado'
            }, status=status.HTTP_404_NOT_FOUND)

        # Verificar pregunta y respuesta secreta
        if usuario.preguntasecreta != pregunta_secreta or usuario.respuestasecreta != respuesta_secreta:
            return Response({
                'ok': False,
                'mensaje': 'Pregunta o respuesta secreta incorrecta'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Generar y enviar código 2FA
        codigo_obj, codigo_plano = generar_codigo_2fa_para_email(
            email,
            tipo=Codigo2FA.TIPO_RECUPERACION,
            temp_data={'user_id': usuario.id}
        )

        if not codigo_obj:
            return Response({
                'ok': False,
                'mensaje': 'Error al generar código de verificación'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'ok': True,
            'mensaje': 'Código de verificación enviado a tu correo',
            'tempToken': codigo_obj.temp_token,
            'expiresIn': codigo_obj.expira_en.isoformat()
        })

    except Exception as e:
        logger.error(f"Error en recuperar_contrasena_paso1: {str(e)}")
        return Response({
            'ok': False,
            'mensaje': 'Error al procesar la recuperación'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def restablecer_contrasena(request):
    """
    Paso 2 de recuperación: Restablecer contraseña con token temporal
    """
    try:
        temp_token = request.data.get('tempToken', '')
        nueva_contrasena = request.data.get('nuevaContrasena', '')

        if not temp_token or not nueva_contrasena:
            return Response({
                'ok': False,
                'mensaje': 'Token y nueva contraseña son obligatorios'
            }, status=status.HTTP_400_BAD_REQUEST)

        if len(nueva_contrasena) < 8:
            return Response({
                'ok': False,
                'mensaje': 'La contraseña debe tener al menos 8 caracteres'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Buscar código de recuperación
        try:
            codigo_obj = Codigo2FA.objects.get(
                temp_token=temp_token,
                tipo=Codigo2FA.TIPO_RECUPERACION,
                verificado=True
            )
        except Codigo2FA.DoesNotExist:
            return Response({
                'ok': False,
                'mensaje': 'Token inválido o no verificado'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Verificar expiración
        if codigo_obj.esta_expirado():
            return Response({
                'ok': False,
                'mensaje': 'Token expirado'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Obtener usuario
        user_id = codigo_obj.temp_data.get('user_id')
        usuario = Usuario.objects.get(id=user_id)

        # Actualizar contraseña
        usuario.set_password(nueva_contrasena)
        usuario.save()

        # Eliminar código usado
        codigo_obj.delete()

        logger.info(f"Contraseña restablecida para: {usuario.email}")

        return Response({
            'ok': True,
            'mensaje': 'Contraseña restablecida correctamente'
        })

    except Usuario.DoesNotExist:
        return Response({
            'ok': False,
            'mensaje': 'Usuario no encontrado'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.error(f"Error en restablecer_contrasena: {str(e)}")
        return Response({
            'ok': False,
            'mensaje': 'Error al restablecer contraseña'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def cerrar_sesion(request):
    """
    Cerrar sesión del usuario
    """
    try:
        logout(request)
        return Response({
            'ok': True,
            'mensaje': 'Sesión cerrada correctamente'
        })
    except Exception as e:
        logger.error(f"Error en cerrar_sesion: {str(e)}")
        return Response({
            'ok': False,
            'mensaje': 'Error al cerrar sesión'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

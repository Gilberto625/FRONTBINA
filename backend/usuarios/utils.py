"""
Utilidades para el sistema de autenticación
"""
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)


def enviar_codigo_2fa(email, codigo, tipo='login'):
    """
    Envía un código 2FA por email

    Args:
        email: Email del destinatario
        codigo: Código de verificación de 6 dígitos
        tipo: Tipo de código (login, registro, recuperacion)

    Returns:
        bool: True si el email se envió correctamente
    """
    tipo_texto = {
        'login': 'inicio de sesión',
        'registro': 'registro',
        'recuperacion': 'recuperación de contraseña'
    }

    asunto = f'Código de verificación - {tipo_texto.get(tipo, "autenticación")}'

    mensaje = f"""
    Hola,

    Tu código de verificación para {tipo_texto.get(tipo, "autenticación")} es:

    {codigo}

    Este código es válido por {settings.TWO_FA_CODE_EXPIRY_MINUTES} minutos.

    Si no solicitaste este código, ignora este mensaje.

    Saludos,
    Equipo de Seguridad
    """

    try:
        send_mail(
            asunto,
            mensaje,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        logger.info(f"Código 2FA enviado a {email} para {tipo}")
        return True
    except Exception as e:
        logger.error(f"Error al enviar código 2FA a {email}: {str(e)}")
        return False


def verificar_firebase_token(id_token):
    """
    Verifica un token de Firebase y retorna la información del usuario

    Args:
        id_token: Token de ID de Firebase

    Returns:
        dict: Información del usuario o None si es inválido
    """
    try:
        import firebase_admin
        from firebase_admin import auth, credentials

        # Inicializar Firebase Admin si no está inicializado
        if not firebase_admin._apps:
            # En producción, usa variables de entorno para las credenciales
            # Para desarrollo, puedes usar un archivo de credenciales
            try:
                cred = credentials.Certificate({
                    "type": "service_account",
                    "project_id": settings.FIREBASE_PROJECT_ID,
                    # Agrega más campos según tus credenciales de Firebase
                })
                firebase_admin.initialize_app(cred)
            except Exception as e:
                logger.warning(f"No se pudo inicializar Firebase Admin SDK: {e}")
                # Modo de desarrollo sin verificación real
                # En producción, esto debería fallar
                return None

        # Verificar el token
        decoded_token = auth.verify_id_token(id_token)

        return {
            'uid': decoded_token.get('uid'),
            'email': decoded_token.get('email'),
            'name': decoded_token.get('name', ''),
            'picture': decoded_token.get('picture', ''),
        }

    except Exception as e:
        logger.error(f"Error al verificar token de Firebase: {str(e)}")
        return None


def generar_codigo_2fa_para_email(email, tipo='login', temp_data=None):
    """
    Genera y guarda un código 2FA para un email específico

    Args:
        email: Email del usuario
        tipo: Tipo de código (login, registro, recuperacion)
        temp_data: Datos temporales a guardar (para registro)

    Returns:
        tuple: (codigo_obj, codigo_plano) o (None, None) si falla
    """
    from .models import Codigo2FA

    try:
        # Invalidar códigos anteriores del mismo tipo y email
        Codigo2FA.objects.filter(
            email=email,
            tipo=tipo,
            verificado=False
        ).delete()

        # Generar nuevo código
        codigo = Codigo2FA.generar_codigo(settings.TWO_FA_CODE_LENGTH)
        temp_token = Codigo2FA.generar_temp_token()
        expira_en = timezone.now() + timedelta(minutes=settings.TWO_FA_CODE_EXPIRY_MINUTES)

        # Crear el objeto
        codigo_obj = Codigo2FA.objects.create(
            email=email,
            codigo=codigo,
            tipo=tipo,
            temp_token=temp_token,
            temp_data=temp_data,
            expira_en=expira_en,
            max_intentos=settings.TWO_FA_MAX_ATTEMPTS
        )

        # Enviar código por email
        envio_exitoso = enviar_codigo_2fa(email, codigo, tipo)

        if not envio_exitoso:
            logger.warning(f"Código generado pero no se pudo enviar email a {email}")

        return codigo_obj, codigo

    except Exception as e:
        logger.error(f"Error al generar código 2FA para {email}: {str(e)}")
        return None, None


def validar_codigo_2fa(temp_token, codigo):
    """
    Valida un código 2FA usando el temp_token

    Args:
        temp_token: Token temporal del código
        codigo: Código a verificar

    Returns:
        tuple: (valido, codigo_obj, mensaje_error)
    """
    from .models import Codigo2FA

    try:
        # Buscar el código por temp_token
        codigo_obj = Codigo2FA.objects.filter(temp_token=temp_token).first()

        if not codigo_obj:
            return False, None, "Código no encontrado"

        # Verificar si ya fue usado
        if codigo_obj.verificado:
            return False, codigo_obj, "Código ya utilizado"

        # Verificar expiración
        if codigo_obj.esta_expirado():
            return False, codigo_obj, "Código expirado"

        # Verificar intentos
        if not codigo_obj.puede_intentar():
            return False, codigo_obj, "Número máximo de intentos alcanzado"

        # Verificar el código
        if codigo_obj.codigo == codigo:
            codigo_obj.marcar_verificado()
            return True, codigo_obj, "Código válido"
        else:
            codigo_obj.incrementar_intentos()
            intentos_restantes = codigo_obj.max_intentos - codigo_obj.intentos
            return False, codigo_obj, f"Código incorrecto. Intentos restantes: {intentos_restantes}"

    except Exception as e:
        logger.error(f"Error al validar código 2FA: {str(e)}")
        return False, None, "Error al validar código"


def limpiar_codigos_expirados():
    """
    Limpia códigos 2FA expirados de la base de datos
    Esta función puede ser llamada por un comando de gestión o tarea programada
    """
    from .models import Codigo2FA

    try:
        codigos_expirados = Codigo2FA.objects.filter(
            expira_en__lt=timezone.now(),
            verificado=False
        )

        cantidad = codigos_expirados.count()
        codigos_expirados.delete()

        logger.info(f"Se eliminaron {cantidad} códigos 2FA expirados")
        return cantidad

    except Exception as e:
        logger.error(f"Error al limpiar códigos expirados: {str(e)}")
        return 0

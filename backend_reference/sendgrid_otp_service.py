"""
Servicio de OTP con SendGrid para Django
Basado en la implementación de Nova_Graf-main

Instalación:
pip install sendgrid django

Configuración en settings.py:
SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY', 'TU_SENDGRID_API_KEY_AQUI')
SENDGRID_FROM_EMAIL = os.getenv('SENDGRID_FROM_EMAIL', 'tu_email@ejemplo.com')
SENDGRID_FROM_NAME = os.getenv('SENDGRID_FROM_NAME', 'modulo usuario')
"""

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
    """
    Envía un código OTP por email usando SendGrid
    
    Args:
        correo: Email del destinatario
        codigo_otp: Código OTP de 6 dígitos
        
    Returns:
        bool: True si se envió correctamente, False en caso contrario
    """
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
        
        if response.status_code == 202:
            print(f"✅ Correo OTP enviado a: {correo}")
            return True
        else:
            print(f"❌ Error enviando correo: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error enviando correo OTP: {str(e)}")
        return False


def enviar_otp_recuperacion(correo: str, codigo_otp: str) -> bool:
    """
    Envía un código OTP para recuperación de contraseña
    
    Args:
        correo: Email del destinatario
        codigo_otp: Código OTP de 6 dígitos
        
    Returns:
        bool: True si se envió correctamente, False en caso contrario
    """
    try:
        message = Mail(
            from_email=(settings.SENDGRID_FROM_EMAIL, settings.SENDGRID_FROM_NAME),
            to_emails=correo,
            subject='Recuperación de contraseña - Módulo Usuario',
            html_content=f'''
                <h2>Recuperación de contraseña</h2>
                <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                <p>Tu código de verificación es:</p>
                <h3 style="font-size: 24px; color: #1976d2; letter-spacing: 4px;">{codigo_otp}</h3>
                <p>Este código expira en 10 minutos.</p>
                <p>Si no solicitaste este cambio, ignora este mensaje.</p>
            '''
        )
        
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        
        if response.status_code == 202:
            print(f"✅ Correo de recuperación enviado a: {correo}")
            return True
        else:
            print(f"❌ Error enviando correo: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error enviando correo de recuperación: {str(e)}")
        return False


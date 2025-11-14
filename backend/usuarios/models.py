from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
import secrets
import string


class UsuarioManager(BaseUserManager):
    """Manager personalizado para el modelo Usuario"""

    def create_user(self, email, username, password=None, **extra_fields):
        """Crea y guarda un usuario normal"""
        if not email:
            raise ValueError('El email es obligatorio')
        if not username:
            raise ValueError('El username es obligatorio')

        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        """Crea y guarda un superusuario"""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')

        return self.create_user(email, username, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    """Modelo de Usuario personalizado"""

    # Campos de identificación
    email = models.EmailField('Correo electrónico', unique=True, max_length=255)
    username = models.CharField('Nombre de usuario', max_length=150, unique=True)

    # Información personal
    nombre = models.CharField('Nombre', max_length=100, blank=True)
    apellidopaterno = models.CharField('Apellido paterno', max_length=100, blank=True)
    apellidomaterno = models.CharField('Apellido materno', max_length=100, blank=True)
    telefono = models.CharField('Teléfono', max_length=20, blank=True)

    # Seguridad - Pregunta secreta para recuperación de contraseña
    preguntasecreta = models.CharField('Pregunta secreta', max_length=255, blank=True)
    respuestasecreta = models.CharField('Respuesta secreta', max_length=255, blank=True)

    # Campos de autenticación con Google
    google_id = models.CharField('Google ID', max_length=255, blank=True, null=True, unique=True)
    is_google_user = models.BooleanField('Usuario de Google', default=False)

    # Permisos y estado
    is_active = models.BooleanField('Activo', default=True)
    is_staff = models.BooleanField('Staff', default=False)
    is_superuser = models.BooleanField('Superusuario', default=False)

    # Fechas
    date_joined = models.DateTimeField('Fecha de registro', default=timezone.now)
    last_login = models.DateTimeField('Último inicio de sesión', null=True, blank=True)

    # Manager
    objects = UsuarioManager()

    # Configuración de autenticación
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-date_joined']

    def __str__(self):
        return self.email

    def get_full_name(self):
        """Retorna el nombre completo del usuario"""
        return f"{self.nombre} {self.apellidopaterno} {self.apellidomaterno}".strip()

    def get_short_name(self):
        """Retorna el nombre corto del usuario"""
        return self.nombre or self.username


class Codigo2FA(models.Model):
    """Modelo para almacenar códigos de verificación 2FA"""

    TIPO_REGISTRO = 'registro'
    TIPO_LOGIN = 'login'
    TIPO_RECUPERACION = 'recuperacion'

    TIPO_CHOICES = [
        (TIPO_REGISTRO, 'Registro'),
        (TIPO_LOGIN, 'Login'),
        (TIPO_RECUPERACION, 'Recuperación'),
    ]

    email = models.EmailField('Email')
    codigo = models.CharField('Código', max_length=6)
    tipo = models.CharField('Tipo', max_length=20, choices=TIPO_CHOICES)
    temp_token = models.CharField('Token temporal', max_length=64, unique=True)

    # Datos temporales para registro
    temp_data = models.JSONField('Datos temporales', null=True, blank=True)

    # Control de intentos y expiración
    intentos = models.IntegerField('Intentos', default=0)
    max_intentos = models.IntegerField('Máximo de intentos', default=5)
    expira_en = models.DateTimeField('Expira en')
    verificado = models.BooleanField('Verificado', default=False)

    # Timestamps
    creado_en = models.DateTimeField('Creado en', auto_now_add=True)
    actualizado_en = models.DateTimeField('Actualizado en', auto_now=True)

    class Meta:
        verbose_name = 'Código 2FA'
        verbose_name_plural = 'Códigos 2FA'
        ordering = ['-creado_en']
        indexes = [
            models.Index(fields=['temp_token']),
            models.Index(fields=['email', 'tipo']),
        ]

    def __str__(self):
        return f"{self.email} - {self.tipo} - {self.codigo}"

    @staticmethod
    def generar_codigo(longitud=6):
        """Genera un código numérico aleatorio"""
        return ''.join(secrets.choice(string.digits) for _ in range(longitud))

    @staticmethod
    def generar_temp_token():
        """Genera un token temporal único"""
        return secrets.token_urlsafe(48)

    def esta_expirado(self):
        """Verifica si el código ha expirado"""
        return timezone.now() > self.expira_en

    def puede_intentar(self):
        """Verifica si aún puede intentar validar el código"""
        return self.intentos < self.max_intentos

    def incrementar_intentos(self):
        """Incrementa el contador de intentos"""
        self.intentos += 1
        self.save(update_fields=['intentos', 'actualizado_en'])

    def marcar_verificado(self):
        """Marca el código como verificado"""
        self.verificado = True
        self.save(update_fields=['verificado', 'actualizado_en'])


class SesionUsuario(models.Model):
    """Modelo para gestionar sesiones de usuarios (opcional, para mayor seguridad)"""

    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.CASCADE,
        related_name='sesiones',
        verbose_name='Usuario'
    )
    session_key = models.CharField('Session Key', max_length=40, unique=True)
    ip_address = models.GenericIPAddressField('Dirección IP', null=True, blank=True)
    user_agent = models.TextField('User Agent', blank=True)

    # Timestamps
    creada_en = models.DateTimeField('Creada en', auto_now_add=True)
    ultima_actividad = models.DateTimeField('Última actividad', auto_now=True)
    expira_en = models.DateTimeField('Expira en')

    class Meta:
        verbose_name = 'Sesión de Usuario'
        verbose_name_plural = 'Sesiones de Usuarios'
        ordering = ['-ultima_actividad']

    def __str__(self):
        return f"{self.usuario.email} - {self.session_key[:10]}..."

    def esta_activa(self):
        """Verifica si la sesión está activa"""
        return timezone.now() < self.expira_en

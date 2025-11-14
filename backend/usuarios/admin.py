from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import Usuario, Codigo2FA, SesionUsuario


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    """Configuración del admin para el modelo Usuario"""

    list_display = ['email', 'username', 'nombre', 'apellidopaterno', 'is_active', 'is_staff', 'date_joined']
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'is_google_user', 'date_joined']
    search_fields = ['email', 'username', 'nombre', 'apellidopaterno', 'apellidomaterno']
    ordering = ['-date_joined']

    fieldsets = (
        (None, {'fields': ('email', 'username', 'password')}),
        (_('Información Personal'), {'fields': ('nombre', 'apellidopaterno', 'apellidomaterno', 'telefono')}),
        (_('Seguridad'), {'fields': ('preguntasecreta', 'respuestasecreta')}),
        (_('Autenticación Google'), {'fields': ('google_id', 'is_google_user')}),
        (_('Permisos'), {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        (_('Fechas'), {'fields': ('date_joined', 'last_login')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2'),
        }),
    )

    readonly_fields = ['date_joined', 'last_login']


@admin.register(Codigo2FA)
class Codigo2FAAdmin(admin.ModelAdmin):
    """Configuración del admin para el modelo Codigo2FA"""

    list_display = ['email', 'tipo', 'codigo', 'intentos', 'max_intentos', 'verificado', 'expira_en', 'creado_en']
    list_filter = ['tipo', 'verificado', 'creado_en', 'expira_en']
    search_fields = ['email', 'temp_token', 'codigo']
    ordering = ['-creado_en']
    readonly_fields = ['creado_en', 'actualizado_en']

    fieldsets = (
        ('Información del Código', {
            'fields': ('email', 'codigo', 'tipo', 'temp_token')
        }),
        ('Control de Verificación', {
            'fields': ('intentos', 'max_intentos', 'verificado', 'expira_en')
        }),
        ('Datos Temporales', {
            'fields': ('temp_data',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('creado_en', 'actualizado_en'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SesionUsuario)
class SesionUsuarioAdmin(admin.ModelAdmin):
    """Configuración del admin para el modelo SesionUsuario"""

    list_display = ['usuario', 'session_key_short', 'ip_address', 'creada_en', 'ultima_actividad', 'esta_activa']
    list_filter = ['creada_en', 'ultima_actividad']
    search_fields = ['usuario__email', 'session_key', 'ip_address']
    ordering = ['-ultima_actividad']
    readonly_fields = ['creada_en', 'ultima_actividad']

    def session_key_short(self, obj):
        """Muestra solo los primeros 10 caracteres del session_key"""
        return f"{obj.session_key[:10]}..." if obj.session_key else ""
    session_key_short.short_description = 'Session Key'

    def esta_activa(self, obj):
        """Muestra si la sesión está activa"""
        return obj.esta_activa()
    esta_activa.boolean = True
    esta_activa.short_description = 'Activa'

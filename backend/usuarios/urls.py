"""
URLs para la app usuarios
"""
from django.urls import path
from . import views

app_name = 'usuarios'

urlpatterns = [
    # CSRF Token
    path('csrf/', views.obtener_csrf_token, name='csrf'),

    # Registro (2 pasos con 2FA)
    path('register/', views.registro_paso1, name='registro_paso1'),
    path('register/2fa/verificar/', views.registro_paso2_verificar, name='registro_paso2'),

    # Login (2 pasos con 2FA)
    path('login/', views.login_paso1, name='login_paso1'),
    path('login/2fa/verificar/', views.login_paso2_verificar, name='login_paso2'),

    # Login con Google OAuth
    path('login/google/', views.login_con_google, name='login_google'),

    # Recuperación de contraseña
    path('recuperar/', views.recuperar_contrasena_paso1, name='recuperar_paso1'),
    path('restablecer/', views.restablecer_contrasena, name='restablecer'),

    # Cerrar sesión
    path('logout/', views.cerrar_sesion, name='logout'),
]

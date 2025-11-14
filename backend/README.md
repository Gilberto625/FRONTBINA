# 🔐 Backend Django - Sistema de Autenticación 2FA + Google OAuth

Backend completo en Django con:
- ✅ **Autenticación doble factor (2FA)** por email
- ✅ **Login con Google OAuth** (Firebase)
- ✅ **Registro con verificación 2FA**
- ✅ **Recuperación de contraseña** con pregunta secreta
- ✅ **PostgreSQL** como base de datos
- ✅ **CORS y CSRF** configurados
- ✅ **Listo para desplegar en Render**

---

## 📋 **REQUISITOS PREVIOS**

- Python 3.11+
- PostgreSQL 14+
- Cuenta de Gmail con App Password (para envío de emails)
- Proyecto de Firebase configurado (para Google OAuth)

---

## 🚀 **INSTALACIÓN LOCAL**

### 1. Clonar repositorio

```bash
cd backend
```

### 2. Crear entorno virtual

```bash
python -m venv venv

# En Linux/Mac
source venv/bin/activate

# En Windows
venv\Scripts\activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 4. Configurar PostgreSQL

```bash
# Crear base de datos
psql -U postgres
CREATE DATABASE backend_db;
CREATE USER backend_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE backend_db TO backend_user;
\q
```

### 5. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto backend:

```env
# Django Settings
SECRET_KEY=tu-clave-secreta-muy-segura-aqui
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database PostgreSQL
DB_NAME=backend_db
DB_USER=backend_user
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432

# CORS & CSRF Settings
CORS_ALLOWED_ORIGINS=http://localhost:4200
CSRF_TRUSTED_ORIGINS=http://localhost:4200

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password-de-16-digitos
DEFAULT_FROM_EMAIL=tu-email@gmail.com

# Firebase
FIREBASE_PROJECT_ID=auth-backend-tu-nombre
```

#### 📧 **Configurar Gmail App Password**

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad > Verificación en dos pasos (actívala si no está activa)
3. Busca "Contraseñas de aplicaciones"
4. Genera una nueva contraseña para "Correo"
5. Copia el password de 16 dígitos y úsalo en `EMAIL_HOST_PASSWORD`

### 6. Ejecutar migraciones

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Crear superusuario (opcional)

```bash
python manage.py createsuperuser
```

### 8. Ejecutar servidor de desarrollo

```bash
python manage.py runserver
```

El backend estará disponible en: **http://localhost:8000**

---

## 🎯 **ENDPOINTS DISPONIBLES**

### **CSRF Token**
```
GET /api/usuarios/csrf/
```

### **Registro (2 pasos)**
```
POST /api/usuarios/register/
POST /api/usuarios/register/2fa/verificar/
```

### **Login con Email/Password (2 pasos)**
```
POST /api/usuarios/login/
POST /api/usuarios/login/2fa/verificar/
```

### **Login con Google OAuth**
```
POST /api/usuarios/login/google/
```

### **Recuperación de Contraseña**
```
POST /api/usuarios/recuperar/
POST /api/usuarios/restablecer/
```

### **Cerrar Sesión**
```
POST /api/usuarios/logout/
```

---

## 📊 **ESTRUCTURA DEL PROYECTO**

```
backend/
├── config/
│   ├── __init__.py
│   ├── settings.py          # Configuración principal
│   ├── urls.py              # URLs principales
│   ├── wsgi.py
│   └── asgi.py
├── usuarios/
│   ├── models.py            # Modelos: Usuario, Codigo2FA, SesionUsuario
│   ├── views.py             # Vistas/Endpoints
│   ├── urls.py              # URLs de la app
│   ├── admin.py             # Configuración del admin
│   ├── utils.py             # Utilidades (email, 2FA, Firebase)
│   └── migrations/
├── manage.py
├── requirements.txt         # Dependencias
├── .env.example             # Ejemplo de variables de entorno
├── .gitignore
├── build.sh                 # Script de build para Render
├── runtime.txt              # Versión de Python
└── render.yaml              # Configuración para Render
```

---

## 🔐 **MODELOS DE DATOS**

### **Usuario**
- email (único)
- username (único)
- nombre, apellidopaterno, apellidomaterno
- telefono
- preguntasecreta, respuestasecreta
- google_id (para usuarios de Google)
- is_google_user
- is_active, is_staff, is_superuser

### **Codigo2FA**
- email
- codigo (6 dígitos)
- tipo (registro, login, recuperacion)
- temp_token (único)
- temp_data (JSON)
- intentos, max_intentos
- expira_en
- verificado

### **SesionUsuario** (opcional)
- usuario (ForeignKey)
- session_key
- ip_address
- user_agent
- expira_en

---

## 🔄 **FLUJO DE AUTENTICACIÓN**

### **1. Registro**
1. Usuario envía datos → `POST /api/usuarios/register/`
2. Backend valida datos, genera código 2FA, envía email
3. Backend retorna `tempToken`
4. Usuario ingresa código → `POST /api/usuarios/register/2fa/verificar/`
5. Backend verifica código y crea usuario

### **2. Login con Email/Password**
1. Usuario envía credenciales → `POST /api/usuarios/login/`
2. Backend valida credenciales, genera código 2FA, envía email
3. Backend retorna `tempToken`
4. Usuario ingresa código → `POST /api/usuarios/login/2fa/verificar/`
5. Backend verifica código e inicia sesión

### **3. Login con Google**
1. Usuario se autentica con Firebase en el frontend
2. Frontend envía `idToken` → `POST /api/usuarios/login/google/`
3. Backend verifica token con Firebase Admin SDK
4. Backend crea o busca usuario y inicia sesión

### **4. Recuperación de Contraseña**
1. Usuario envía email + pregunta/respuesta → `POST /api/usuarios/recuperar/`
2. Backend valida, genera código 2FA, envía email
3. Backend retorna `tempToken`
4. Usuario ingresa nueva contraseña → `POST /api/usuarios/restablecer/`
5. Backend actualiza contraseña

---

## 🌐 **DESPLIEGUE EN RENDER**

### **Opción 1: Usando render.yaml (Recomendado)**

1. Sube el código a GitHub
2. Ve a [Render.com](https://render.com)
3. Click en "New" → "Blueprint"
4. Conecta tu repositorio
5. Render detectará automáticamente `render.yaml`
6. Configura las variables de entorno:
   - `EMAIL_HOST_USER`
   - `EMAIL_HOST_PASSWORD`
   - `ALLOWED_HOSTS` (tu-app.onrender.com)
   - `CORS_ALLOWED_ORIGINS` (URL de tu frontend)
   - `CSRF_TRUSTED_ORIGINS` (URL de tu frontend)
   - `FIREBASE_PROJECT_ID`
7. Click en "Apply"

### **Opción 2: Manual**

1. Ve a [Render.com](https://render.com)
2. Crea una **PostgreSQL Database**
   - Nombre: `backend-db`
   - Guarda la **Internal Database URL**

3. Crea un **Web Service**
   - Conecta tu repositorio
   - Root Directory: `backend`
   - Build Command: `./build.sh`
   - Start Command: `gunicorn config.wsgi:application`
   - Environment: `Python 3`

4. Configura **Environment Variables**:
   ```
   SECRET_KEY=genera-una-clave-secreta-segura
   DEBUG=False
   ALLOWED_HOSTS=tu-app.onrender.com
   DATABASE_URL=<internal-database-url-de-render>
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=tu-email@gmail.com
   EMAIL_HOST_PASSWORD=tu-app-password
   DEFAULT_FROM_EMAIL=tu-email@gmail.com
   CORS_ALLOWED_ORIGINS=https://tu-frontend.com
   CSRF_TRUSTED_ORIGINS=https://tu-frontend.com
   FIREBASE_PROJECT_ID=tu-proyecto-firebase
   ```

5. Click en "Create Web Service"

### **Post-despliegue**

1. Ejecuta las migraciones (se ejecutan automáticamente con `build.sh`)
2. Crea un superusuario manualmente (si es necesario):
   ```bash
   # En el shell de Render
   python manage.py createsuperuser
   ```

3. Verifica que el backend funcione:
   ```
   https://tu-app.onrender.com/api/usuarios/csrf/
   ```

---

## 🔧 **COMANDOS ÚTILES**

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar servidor
python manage.py runserver

# Colectar archivos estáticos
python manage.py collectstatic

# Abrir shell de Django
python manage.py shell

# Ver URLs disponibles
python manage.py show_urls  # (requiere django-extensions)
```

---

## 🧪 **TESTING**

### **Probar endpoints con cURL**

#### 1. Obtener CSRF Token
```bash
curl -X GET http://localhost:8000/api/usuarios/csrf/
```

#### 2. Registrar usuario
```bash
curl -X POST http://localhost:8000/api/usuarios/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellidopaterno": "Pérez",
    "apellidomaterno": "García",
    "username": "juanperez",
    "correo": "juan@example.com",
    "contrasena": "Password123!",
    "telefono": "5512345678",
    "preguntasecreta": "¿Color favorito?",
    "respuestasecreta": "Azul"
  }'
```

---

## 🐛 **TROUBLESHOOTING**

### Error: "CSRF token missing"
**Solución**: Asegúrate de obtener el CSRF token primero y enviarlo en el header `X-CSRFToken`.

### Error: "Email not sent"
**Solución**:
- Verifica que `EMAIL_HOST_USER` y `EMAIL_HOST_PASSWORD` sean correctos
- Usa App Password de Gmail, no tu contraseña normal
- Verifica que la verificación en 2 pasos esté activa en Google

### Error: "Connection to database failed"
**Solución**:
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `.env`
- Asegúrate de haber creado la base de datos

### Error: "Firebase token invalid"
**Solución**:
- Verifica que `FIREBASE_PROJECT_ID` sea correcto
- En producción, necesitas configurar credenciales completas de Firebase Admin SDK

---

## 📱 **SEGURIDAD IMPLEMENTADA**

1. **Autenticación 2FA**: Códigos de 6 dígitos con expiración de 5 minutos
2. **Límite de intentos**: Máximo 5 intentos por código
3. **CSRF Protection**: Tokens CSRF en todas las peticiones que modifican datos
4. **CORS**: Configurado para permitir solo orígenes autorizados
5. **Password Hashing**: Contraseñas hasheadas con bcrypt
6. **Session Security**: Cookies HTTP-only y Secure en producción
7. **SQL Injection Protection**: ORM de Django previene inyecciones
8. **XSS Protection**: Headers de seguridad configurados

---

## 📞 **SOPORTE Y CONTACTO**

Para problemas o preguntas:
1. Verifica los logs del servidor
2. Revisa la configuración de variables de entorno
3. Consulta la documentación de Django: https://docs.djangoproject.com/

---

## 📄 **LICENCIA**

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**Desarrollado con Django 4.2 + PostgreSQL + Firebase** 🚀

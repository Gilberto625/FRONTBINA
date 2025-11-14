# 🚀 INSTRUCCIONES DE CONFIGURACIÓN Y DESPLIEGUE

## ✅ TRABAJO COMPLETADO

Se ha reconstruido completamente el backend Django con todas las características solicitadas:

### **Backend Django (carpeta `backend/`)**
- ✅ **Autenticación 2FA** por email (códigos de 6 dígitos)
- ✅ **Login con Google OAuth** usando Firebase
- ✅ **Registro con verificación 2FA**
- ✅ **Recuperación de contraseña** con pregunta secreta
- ✅ **Base de datos PostgreSQL**
- ✅ **CORS y CSRF** configurados
- ✅ **Archivos listos para Render** (build.sh, render.yaml, runtime.txt)

### **Frontend Angular (carpeta `src/`)**
- ✅ **Componente de recuperación de contraseña** (forgot-password)
- ✅ **Componente de restablecer contraseña** (reset-password)
- ✅ **Enlace de recuperación** en la página de login
- ✅ **Rutas configuradas** para los nuevos componentes

---

## 📋 PASOS PARA CONFIGURAR EL BACKEND

### **1. Configurar Gmail para envío de emails**

El backend necesita enviar códigos 2FA por email. Configura una cuenta de Gmail:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. **Seguridad** → Activa **Verificación en dos pasos**
3. Busca **Contraseñas de aplicaciones**
4. Genera una nueva contraseña para "Correo"
5. Copia el password de 16 dígitos (ejemplo: `abcd efgh ijkl mnop`)

### **2. Configurar Firebase para Google OAuth**

Ya tienes Firebase configurado en el frontend, pero necesitas:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Ve a **Project Settings** (ícono de engranaje)
3. En la sección **Service accounts**, genera una nueva clave privada
4. Descarga el archivo JSON con las credenciales

**Nota:** Para desarrollo local, puedes omitir esto temporalmente. Para producción, necesitas las credenciales completas.

### **3. Instalar PostgreSQL localmente (desarrollo)**

```bash
# En Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# En macOS con Homebrew
brew install postgresql
brew services start postgresql

# En Windows
# Descarga el instalador desde: https://www.postgresql.org/download/windows/
```

Crear base de datos:
```bash
# Acceder a PostgreSQL
psql -U postgres

# Dentro de psql
CREATE DATABASE backend_db;
CREATE USER backend_user WITH PASSWORD 'tu_password';
GRANT ALL PRIVILEGES ON DATABASE backend_db TO backend_user;
\q
```

### **4. Configurar el backend localmente**

```bash
# Ir a la carpeta del backend
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Linux/Mac:
source venv/bin/activate
# En Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Crear archivo .env
cp .env.example .env
```

Editar el archivo `.env` con tus configuraciones:

```env
# Django Settings
SECRET_KEY=genera-una-clave-secreta-aqui
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
EMAIL_HOST_PASSWORD=abcd efgh ijkl mnop  # Tu App Password de Gmail
DEFAULT_FROM_EMAIL=tu-email@gmail.com

# Firebase
FIREBASE_PROJECT_ID=auth-backend-tu-nombre
```

Ejecutar migraciones:
```bash
python manage.py makemigrations
python manage.py migrate

# Crear superusuario (opcional)
python manage.py createsuperuser

# Ejecutar servidor
python manage.py runserver
```

El backend estará en: **http://localhost:8000**

---

## 🌐 DESPLIEGUE EN RENDER

### **Opción 1: Usando Blueprint (Automático - RECOMENDADO)**

1. Ve a [Render.com](https://render.com) y crea una cuenta
2. Click en **"New"** → **"Blueprint"**
3. Conecta tu repositorio de GitHub
4. Render detectará automáticamente `render.yaml`
5. Configura las **variables de entorno**:

```
SECRET_KEY=genera-clave-segura-aqui
DEBUG=False
ALLOWED_HOSTS=tu-app.onrender.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=tu-email@gmail.com
EMAIL_HOST_PASSWORD=tu-app-password-gmail
DEFAULT_FROM_EMAIL=tu-email@gmail.com
CORS_ALLOWED_ORIGINS=https://tu-frontend.vercel.app
CSRF_TRUSTED_ORIGINS=https://tu-frontend.vercel.app
FIREBASE_PROJECT_ID=auth-backend-tu-nombre
```

6. Click en **"Apply"**
7. Render creará automáticamente:
   - Base de datos PostgreSQL
   - Web Service del backend
   - Configurará DATABASE_URL automáticamente

### **Opción 2: Manual**

#### Paso 1: Crear base de datos PostgreSQL
1. En Render Dashboard → **"New"** → **"PostgreSQL"**
2. Nombre: `backend-db`
3. Plan: Free
4. Crear database
5. **Guardar la "Internal Database URL"**

#### Paso 2: Crear Web Service
1. **"New"** → **"Web Service"**
2. Conectar tu repositorio
3. Configuración:
   - **Name:** `backend-django`
   - **Region:** Oregon (o el más cercano)
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `./build.sh`
   - **Start Command:** `gunicorn config.wsgi:application`

4. Environment Variables (mismas que arriba + DATABASE_URL)

5. Click en **"Create Web Service"**

### **Verificar despliegue**

Después de desplegar, prueba:
```
https://tu-app.onrender.com/api/usuarios/csrf/
```

Deberías ver un JSON con el CSRF token.

---

## 🔗 CONECTAR FRONTEND AL BACKEND

### **En desarrollo local**

El frontend ya está configurado para apuntar a:
- Local: `http://localhost:8000/api/usuarios`

### **En producción**

Actualiza `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://tu-backend.onrender.com/api/usuarios',

  firebase: {
    // Tus credenciales de Firebase
  }
};
```

---

## 🧪 PROBAR EL SISTEMA COMPLETO

### **Flujo de registro:**
1. Ir a `/register`
2. Completar formulario
3. Recibir código por email
4. Verificar código en `/verify-2fa`
5. Usuario creado ✅

### **Flujo de login:**
1. Ir a `/login`
2. Ingresar email/password
3. Recibir código por email
4. Verificar código en `/verify-2fa`
5. Sesión iniciada ✅

### **Flujo de login con Google:**
1. Ir a `/login`
2. Click en "Iniciar con Google"
3. Seleccionar cuenta de Google
4. Sesión iniciada automáticamente ✅

### **Flujo de recuperación:**
1. Ir a `/login`
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresar email + pregunta/respuesta secreta
4. Ingresar nueva contraseña en `/reset-password`
5. Contraseña actualizada ✅

---

## 📊 ENDPOINTS DEL BACKEND

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/usuarios/csrf/` | GET | Obtener CSRF token |
| `/api/usuarios/register/` | POST | Registrar usuario (paso 1) |
| `/api/usuarios/register/2fa/verificar/` | POST | Verificar 2FA registro (paso 2) |
| `/api/usuarios/login/` | POST | Login (paso 1) |
| `/api/usuarios/login/2fa/verificar/` | POST | Verificar 2FA login (paso 2) |
| `/api/usuarios/login/google/` | POST | Login con Google |
| `/api/usuarios/recuperar/` | POST | Recuperar contraseña (paso 1) |
| `/api/usuarios/restablecer/` | POST | Restablecer contraseña (paso 2) |
| `/api/usuarios/logout/` | POST | Cerrar sesión |

---

## 🔐 SEGURIDAD IMPLEMENTADA

1. **2FA con códigos temporales** (expiran en 5 minutos)
2. **Máximo 5 intentos** por código
3. **CSRF Protection** en todas las peticiones
4. **CORS** configurado para orígenes autorizados
5. **Contraseñas hasheadas** con bcrypt
6. **Cookies HTTP-only** y Secure en producción
7. **Validación de datos** en backend y frontend
8. **Tokens temporales** únicos para cada operación

---

## 📝 NOTAS IMPORTANTES

1. **Gmail App Password:** NO uses tu contraseña normal de Gmail, usa el App Password de 16 dígitos
2. **Firebase:** Para producción, necesitas configurar las credenciales completas del Service Account
3. **CORS:** Asegúrate de actualizar `CORS_ALLOWED_ORIGINS` con la URL real de tu frontend
4. **Render Free Tier:** El backend puede tardar 30-60 segundos en iniciar después de estar inactivo
5. **Migraciones:** Se ejecutan automáticamente en Render gracias a `build.sh`

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Email not sent"
- Verifica que EMAIL_HOST_USER y EMAIL_HOST_PASSWORD sean correctos
- Usa App Password de Gmail, no tu contraseña normal
- Verifica que la verificación en 2 pasos esté activa

### Error: "CORS policy blocking"
- Verifica CORS_ALLOWED_ORIGINS en el backend
- Asegúrate de incluir la URL completa del frontend

### Error: "Database connection failed"
- En Render, verifica que DATABASE_URL esté configurado
- En local, verifica que PostgreSQL esté corriendo

### Backend tarda en responder en Render
- Es normal en el Free Tier, espera 30-60 segundos
- Considera upgrade a plan pagado para mejor rendimiento

---

## 📚 DOCUMENTACIÓN COMPLETA

Consulta el archivo `backend/README.md` para documentación detallada del backend.

---

## ✅ CHECKLIST FINAL

Antes de considerar el proyecto completo:

- [ ] Backend desplegado en Render
- [ ] Frontend desplegado (Vercel, Netlify, etc.)
- [ ] Variables de entorno configuradas correctamente
- [ ] Gmail App Password configurado
- [ ] Firebase configurado para Google OAuth
- [ ] Probado flujo de registro completo
- [ ] Probado flujo de login con 2FA
- [ ] Probado login con Google
- [ ] Probado recuperación de contraseña
- [ ] CORS configurado correctamente
- [ ] Emails de 2FA llegando correctamente

---

**¡El backend está completo y listo para usar!** 🎉

Para cualquier duda, consulta:
- `backend/README.md` - Documentación del backend
- `README_INSTRUCCIONES.md` - Documentación del frontend

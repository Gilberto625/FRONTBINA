# Configuración de Firebase para Vercel

## Problema: Error "auth/internal-error" en login con Google

Este error generalmente ocurre cuando el dominio de Vercel no está autorizado en Firebase Console.

## Solución: Autorizar el dominio en Firebase

### Pasos:

1. **Accede a Firebase Console**
   - Ve a: https://console.firebase.google.com/
   - Selecciona tu proyecto: `auth-backend-tu-nombre`

2. **Ve a Authentication → Settings**
   - En el menú lateral, haz clic en "Authentication"
   - Luego haz clic en "Settings" (Configuración)

3. **Agrega dominios autorizados**
   - Desplázate hasta la sección "Authorized domains" (Dominios autorizados)
   - Haz clic en "Add domain" (Agregar dominio)
   - Agrega los siguientes dominios:
     - `frontbina.vercel.app`
     - `*.vercel.app` (para incluir todos los subdominios de Vercel)
     - `localhost` (si aún no está, para desarrollo local)

4. **Guarda los cambios**
   - Haz clic en "Add" para cada dominio
   - Los cambios se aplican inmediatamente

### Dominios que deben estar autorizados:

- ✅ `localhost` (desarrollo local)
- ✅ `frontbina.vercel.app` (producción)
- ✅ `*.vercel.app` (todos los preview deployments de Vercel)

### Verificación:

Después de agregar los dominios, espera unos minutos y prueba nuevamente el login con Google. El error debería desaparecer.

## Nota sobre CSP (Content Security Policy)

El archivo `vercel.json` ya está configurado con un CSP que permite todas las conexiones necesarias de Firebase:

- `connect-src` incluye: `*.googleapis.com`, `*.firebaseapp.com`, `*.firebaseio.com`, `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`, `oauth2.googleapis.com`, `accounts.google.com`
- `frame-src` incluye: `*.firebaseapp.com`, `accounts.google.com`, `www.google.com`
- `script-src` incluye: `*.googleapis.com`, `*.firebaseapp.com`

Si después de autorizar el dominio aún hay problemas, verifica la consola del navegador para ver si hay errores de CSP.

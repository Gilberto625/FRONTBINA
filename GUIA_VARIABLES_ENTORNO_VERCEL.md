# 🔐 Guía: Variables de Entorno para Vercel

## 📋 Información Importante

En Angular, las variables de entorno se compilan en tiempo de build, no en tiempo de ejecución. Esto significa que necesitas configurarlas antes de hacer el build.

## 🎯 Opción 1: Usar archivos environment (Recomendado)

Los archivos `environment.ts` y `environment.prod.ts` ya están configurados. Solo necesitas actualizar los valores:

### Archivos a modificar:

1. **`src/environments/environment.ts`** - Para desarrollo local
2. **`src/environments/environment.prod.ts`** - Para producción (Vercel)

### Valores actuales en `environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://backendbina-1.onrender.com/api/usuarios',
  
  firebase: {
    apiKey: "AIzaSyAJ0Om_GyOwpAgJoaQc7g1oplyGx7g70LQ",
    authDomain: "auth-backend-tu-nombre.firebaseapp.com",
    projectId: "auth-backend-tu-nombre",
    storageBucket: "auth-backend-tu-nombre.firebasestorage.app",
    messagingSenderId: "370925550099",
    appId: "1:370925550099:web:ebfdea93f12c7b01435de6"
  }
};
```

## 🔧 Opción 2: Usar variables de entorno de Vercel (Avanzado)

Si quieres usar variables de entorno de Vercel, necesitas un script de build personalizado:

### Paso 1: Crear script de build

Crea un archivo `scripts/replace-env.js`:

```javascript
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '../src/environments/environment.prod.ts');
const envContent = `export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL || 'https://backendbina-1.onrender.com/api/usuarios'}',
  
  firebase: {
    apiKey: "${process.env.FIREBASE_API_KEY || ''}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || ''}",
    projectId: "${process.env.FIREBASE_PROJECT_ID || ''}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || ''}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || ''}",
    appId: "${process.env.FIREBASE_APP_ID || ''}"
  }
};`;

fs.writeFileSync(envFile, envContent);
console.log('✅ Environment file updated');
```

### Paso 2: Actualizar package.json

```json
{
  "scripts": {
    "build": "node scripts/replace-env.js && ng build --configuration production"
  }
}
```

### Paso 3: Configurar en Vercel

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** > **Environment Variables**
4. Agrega las siguientes variables:

```
API_URL=https://backendbina-1.onrender.com/api/usuarios
FIREBASE_API_KEY=AIzaSyAJ0Om_GyOwpAgJoaQc7g1oplyGx7g70LQ
FIREBASE_AUTH_DOMAIN=auth-backend-tu-nombre.firebaseapp.com
FIREBASE_PROJECT_ID=auth-backend-tu-nombre
FIREBASE_STORAGE_BUCKET=auth-backend-tu-nombre.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=370925550099
FIREBASE_APP_ID=1:370925550099:web:ebfdea93f12c7b01435de6
```

## ✅ Recomendación: Usar Opción 1 (Más Simple)

Para este proyecto, **recomiendo usar la Opción 1** porque:

1. ✅ Es más simple y directo
2. ✅ No requiere scripts adicionales
3. ✅ Los valores ya están configurados
4. ✅ Solo necesitas actualizar los valores de Firebase si son diferentes

## 🔑 Dónde obtener los valores de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Configuración del proyecto** (⚙️)
4. En la sección "Tus apps", busca tu app web o crea una nueva
5. Copia los valores de configuración

## 📝 Valores que necesitas actualizar

En `src/environments/environment.prod.ts`, actualiza:

- ✅ `apiUrl` - Ya está configurado con tu backend de Render
- ⚠️ `firebase.apiKey` - Obtener de Firebase Console
- ⚠️ `firebase.authDomain` - Obtener de Firebase Console
- ⚠️ `firebase.projectId` - Obtener de Firebase Console
- ⚠️ `firebase.storageBucket` - Obtener de Firebase Console
- ⚠️ `firebase.messagingSenderId` - Obtener de Firebase Console
- ⚠️ `firebase.appId` - Obtener de Firebase Console

## 🚀 Desplegar en Vercel

1. Conecta tu repositorio de GitHub a Vercel
2. Vercel detectará automáticamente que es un proyecto Angular
3. El archivo `vercel.json` ya está configurado
4. Vercel usará `environment.prod.ts` automáticamente en producción
5. ¡Listo! Tu app se desplegará

## 📌 Nota Importante

- Los valores en `environment.ts` se usan en desarrollo local
- Los valores en `environment.prod.ts` se usan en producción (Vercel)
- Asegúrate de que ambos archivos tengan los valores correctos



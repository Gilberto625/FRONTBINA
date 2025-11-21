# 🚀 Guía de Despliegue en Vercel

## 📋 Resumen

Este proyecto Angular está configurado para desplegarse en Vercel. Las variables de entorno están en los archivos `environment.ts` y `environment.prod.ts`.

## 🔧 Configuración Actual

### Variables de Entorno (Ya configuradas)

**Archivo:** `src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://stylo-barber-backend.onrender.com/api/usuarios',
  
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

## 📝 Pasos para Desplegar

### 1. Verificar Configuración de Firebase

Antes de desplegar, asegúrate de que los valores de Firebase en `environment.prod.ts` sean correctos:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Configuración del proyecto** (⚙️)
4. En "Tus apps", copia los valores de configuración
5. Actualiza `src/environments/environment.prod.ts` con tus valores

### 2. Conectar con Vercel

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **Add New Project**
3. Conecta tu repositorio de GitHub
4. Vercel detectará automáticamente que es Angular

### 3. Configuración de Build (Ya configurada)

El archivo `vercel.json` ya está configurado:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/frontend-angular/browser",
  "framework": "angular"
}
```

### 4. Variables de Entorno en Vercel (Opcional)

**NOTA:** En Angular, las variables de entorno se compilan en tiempo de build. Si quieres usar variables de Vercel, necesitas un script personalizado (ver `GUIA_VARIABLES_ENTORNO_VERCEL.md`).

**Recomendación:** Simplemente actualiza los valores en `environment.prod.ts` antes de hacer commit.

### 5. Desplegar

1. Haz commit y push de tus cambios
2. Vercel desplegará automáticamente
3. O haz click en **Deploy** en el dashboard de Vercel

## ✅ Checklist Pre-Despliegue

- [ ] Verificar que `environment.prod.ts` tiene los valores correctos de Firebase
- [ ] Verificar que `apiUrl` apunta a tu backend de Render
- [ ] Verificar que `production: true` en `environment.prod.ts`
- [ ] Verificar que `production: false` en `environment.ts` (para desarrollo)
- [ ] Hacer commit de los cambios
- [ ] Conectar repositorio con Vercel
- [ ] Desplegar

## 🔗 URLs Importantes

- **Backend:** https://stylo-barber-backend.onrender.com
- **API Base:** https://stylo-barber-backend.onrender.com/api/usuarios
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Firebase Console:** https://console.firebase.google.com/

## 📌 Notas

- Vercel usará automáticamente `environment.prod.ts` cuando `production: true`
- No necesitas configurar variables de entorno en Vercel si usas los archivos environment
- El archivo `vercel.json` ya está configurado correctamente
- El build output está en `dist/frontend-angular/browser`



# 🔧 Solución: Error de Build en Vercel

## ❌ Problema

El build falla en Vercel con el error:
```
Command "npm run build" exited with 1
```

---

## ✅ Soluciones Comunes

### SOLUCIÓN 1: Verificar Output Directory

El `outputDirectory` en `vercel.json` debe coincidir con el `outputPath` en `angular.json`.

**Verificar en `angular.json`:**
```json
"outputPath": "dist/frontend-angular"
```

**Actualizar `vercel.json`:**
```json
{
  "outputDirectory": "dist/frontend-angular/browser"
}
```

**Nota:** En Angular 17+, el build genera archivos en `dist/frontend-angular/browser/`

---

### SOLUCIÓN 2: Agregar Node Version

Agrega la versión de Node.js en `vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/frontend-angular/browser",
  "env": {
    "NODE_VERSION": "18.x"
  }
}
```

O crea un archivo `.nvmrc` en la raíz:
```
18
```

---

### SOLUCIÓN 3: Verificar Variables de Entorno

En el dashboard de Vercel, verifica que no falten variables de entorno necesarias.

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Verifica que todas las variables necesarias estén configuradas

---

### SOLUCIÓN 4: Aumentar Límites de Budget

Si el error es por tamaño de bundle, ajusta los budgets en `angular.json`:

```json
"budgets": [
  {
    "type": "initial",
    "maximumWarning": "2mb",
    "maximumError": "5mb"
  },
  {
    "type": "anyComponentStyle",
    "maximumWarning": "6kb",
    "maximumError": "10kb"
  }
]
```

---

### SOLUCIÓN 5: Verificar Errores de TypeScript

Ejecuta localmente para ver el error exacto:

```bash
npm run build
```

Si hay errores de TypeScript, corrígelos antes de hacer push.

---

### SOLUCIÓN 6: Limpiar y Reinstalar

A veces el problema es con `node_modules`. En Vercel:

1. Ve a Settings → Build & Development Settings
2. Cambia `Install Command` a:
   ```
   rm -rf node_modules package-lock.json && npm install
   ```

O agrega un script de prebuild en `package.json`:

```json
{
  "scripts": {
    "prebuild": "rm -rf node_modules/.cache",
    "build": "ng build --configuration production"
  }
}
```

---

### SOLUCIÓN 7: Configuración Completa de vercel.json

Usa esta configuración completa:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist/frontend-angular/browser",
  "devCommand": "ng serve",
  "installCommand": "npm install",
  "framework": "angular",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## 🔍 Debugging

### Ver Logs Completos en Vercel

1. Ve a tu proyecto en Vercel
2. Deployments → Selecciona el deployment fallido
3. Ver los logs completos del build
4. Busca el error específico (TypeScript, dependencias, etc.)

### Probar Build Localmente

```bash
# Limpiar
rm -rf node_modules dist

# Reinstalar
npm install

# Build
npm run build
```

Si funciona localmente pero falla en Vercel, el problema es de configuración.

---

## 📋 Checklist

- [ ] `vercel.json` tiene el `outputDirectory` correcto
- [ ] `angular.json` tiene el `outputPath` correcto
- [ ] Versión de Node.js especificada (18.x o 20.x)
- [ ] No hay errores de TypeScript localmente
- [ ] `package.json` tiene el script `build` correcto
- [ ] Variables de entorno configuradas en Vercel
- [ ] Budgets ajustados si es necesario

---

## 🆘 Si Aún No Funciona

1. **Revisa los logs completos en Vercel** - Ahí está el error exacto
2. **Copia el error completo** y busca en Google
3. **Verifica que todas las dependencias estén en `package.json`**
4. **Prueba con una versión específica de Node.js** en `.nvmrc`

---

## 📝 Configuración Recomendada

### .nvmrc (crear en la raíz)
```
18
```

### vercel.json (actualizado)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/frontend-angular/browser",
  "installCommand": "npm install",
  "framework": "angular",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### package.json (verificar script)
```json
{
  "scripts": {
    "build": "ng build --configuration production"
  }
}
```


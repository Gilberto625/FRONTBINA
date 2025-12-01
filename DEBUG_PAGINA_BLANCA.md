# 🔍 Debug: Página en Blanco

## Problema

La aplicación Angular aparece completamente en blanco después del despliegue en Vercel.

## Posibles Causas

1. **CSP bloqueando scripts**: El Content-Security-Policy podría estar bloqueando scripts necesarios
2. **Firebase fallando**: La inicialización de Firebase podría estar fallando y bloqueando toda la app
3. **Errores de JavaScript**: Errores en la consola que impiden la carga
4. **Archivos estáticos no cargando**: Los archivos JS/CSS no se están sirviendo correctamente
5. **Problemas de compilación**: El build de Angular podría tener errores

## Soluciones Aplicadas

### 1. CSP más permisivo temporalmente

Agregado `'unsafe-inline'` al CSP para scripts:
```json
"script-src 'self' 'unsafe-inline' 'unsafe-eval' 'strict-dynamic' ..."
```

**Razón**: Angular puede necesitar scripts inline durante la inicialización.

### 2. Manejo de errores en Firebase

Firebase ahora tiene manejo de errores para no bloquear la aplicación si falla:
- Si Firebase falla, la app continúa con una instancia dummy
- Los errores se registran en la consola pero no bloquean la carga

### 3. Manejo de errores en main.ts

Agregado manejo de errores en `bootstrapApplication`:
- Si hay un error, se muestra un mensaje en la página
- Los errores se registran en la consola

## Pasos para Debug

### 1. Verificar en el Navegador

1. Abrir DevTools (F12)
2. Ir a la pestaña **Console**
3. Buscar errores en rojo
4. Ir a la pestaña **Network**
5. Verificar que los archivos JS se carguen correctamente (status 200)

### 2. Verificar Errores Comunes

**Error: "Refused to execute inline script"**
- Solución: Ya agregamos `'unsafe-inline'` al CSP

**Error: "Firebase: Error (auth/network-request-failed)"**
- Solución: Firebase ahora tiene manejo de errores

**Error: "Cannot find module"**
- Problema: Archivos no compilados correctamente
- Solución: Verificar el build en Vercel

**Error: "Failed to load resource"**
- Problema: Archivos estáticos no encontrados
- Solución: Verificar `outputDirectory` en `vercel.json`

### 3. Verificar Build en Vercel

1. Ir a Vercel Dashboard
2. Ver el log del último deployment
3. Buscar errores en el build
4. Verificar que `npm run build` se ejecute correctamente

### 4. Verificar Archivos Estáticos

1. Abrir DevTools → Network
2. Recargar la página
3. Verificar que estos archivos se carguen:
   - `main-*.js` (archivo principal de Angular)
   - `polyfills-*.js`
   - `styles-*.css`
   - `runtime-*.js`

Si alguno falla (status 404), hay un problema con la configuración de Vercel.

## Verificación de Configuración

### vercel.json

```json
{
  "outputDirectory": "dist/frontend-angular/browser"
}
```

**Verificar**: Que este directorio coincida con el output de `ng build`.

### angular.json

```json
{
  "outputPath": "dist/frontend-angular"
}
```

**Verificar**: Que el build genere archivos en `dist/frontend-angular/browser/`.

## Solución Temporal

Si el problema persiste, temporalmente podemos:

1. **Deshabilitar CSP completamente** (solo para debug):
   - Comentar la sección de CSP en `vercel.json`
   - Desplegar y verificar si funciona
   - Si funciona, el problema es el CSP

2. **Deshabilitar Firebase temporalmente**:
   - Comentar las líneas de Firebase en `app.config.ts`
   - Desplegar y verificar si funciona
   - Si funciona, el problema es Firebase

3. **Verificar build localmente**:
   ```bash
   npm run build
   cd dist/frontend-angular/browser
   # Servir con un servidor local y verificar
   ```

## Próximos Pasos

1. ✅ Agregado `'unsafe-inline'` al CSP
2. ✅ Mejorado manejo de errores en Firebase
3. ✅ Mejorado manejo de errores en main.ts
4. ⏳ Desplegar y verificar
5. ⏳ Revisar consola del navegador para errores específicos
6. ⏳ Si persiste, deshabilitar CSP temporalmente para debug

---

**Última actualización**: CSP más permisivo y mejor manejo de errores aplicados.


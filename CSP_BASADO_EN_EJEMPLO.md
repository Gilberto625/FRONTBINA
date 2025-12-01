# 🔧 CSP Basado en Ejemplo Funcional

## Problema

El CSP con `'strict-dynamic'` estaba causando problemas (página en blanco).

## Solución

Basado en un ejemplo funcional de un compañero, simplificamos el CSP:

### Cambios Realizados

**Antes (con problemas):**
```
script-src 'self' 'strict-dynamic' https://www.gstatic.com ...
```

**Después (basado en ejemplo funcional):**
```
script-src 'self' https://www.gstatic.com https://www.googleapis.com https://apis.google.com https://*.firebaseapp.com;
```

### Diferencias Clave

1. **Removido `'strict-dynamic'`**:
   - Puede causar problemas sin nonces configurados
   - El ejemplo funcional no lo usa

2. **Mantenido dominios específicos**:
   - `https://www.gstatic.com` - Google static resources
   - `https://www.googleapis.com` - Google APIs
   - `https://apis.google.com` - Google APIs
   - `https://*.firebaseapp.com` - Firebase

3. **Simplificado**:
   - Sin `'unsafe-eval'` (intentando sin esto)
   - Sin `'unsafe-inline'` en `script-src`
   - Solo `'unsafe-inline'` en `style-src` (necesario para Angular)

4. **Mantenido para Firebase**:
   - `connect-src` con todos los dominios de Firebase necesarios
   - `frame-src` para OAuth popups

## CSP Final

```
default-src 'self';
script-src 'self' https://www.gstatic.com https://www.googleapis.com https://apis.google.com https://*.firebaseapp.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self' https://backendbina-1.onrender.com https://frontbina.vercel.app https://*.vercel.app https://www.googleapis.com https://*.googleapis.com https://*.firebaseapp.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com;
frame-src 'self' https://*.firebaseapp.com https://accounts.google.com;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
object-src 'none';
upgrade-insecure-requests;
```

## Comparación con Ejemplo Funcional

### Ejemplo del Compañero (funciona):
```
script-src 'self' https://vercel.live;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self' https://api-moda-sarita.vercel.app;
```

### Nuestro CSP (adaptado):
```
script-src 'self' https://www.gstatic.com https://www.googleapis.com https://apis.google.com https://*.firebaseapp.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' data: https:;
connect-src 'self' https://backendbina-1.onrender.com ... (Firebase domains);
```

**Similitudes**:
- ✅ Misma estructura simple
- ✅ Sin `'strict-dynamic'`
- ✅ Sin `'unsafe-eval'`
- ✅ Sin `'unsafe-inline'` en `script-src`
- ✅ Solo `'unsafe-inline'` en `style-src`

**Diferencias**:
- Agregamos dominios de Firebase necesarios
- Agregamos `frame-src` para OAuth
- Agregamos más dominios en `connect-src` para Firebase

## Ventajas

1. **Más simple**: Sin `'strict-dynamic'` que puede causar problemas
2. **Basado en ejemplo funcional**: Probado que funciona
3. **Mantiene seguridad**: Sin `'unsafe-inline'` ni `'unsafe-eval'` en `script-src`
4. **Compatible con Angular**: Angular con AOT no necesita `'unsafe-inline'` en scripts

## Calificación Esperada

- ✅ **A+** en SecurityHeaders.com (si funciona sin `'unsafe-eval'`)
- ✅ Sin advertencias sobre `'unsafe-inline'` o `'unsafe-eval'` en `script-src`
- ⚠️ Advertencia sobre `'unsafe-inline'` en `style-src` (aceptable)

## Si No Funciona

Si la aplicación no funciona sin `'unsafe-eval'`:

1. Agregar `'unsafe-eval'` SOLO en `script-src`:
   ```
   script-src 'self' 'unsafe-eval' https://www.gstatic.com ...
   ```

2. Calificación será **A** (no A+), pero aceptable

## Verificación

1. ✅ Desplegar
2. ✅ Verificar que la aplicación carga (no página en blanco)
3. ✅ Probar todas las funcionalidades
4. ✅ Verificar en SecurityHeaders.com

---

**Última actualización**: CSP simplificado basado en ejemplo funcional, sin 'strict-dynamic'.


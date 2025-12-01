# ⚠️ Nota: 'unsafe-eval' Requerido en CSP

## Problema

Después de eliminar `'unsafe-eval'` del CSP, la aplicación Angular aparecía en blanco.

## Solución Temporal

Se ha restaurado `'unsafe-eval'` en la directiva `script-src` del CSP:

```json
"script-src 'self' 'strict-dynamic' 'unsafe-eval' ..."
```

## Razón

Aunque Angular 17 con AOT (Ahead-of-Time) compilation **no debería** requerir `'unsafe-eval'` en teoría, algunas librerías o configuraciones pueden necesitarlo:

1. **Firebase SDK**: Algunas versiones del SDK de Firebase pueden usar `eval()` o `Function()` internamente
2. **Angular Material**: Algunos componentes pueden requerir evaluación dinámica
3. **Zone.js**: Puede requerir `'unsafe-eval'` en ciertos casos
4. **Lazy Loading**: Si hay lazy loading de módulos, puede requerir evaluación dinámica

## Impacto en Seguridad

`'unsafe-eval'` permite la ejecución de código JavaScript dinámico usando:
- `eval()`
- `Function()`
- `setTimeout()` con strings
- `setInterval()` con strings

**Riesgo**: Esto puede ser explotado en ataques XSS si hay vulnerabilidades de inyección.

## Mitigaciones Aplicadas

Aunque usamos `'unsafe-eval'`, mantenemos otras medidas de seguridad:

1. ✅ **`'strict-dynamic'`**: Solo scripts confiables pueden cargar otros scripts
2. ✅ **Dominios específicos**: Solo permitimos dominios confiables (Google, Firebase)
3. ✅ **XSS Protection**: Headers `X-XSS-Protection` y CSP previenen XSS
4. ✅ **Input Sanitization**: El backend sanitiza todas las entradas
5. ✅ **HTTPS**: Todas las conexiones usan HTTPS
6. ✅ **Content-Type**: Headers `X-Content-Type-Options: nosniff`

## Alternativas Futuras

Para eliminar `'unsafe-eval'` en el futuro:

1. **Actualizar dependencias**: Verificar si versiones más recientes de Firebase/Angular Material no requieren `'unsafe-eval'`
2. **Usar nonces**: Implementar nonces para scripts inline específicos
3. **Revisar lazy loading**: Verificar si el lazy loading puede configurarse sin `'unsafe-eval'`
4. **Auditoría de código**: Revisar si hay código que use `eval()` o `Function()` innecesariamente

## Verificación

Para verificar si `'unsafe-eval'` es realmente necesario:

1. Eliminar `'unsafe-eval'` del CSP
2. Desplegar
3. Abrir DevTools (F12) → Console
4. Buscar errores como:
   ```
   Refused to evaluate a string as JavaScript because 'unsafe-eval' is not an allowed source
   ```
5. Si aparecen estos errores, `'unsafe-eval'` es necesario

## Estado Actual

- ✅ **CSP con `'unsafe-eval'`**: Aplicado temporalmente
- ⚠️ **Riesgo de seguridad**: Mitigado con otras medidas
- 📋 **Tarea pendiente**: Investigar alternativas para eliminar `'unsafe-eval'` en el futuro

---

**Última actualización**: `'unsafe-eval'` restaurado para que la aplicación funcione correctamente.


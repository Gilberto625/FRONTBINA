# 🔐 Selector de Cuenta Google - Siempre Mostrar

## Problema

Al hacer login con Google, si solo hay una cuenta de Google, no se muestra el selector de cuenta. El usuario quiere que siempre se muestre la opción de elegir cuenta o agregar una cuenta, incluso si solo hay una cuenta.

## ✅ Solución Implementada

### Configuración del GoogleAuthProvider

Agregado `setCustomParameters` con `prompt: 'select_account'` para forzar que siempre se muestre el selector de cuenta:

```typescript
const provider = new GoogleAuthProvider();

// Forzar selector de cuenta: siempre mostrar opción de elegir cuenta o agregar cuenta
// Incluso si solo hay una cuenta de Google
provider.setCustomParameters({
  prompt: 'select_account'  // Fuerza mostrar selector de cuenta
});

const result: UserCredential = await signInWithPopup(this.auth, provider);
```

## Comportamiento

### Antes
- Si hay una cuenta de Google → Se autentica automáticamente sin mostrar selector
- Si hay múltiples cuentas → Muestra selector

### Después
- Si hay una cuenta de Google → **Siempre muestra selector** con opción de elegir o agregar cuenta
- Si hay múltiples cuentas → Muestra selector (comportamiento normal)

## Opciones del Prompt

Firebase/Google OAuth soporta varios valores para `prompt`:

- `'select_account'` - **Usado**: Siempre muestra selector de cuenta
- `'consent'` - Fuerza mostrar pantalla de consentimiento
- `'none'` - No muestra ninguna pantalla (solo si ya está autenticado)
- `'login'` - Fuerza mostrar pantalla de login

## Beneficios

1. ✅ **Mejor UX**: Usuario siempre tiene control sobre qué cuenta usar
2. ✅ **Flexibilidad**: Puede agregar otra cuenta sin cerrar sesión primero
3. ✅ **Consistencia**: Mismo comportamiento siempre, sin importar cuántas cuentas haya
4. ✅ **Seguridad**: Usuario explícitamente elige la cuenta a usar

## Verificación

Después del despliegue:

1. Hacer clic en "Iniciar con Google"
2. Debe aparecer el selector de cuenta de Google
3. Debe mostrar opción de "Usar otra cuenta" o "Agregar cuenta"
4. Incluso si solo hay una cuenta, debe mostrar el selector

---

**Última actualización**: Selector de cuenta Google configurado para mostrarse siempre.



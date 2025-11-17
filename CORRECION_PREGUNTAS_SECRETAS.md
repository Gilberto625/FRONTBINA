# Corrección del Flujo de Recuperación por Preguntas Secretas

## Problema Identificado

El flujo de recuperación de contraseña por preguntas secretas tenía dos problemas principales:

### 1. Falta de Feedback Visual
- Cuando el usuario validaba la respuesta secreta, no se mostraba ningún mensaje indicando si la respuesta era correcta o incorrecta
- El usuario no sabía si debía esperar o si había ocurrido un error

### 2. Error de "Token Inválido"
- Al intentar cambiar la contraseña después de validar la pregunta secreta, aparecía el error "Token inválido"
- **Causa**: El backend usaba sesiones de Django (`request.session`) para almacenar el token temporal
- **Problema**: Las sesiones no persistían correctamente entre requests debido a la configuración CORS/CSRF

## Solución Implementada

### Backend (`backendbina/accounts/views.py`)

#### Cambios en `recuperar_contrasena()` (líneas 516-569)

**Antes:**
```python
# Generaba token UUID y lo guardaba en sesión
temp_token = str(uuid.uuid4())
request.session[temp_token] = {
    'email': usuario.email,
    'expira': (datetime.datetime.now() + datetime.timedelta(minutes=10)).timestamp(),
}
return JsonResponse({'ok': True, 'tempToken': temp_token})
```

**Después:**
```python
# Genera código de validación y lo guarda en el modelo Usuario
codigo_validacion = 'SECRET_OK_' + str(uuid.uuid4())[:8]
usuario.codigo_otp = codigo_validacion
usuario.otp_expira = timezone.now() + timedelta(minutes=10)
usuario.save()

return JsonResponse({
    'ok': True, 
    'tempToken': str(usuario.id),
    'message': 'Respuesta correcta. Ahora puedes cambiar tu contraseña.'
})
```

**Beneficios:**
- Usa el mismo sistema que el flujo de OTP (almacenamiento en modelo Usuario)
- Evita problemas de persistencia de sesiones
- El `tempToken` es el ID del usuario
- Retorna un mensaje de éxito para el frontend

#### Cambios en `restablecer_contrasena()` (líneas 571-646)

**Antes:**
```python
# Buscaba en sesión
session_data = request.session.get(temp_token)
if not session_data:
    return JsonResponse({'ok': False, 'error': 'Token inválido o expirado'})
```

**Después:**
```python
# Obtiene usuario por ID y verifica desde el modelo
try:
    usuario = Usuario.objects.get(id=temp_token)
except (Usuario.DoesNotExist, ValueError):
    return JsonResponse({'ok': False, 'error': 'Token inválido o expirado'})

# Verifica que el código de validación existe y no ha expirado
if not usuario.codigo_otp or not usuario.otp_expira:
    return JsonResponse({'ok': False, 'error': 'Token inválido o expirado. Solicita uno nuevo.'})

# Verifica que el código inicie con 'SECRET_OK_'
if not usuario.codigo_otp.startswith('SECRET_OK_'):
    return JsonResponse({'ok': False, 'error': 'Token inválido. Debes verificar la pregunta secreta primero.'})
```

**Beneficios:**
- Consistente con el flujo de OTP
- Verifica la validez del token desde la base de datos
- Valida que el usuario haya completado el paso previo (pregunta secreta)
- Maneja correctamente la expiración (10 minutos)

### Frontend (`FRONTBINA/src/app/components/forgot-password/forgot-password.component.ts`)

#### Cambios en `onSubmitAnswer()` (líneas 109-149)

**Antes:**
```typescript
this.authService.verificarRespuestaSecreta(this.userEmail, respuestaSecreta).subscribe({
  next: (response) => {
    this.loading = false;
    if (response.ok && response.tempToken) {
      localStorage.setItem('recoveryTempToken', response.tempToken);
      localStorage.setItem('recoveryEmail', this.userEmail);
      localStorage.setItem('recoveryMethod', 'secret');
      
      // Redirigía sin mostrar mensaje
      this.router.navigate(['/reset-password']);
    }
  },
  ...
});
```

**Después:**
```typescript
this.authService.verificarRespuestaSecreta(this.userEmail, respuestaSecreta).subscribe({
  next: (response) => {
    this.loading = false;
    if (response.ok && response.tempToken) {
      // Mostrar mensaje de éxito
      const successMsg = response.message || 'Respuesta correcta. Ahora puedes cambiar tu contraseña.';
      this.showSuccess(successMsg);
      
      localStorage.setItem('recoveryTempToken', response.tempToken);
      localStorage.setItem('recoveryEmail', this.userEmail);
      localStorage.setItem('recoveryMethod', 'secret');
      
      // Redirigir después de mostrar el mensaje
      setTimeout(() => {
        this.router.navigate(['/reset-password']);
      }, 1500);
    } else {
      this.showError('Error en la verificación. Intenta nuevamente.');
    }
  },
  ...
});
```

**Beneficios:**
- Muestra mensaje de éxito al usuario
- Espera 1.5 segundos antes de redirigir (para que el usuario vea el mensaje)
- Maneja el caso de error también

## Flujo Completo Corregido

### Flujo de Preguntas Secretas

1. **Usuario ingresa email** → Frontend hace POST a `/obtener-pregunta-secreta/`
2. **Backend retorna pregunta secreta** del usuario
3. **Usuario ingresa respuesta** → Frontend hace POST a `/recuperar/`
4. **Backend valida respuesta**:
   - Si es correcta: Guarda `codigo_otp = 'SECRET_OK_xxxxx'` en el usuario
   - Retorna `tempToken = usuario.id` y mensaje de éxito
5. **Frontend muestra mensaje de éxito** y redirige a `/reset-password`
6. **Usuario ingresa nueva contraseña** → Frontend hace POST a `/restablecer/`
7. **Backend verifica**:
   - Obtiene usuario por ID (tempToken)
   - Verifica que `codigo_otp` existe, empieza con 'SECRET_OK_' y no ha expirado
   - Cambia la contraseña y limpia el código de validación
8. **Contraseña actualizada con éxito**

### Consistencia con Flujo de OTP

Ahora ambos flujos (Preguntas Secretas y OTP) funcionan de manera consistente:

| Aspecto | Preguntas Secretas | OTP |
|---------|-------------------|-----|
| Almacenamiento | `Usuario.codigo_otp` | `Usuario.codigo_otp` |
| Token Temporal | `usuario.id` | `usuario.id` |
| Expiración | `Usuario.otp_expira` (10 min) | `Usuario.otp_expira` (10 min) |
| Validación | `codigo_otp.startswith('SECRET_OK_')` | `codigo_otp == codigo` |

## Testing

### Pasos para Probar

1. **Ir a Forgot Password**
2. **Seleccionar "Preguntas Secretas"**
3. **Ingresar email registrado**
4. **Ver pregunta secreta**
5. **Ingresar respuesta correcta**
   - ✅ Debe mostrar: "Respuesta correcta. Ahora puedes cambiar tu contraseña."
   - ✅ Debe redirigir a Reset Password
6. **Ingresar nueva contraseña**
   - ✅ Debe actualizar sin error de "token inválido"
   - ✅ Debe mostrar: "¡Contraseña actualizada exitosamente!"
   - ✅ Debe redirigir al login

### Casos de Error

1. **Respuesta incorrecta**: Muestra "Respuesta incorrecta"
2. **Token expirado (>10 min)**: Muestra "Token expirado. Solicita uno nuevo."
3. **Intentar cambiar contraseña sin validar pregunta**: Muestra "Token inválido"

## Archivos Modificados

1. `backendbina/accounts/views.py`
   - `recuperar_contrasena()` (líneas 516-569)
   - `restablecer_contrasena()` (líneas 571-646)

2. `FRONTBINA/src/app/components/forgot-password/forgot-password.component.ts`
   - `onSubmitAnswer()` (líneas 109-149)

## Notas Técnicas

- El código de validación usa el prefijo `'SECRET_OK_'` para distinguirlo de códigos OTP numéricos
- La expiración es de 10 minutos (consistente con OTP)
- El sistema ahora es independiente de las sesiones de Django
- Funciona correctamente con CORS/CSRF en entornos cross-origin (Vercel + Render)


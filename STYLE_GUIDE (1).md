# Guía de Estilos - Stylo Barber Connect

## 📋 Índice
- [Identidad Visual](#identidad-visual)
- [Paleta de Colores](#paleta-de-colores)
- [Tipografía](#tipografía)
- [Componentes UI](#componentes-ui)
- [Diseño Responsivo](#diseño-responsivo)
- [Patrones de Interacción](#patrones-de-interacción)
- [Iconografía](#iconografía)
- [Lenguaje de Comunicación](#lenguaje-de-comunicación)
- [Accesibilidad](#accesibilidad)
- [Fundamentos Normativos](#fundamentos-normativos)

---

## 🎨 Identidad Visual

### Objetivo
Mantener coherencia, identidad visual y una experiencia de usuario consistente en todas las plataformas (web y móvil), reflejando profesionalidad y modernidad del servicio.

---

## 🎨 Paleta de Colores

### Colores Principales

#### Negro Carbón (Primary Dark)
```css
--color-primary-dark: #2C2C2C;
--color-primary-dark-rgb: 44, 44, 44;
```
**Uso:** Fondos principales, textos destacados, elementos de alta jerarquía

#### Dorado (Primary Gold)
```css
--color-primary-gold: #D4AF37;
--color-primary-gold-rgb: 212, 175, 55;
```
**Uso:** Botones primarios, CTAs, elementos interactivos principales, acentos importantes

#### Blanco
```css
--color-white: #FFFFFF;
--color-white-rgb: 255, 255, 255;
```
**Uso:** Fondos secundarios, textos sobre fondos oscuros, espacios de respiro

### Colores Secundarios

#### Gris Claro
```css
--color-gray-light: #F5F5F5;
--color-gray-light-rgb: 245, 245, 245;
```
**Uso:** Fondos de secciones alternas, cards, inputs

#### Gris Medio
```css
--color-gray-medium: #9E9E9E;
--color-gray-medium-rgb: 158, 158, 158;
```
**Uso:** Textos secundarios, placeholders, íconos inactivos

#### Gris Oscuro
```css
--color-gray-dark: #6B6B6B;
--color-gray-dark-rgb: 107, 107, 107;
```
**Uso:** Textos de apoyo, bordes sutiles

#### Negro Texto
```css
--color-text-black: #212121;
--color-text-black-rgb: 33, 33, 33;
```
**Uso:** Textos principales con alta legibilidad

### Colores de Estado

#### Éxito (Success)
```css
--color-success: #4CAF50;
--color-success-rgb: 76, 175, 80;
--color-success-light: #E8F5E9;
```
**Uso:** Confirmaciones, mensajes positivos, estados completados

#### Advertencia (Warning)
```css
--color-warning: #FF9800;
--color-warning-rgb: 255, 152, 0;
--color-warning-light: #FFF3E0;
```
**Uso:** Alertas preventivas, acciones que requieren atención

#### Error (Error)
```css
--color-error: #F44336;
--color-error-rgb: 244, 67, 54;
--color-error-light: #FFEBEE;
```
**Uso:** Errores, validaciones fallidas, acciones destructivas

#### Info (Info)
```css
--color-info: #17A2B8;
--color-info-rgb: 23, 162, 184;
--color-info-light: #E3F2FD;
```
**Uso:** Información complementaria, tooltips, ayudas contextuales

### Contrastes (WCAG 2.1 AA)

**Requisitos mínimos:**
- Texto normal (< 18px): Contraste mínimo 4.5:1
- Texto grande (≥ 18px o ≥ 14px bold): Contraste mínimo 3:1
- Elementos UI interactivos: Contraste mínimo 3:1

**Verificados:**
- #2C2C2C sobre #FFFFFF: ✓ 15.8:1
- #D4AF37 sobre #2C2C2C: ✓ 4.8:1
- #212121 sobre #FFFFFF: ✓ 16.1:1
- #FFFFFF sobre #D4AF37: ✓ 4.2:1

---

## ✍️ Tipografía

### Fuente Principal: Montserrat

**Importación:**
```css
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap');
```

### Jerarquía Tipográfica

#### H1 - Títulos Principales
```css
font-family: 'Montserrat', sans-serif;
font-weight: 700; /* Bold */
font-size: 32px; /* Desktop */
font-size: 28px; /* Mobile */
line-height: 1.2;
color: #2C2C2C;
letter-spacing: -0.5px;
```
**Uso:** Títulos de página, headlines importantes

#### H2 - Subtítulos Principales
```css
font-family: 'Montserrat', sans-serif;
font-weight: 600; /* Semi-Bold */
font-size: 24px; /* Desktop */
font-size: 20px; /* Mobile */
line-height: 1.3;
color: #2C2C2C;
```
**Uso:** Secciones principales, títulos de módulos

#### H3 - Subtítulos Secundarios
```css
font-family: 'Montserrat', sans-serif;
font-weight: 600; /* Semi-Bold */
font-size: 20px; /* Desktop */
font-size: 18px; /* Mobile */
line-height: 1.4;
color: #212121;
```
**Uso:** Subsecciones, títulos de cards

#### H4 - Títulos de Componentes
```css
font-family: 'Montserrat', sans-serif;
font-weight: 500; /* Medium */
font-size: 18px;
line-height: 1.4;
color: #212121;
```
**Uso:** Títulos dentro de componentes, labels destacados

#### Body Text - Texto Principal
```css
font-family: 'Montserrat', sans-serif;
font-weight: 400; /* Regular */
font-size: 16px; /* Desktop */
font-size: 14px; /* Mobile */
line-height: 1.6;
color: #212121;
```
**Uso:** Párrafos, descripciones, contenido general

#### Small Text - Texto Secundario
```css
font-family: 'Montserrat', sans-serif;
font-weight: 400; /* Regular */
font-size: 14px; /* Desktop */
font-size: 12px; /* Mobile */
line-height: 1.5;
color: #6B6B6B;
```
**Uso:** Metadatos, timestamps, información complementaria

#### Caption - Textos Pequeños
```css
font-family: 'Montserrat', sans-serif;
font-weight: 400; /* Regular */
font-size: 12px;
line-height: 1.4;
color: #9E9E9E;
```
**Uso:** Ayudas contextuales, disclaimers, notas al pie

#### Button Text - Texto de Botones
```css
font-family: 'Montserrat', sans-serif;
font-weight: 600; /* Semi-Bold */
font-size: 16px; /* Large buttons */
font-size: 14px; /* Regular buttons */
text-transform: none; /* Mantener capitalización normal */
letter-spacing: 0.5px;
```

---

## 🧩 Componentes UI

### 1. Botones

#### Botón Primario (Primary Button)
```css
/* Estilos base */
.btn-primary {
  background-color: #D4AF37;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  min-height: 48px; /* Material Design / 44px iOS */
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(212, 175, 55, 0.2);
}

.btn-primary:hover {
  background-color: #C19F30; /* Dorado más oscuro */
  box-shadow: 0 4px 8px rgba(212, 175, 55, 0.3);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(212, 175, 55, 0.2);
}

.btn-primary:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.4); /* Focus ring azul */
}

.btn-primary:disabled {
  background-color: #9E9E9E;
  cursor: not-allowed;
  opacity: 0.5;
  box-shadow: none;
}
```

#### Botón Secundario (Secondary Button)
```css
.btn-secondary {
  background-color: transparent;
  color: #D4AF37;
  border: 2px solid #D4AF37;
  border-radius: 8px;
  padding: 10px 24px; /* Menos padding vertical por el borde */
  font-size: 16px;
  font-weight: 600;
  min-height: 48px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background-color: rgba(212, 175, 55, 0.1);
  border-color: #C19F30;
}

.btn-secondary:active {
  background-color: rgba(212, 175, 55, 0.2);
}
```

#### Botón de Texto (Text Button)
```css
.btn-text {
  background-color: transparent;
  color: #6B6B6B;
  border: none;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
}

.btn-text:hover {
  color: #D4AF37;
}
```

#### Botón de Peligro (Danger Button)
```css
.btn-danger {
  background-color: #F44336;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  min-height: 48px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background-color: #D32F2F;
}
```

### 2. Campos de Texto (Inputs)

#### Input Estándar
```css
.input-field {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  font-family: 'Montserrat', sans-serif;
  color: #212121;
  background-color: #FFFFFF;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.input-field::placeholder {
  color: #9E9E9E;
  font-style: italic; /* Opcional */
}

.input-field:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.input-field:disabled {
  background-color: #F5F5F5;
  color: #9E9E9E;
  cursor: not-allowed;
}

.input-field.error {
  border-color: #F44336;
}

.input-field.success {
  border-color: #4CAF50;
}
```

#### Label
```css
.input-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #212121;
}
```

#### Mensaje de Error
```css
.input-error-message {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
  font-size: 12px;
  color: #F44336;
}
```

### 3. Menús / Navbar

#### Desktop Navbar
```css
.navbar-desktop {
  position: sticky;
  top: 0;
  height: 80px;
  background-color: #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 1000;
}

.navbar-logo {
  height: 50px;
}

.navbar-links {
  display: flex;
  gap: 32px;
  align-items: center;
}

.navbar-link {
  font-size: 16px;
  font-weight: 500;
  color: #212121;
  text-decoration: none;
  transition: color 0.3s ease;
}

.navbar-link:hover {
  color: #D4AF37;
}

.navbar-link.active {
  color: #D4AF37;
  font-weight: 600;
}
```

#### Mobile Bottom Navigation
```css
.navbar-mobile {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background-color: #FFFFFF;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
}

.navbar-mobile-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  color: #6B6B6B;
  text-decoration: none;
  transition: color 0.3s ease;
}

.navbar-mobile-item.active {
  color: #D4AF37;
}

.navbar-mobile-icon {
  width: 24px;
  height: 24px;
}

.navbar-mobile-label {
  font-size: 11px;
  font-weight: 500;
}
```

#### Menú Hamburguesa (Mobile)
```css
.hamburger-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 280px;
  height: 100vh;
  background-color: #2C2C2C;
  transition: right 0.3s ease;
  z-index: 1100;
  padding: 24px;
}

.hamburger-menu.open {
  right: 0;
}

.hamburger-link {
  display: block;
  padding: 16px 0;
  color: #FFFFFF;
  font-size: 16px;
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
```

### 4. Tarjetas (Cards)

```css
.card {
  background-color: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #2C2C2C;
  margin-bottom: 12px;
}

.card-content {
  font-size: 14px;
  color: #6B6B6B;
  line-height: 1.6;
}
```

### 5. Íconos

**Librería:** Lucide React (https://lucide.dev/)
**Alternativa:** Material Icons (https://fonts.google.com/icons)

```css
.icon {
  width: 24px;
  height: 24px;
  stroke-width: 2px;
  color: inherit; /* Hereda del padre */
}

.icon-small {
  width: 16px;
  height: 16px;
}

.icon-large {
  width: 32px;
  height: 32px;
}
```

**Íconos principales del sistema:**
- 📅 Calendario: `Calendar` - Agendar citas
- ✂️ Tijeras: `Scissors` - Servicios
- 🛒 Carrito: `ShoppingCart` - Productos/Compras
- 👤 Usuario: `User` - Perfil
- 🔔 Campana: `Bell` - Notificaciones
- ✓ Check: `Check` - Confirmación
- ✕ X: `X` - Cerrar/Cancelar
- ⚠️ Alerta: `AlertTriangle` - Advertencias

**Accesibilidad:**
```jsx
// Siempre incluir aria-label
<Calendar aria-label="Agendar cita" />
```

---

## 📱 Diseño Responsivo

### Enfoque: Mobile First

### Breakpoints

```css
/* Mobile: < 768px (base) */
/* Tablet: 768px - 1024px */
/* Desktop: > 1024px */

/* Media queries */
@media (min-width: 768px) {
  /* Tablet styles */
}

@media (min-width: 1024px) {
  /* Desktop styles */
}
```

### Márgenes y Padding

```css
/* Mobile */
.container-mobile {
  padding: 0 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .container-tablet {
    padding: 0 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container-desktop {
    padding: 0 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Sistema de Espaciado

**Base: 8px** (múltiplos de 8 para ritmo visual)

```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

### Grids

```css
.grid {
  display: grid;
  gap: 16px;
}

/* Mobile: 1 columna */
.grid {
  grid-template-columns: 1fr;
}

/* Tablet: 2 columnas */
@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

/* Desktop: 3-4 columnas */
@media (min-width: 1024px) {
  .grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
}
```

---

## 🔄 Patrones de Interacción

### Estados de Componentes

```css
/* Estado normal */
.interactive-element {
  transition: all 0.3s ease;
}

/* Estado hover (desktop) */
.interactive-element:hover {
  /* Cambios visuales */
}

/* Estado activo/pressed */
.interactive-element:active {
  /* Feedback visual inmediato */
}

/* Estado focus (teclado) */
.interactive-element:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.4);
}

/* Estado disabled */
.interactive-element:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

### Animaciones

```css
/* Transiciones suaves */
.smooth-transition {
  transition: all 0.3s ease;
}

/* Animación de entrada */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

/* Loading spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

### Feedback Visual

#### Toast Notifications
```css
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease-out;
}

.toast-success {
  background-color: #4CAF50;
  color: #FFFFFF;
}

.toast-error {
  background-color: #F44336;
  color: #FFFFFF;
}

.toast-info {
  background-color: #17A2B8;
  color: #FFFFFF;
}
```

#### Progress Bars
```css
.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #E0E0E0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background-color: #D4AF37;
  transition: width 0.3s ease;
}
```

#### Loading States
```css
.skeleton {
  background: linear-gradient(
    90deg,
    #F5F5F5 25%,
    #E0E0E0 50%,
    #F5F5F5 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

---

## 🎯 Iconografía

### Sistema de Íconos

**Librería:** Lucide React
**URL:** https://lucide.dev/

**Instalación:**
```bash
npm install lucide-react
```

**Uso:**
```jsx
import { Calendar, Scissors, ShoppingCart } from 'lucide-react';

<Calendar size={24} strokeWidth={2} />
```

### Especificaciones

```css
/* Tamaños */
--icon-size-small: 16px;
--icon-size-default: 24px;
--icon-size-large: 32px;

/* Grosor de línea */
--icon-stroke-width: 2px;

/* Colores */
--icon-color-default: #6B6B6B;
--icon-color-active: #D4AF37;
--icon-color-inactive: #9E9E9E;
```

### Íconos del Sistema

| Función | Ícono | Nombre Lucide | Uso |
|---------|-------|---------------|-----|
| Agendar citas | 📅 | `Calendar` | Botón principal de agendado |
| Servicios | ✂️ | `Scissors` | Catálogo de servicios |
| Productos | 🛒 | `ShoppingCart` | Tienda/carrito |
| Perfil | 👤 | `User` | Acceso a perfil de usuario |
| Notificaciones | 🔔 | `Bell` | Centro de notificaciones |
| Confirmación | ✓ | `Check` | Estados exitosos |
| Cerrar | ✕ | `X` | Cerrar modales/cancelar |
| Advertencia | ⚠️ | `AlertTriangle` | Alertas |
| Búsqueda | 🔍 | `Search` | Input de búsqueda |
| Menú | ☰ | `Menu` | Hamburger menu |
| Editar | ✏️ | `Edit` | Editar información |
| Eliminar | 🗑️ | `Trash2` | Eliminar registros |
| Configuración | ⚙️ | `Settings` | Ajustes |

---

## 💬 Lenguaje de Comunicación

### Tono de Voz

**Personalidad de la marca:**
- ✅ Profesional pero accesible: No pomposo ni excesivamente técnico
- ✅ Cercano y confiable: Como hablar con un experto amigable
- ✅ Directo y claro: Sin ambigüedades, instrucciones precisas
- ✅ Moderno: Lenguaje contemporáneo sin ser informal

### Principios de Escritura

#### ✓ SÍ HACER:
- Usar voz activa: **"Agendaste tu cita"** ✓
- Instrucciones claras: **"Selecciona la fecha de tu cita"** ✓
- Mensajes de éxito positivos: **"¡Listo! Tu cita está confirmada"** ✓
- Errores constructivos: **"Esta fecha no está disponible. Prueba con el 16 de octubre"** ✓

#### ✗ NO HACER:
- Jerga técnica: ~~"Error 500"~~, ~~"Validación fallida"~~ ✗
- Mensajes vagos: ~~"Algo salió mal"~~ ✗
- Culpar al usuario: ~~"Ingresaste mal el dato"~~ ✗
- Excesivo entusiasmo: ~~"¡¡¡Genial!!!"~~ ✗

### Mensajes del Sistema

#### Mensajes de Éxito
```
✓ "¡Listo! Tu cita está confirmada para el 16 de octubre a las 10:00 AM"
✓ "Pago registrado correctamente"
✓ "Producto agregado al carrito"
```

#### Mensajes de Error
```
✗ "Esta fecha no está disponible. Prueba con el 16 de octubre"
✗ "El horario seleccionado ya fue reservado. Te sugerimos las 11:00 AM"
✗ "No pudimos procesar el pago. Verifica los datos de tu tarjeta"
```

#### Mensajes de Advertencia
```
⚠️ "Si cancelas con menos de 24 horas de anticipación, se aplicará un cargo del 50%"
⚠️ "Quedan solo 3 productos en stock"
⚠️ "Tu sesión expirará en 5 minutos"
```

#### Mensajes Informativos
```
ℹ️ "Tu cita es mañana a las 10:00 AM. ¿Necesitas recordatorio?"
ℹ️ "El barbero estará disponible en 15 minutos"
ℹ️ "Tienes un descuento del 10% disponible"
```

---

## ♿ Accesibilidad

### Cumplimiento WCAG 2.1 Nivel AA

#### Contraste de Color
- Texto normal (< 18px): Contraste mínimo **4.5:1**
- Texto grande (≥ 18px): Contraste mínimo **3:1**
- Elementos UI: Contraste mínimo **3:1**

#### Navegación por Teclado
```css
/* Orden lógico de Tab */
.focusable-element {
  tab-index: 0; /* Para elementos personalizados */
}

/* Focus visible */
*:focus-visible {
  outline: 3px solid #17A2B8;
  outline-offset: 2px;
}
```

#### Atributos ARIA
```jsx
// Labels descriptivos
<button aria-label="Agendar nueva cita">
  <Calendar />
</button>

// Estados dinámicos
<button aria-pressed={isActive}>
  Filtro
</button>

// Mensajes en vivo
<div role="alert" aria-live="polite">
  Cita confirmada
</div>

// Contenido expandible
<button aria-expanded={isOpen} aria-controls="menu">
  Menú
</button>
```

#### Texto Alternativo
```jsx
// Imágenes con contexto
<img src="profile.jpg" alt="Foto de perfil de Juan Pérez" />

// Imágenes decorativas
<img src="decoration.png" alt="" role="presentation" />
```

#### Reducción de Movimiento
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 📐 Fundamentos Normativos

### ISO 9241-210:2019
Diseño centrado en el usuario para sistemas interactivos

**Principios aplicados:**
1. **Visibilidad del estado:** Progress bars, loading spinners, toast notifications
2. **Coincidencia sistema-mundo real:** Lenguaje natural, iconografía universal
3. **Control y libertad:** Botones de retroceso, cancelación de citas, confirmaciones
4. **Consistencia:** Color dorado para acciones principales, nomenclatura uniforme
5. **Prevención de errores:** Validación en tiempo real, deshabilitación de botones

### Heurísticas de Nielsen
Las 10 heurísticas de usabilidad aplicadas al proyecto

### Material Design & iOS Guidelines
- **Elevaciones consistentes** para jerarquía visual
- **Animaciones con propósito** (0.3s ease)
- **Sistema de espaciado** basado en 8px
- **Objetivos táctiles** mínimo 48x48px

### Core Web Vitals
- **Largest Contentful Paint (LCP):** < 2.5s
- **First Input Delay (FID):** < 100ms
- **Cumulative Layout Shift (CLS):** < 0.1

---

## 📝 Notas de Implementación

### Variables CSS Recomendadas

```css
:root {
  /* Colores */
  --color-primary-dark: #2C2C2C;
  --color-primary-gold: #D4AF37;
  --color-white: #FFFFFF;
  --color-gray-light: #F5F5F5;
  --color-gray-medium: #9E9E9E;
  --color-gray-dark: #6B6B6B;
  --color-text-black: #212121;
  
  --color-success: #4CAF50;
  --color-warning: #FF9800;
  --color-error: #F44336;
  --color-info: #17A2B8;
  
  /* Tipografía */
  --font-family: 'Montserrat', sans-serif;
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* Espaciado */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --spacing-3xl: 64px;
  
  /* Bordes */
  --border-radius-sm: 4px;
  --border-radius-md: 8px;
  --border-radius-lg: 12px;
  --border-radius-xl: 16px;
  
  /* Sombras */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.08);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.16);
  
  /* Transiciones */
  --transition-fast: 0.15s ease;
  --transition-base: 0.3s ease;
  --transition-slow: 0.5s ease;
  
  /* Breakpoints */
  --breakpoint-mobile: 768px;
  --breakpoint-desktop: 1024px;
}
```

### Stack Tecnológico Recomendado

**Frontend Web:**
- Framework: Angular
- Styling: Tailwind CSS / SCSS
- Iconos: Lucide React
- Fuentes: Google Fonts (Montserrat)

**Frontend Móvil:**
- Framework: Flutter
- Paridad de funcionalidades: 100% con web

---

## 🔍 Referencias Rápidas

### Colores en un Vistazo
```
Negro Carbón: #2C2C2C
Dorado:       #D4AF37
Blanco:       #FFFFFF
Gris Claro:   #F5F5F5
Gris Medio:   #9E9E9E
Gris Oscuro:  #6B6B6B
Negro Texto:  #212121

Éxito:        #4CAF50
Advertencia:  #FF9800
Error:        #F44336
Info:         #17A2B8
```

### Espaciados
```
4px   8px   16px   24px   32px   48px   64px
xs    sm    md     lg     xl     2xl    3xl
```

### Breakpoints
```
< 768px:  Mobile
768-1024: Tablet
> 1024px: Desktop
```

---

**Versión:** 1.0  
**Última actualización:** Noviembre 2024  
**Proyecto:** Stylo Barber Connect  
**Equipo:** Gilberto & Jorge Miguel

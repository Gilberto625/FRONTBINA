// Constantes globales de la aplicación TonyStyleo

export const APP_CONSTANTS = {
  // Información de la aplicación
  APP_NAME: 'Tony Stylo Barbería',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: 'Sistema integral de gestión para barbería',

  // URLs y endpoints
  API_BASE_URL: 'http://localhost:8000/api',
  MEDIA_BASE_URL: 'http://localhost:8000/media',
  
  // Configuración de autenticación
  TOKEN_KEY: 'tonystylo_token',
  REFRESH_TOKEN_KEY: 'tonystylo_refresh_token',
  USER_KEY: 'tonystylo_user',
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000, // 5 minutos en ms

  // Roles de usuario
  ROLES: {
    CLIENTE: 'cliente',
    SECRETARIA: 'secretaria',
    BARBERO: 'barbero',
    ADMINISTRADOR: 'administrador'
  },

  // Estados de citas
  ESTADOS_CITA: {
    PENDIENTE: 'pendiente',
    CONFIRMADA: 'confirmada',
    EN_PROCESO: 'en_proceso',
    COMPLETADA: 'completada',
    CANCELADA: 'cancelada',
    NO_ASISTIO: 'no_asistio'
  },

  // Estados de pedidos
  ESTADOS_PEDIDO: {
    PENDIENTE: 'pendiente',
    CONFIRMADO: 'confirmado',
    PREPARANDO: 'preparando',
    ENVIADO: 'enviado',
    ENTREGADO: 'entregado',
    CANCELADO: 'cancelado'
  },

  // Métodos de pago
  METODOS_PAGO: {
    EFECTIVO: 'efectivo',
    TRANSFERENCIA: 'transferencia',
    BANORTE: 'banorte'
  },

  // Tipos de notificación
  TIPOS_NOTIFICACION: {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    CITA: 'cita',
    PRODUCTO: 'producto',
    PAGO: 'pago'
  },

  // Configuración de paginación
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
  },

  // Configuración de archivos
  FILE_UPLOAD: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  },

  // Configuración de tiempo
  TIME_CONFIG: {
    HORARIO_INICIO: '09:00',
    HORARIO_FIN: '18:00',
    DURACION_SLOT: 30, // minutos
    DIAS_ANTICIPACION_MAX: 30,
    RECORDATORIO_24H: 24 * 60 * 60 * 1000, // 24 horas en ms
    RECORDATORIO_1_5H: 1.5 * 60 * 60 * 1000 // 1.5 horas en ms
  },

  // Configuración de la barbería
  BARBERIA_CONFIG: {
    NUMERO_SILLAS: 4,
    TIEMPO_ESPERA_MAX: 10, // minutos
    PORCENTAJE_ANTICIPO: 50,
    CITAS_PENALIZACION: 10,
    DIAS_ALTA_DEMANDA: ['viernes', 'sabado', 'domingo'],
    ANTICIPACION_ALTA_DEMANDA: 3, // días
    ANTICIPACION_BAJA_DEMANDA: 1, // días
    CANCELACION_ALTA_DEMANDA: 2, // días
    CANCELACION_BAJA_DEMANDA: 1 // días
  },

  // Mensajes del sistema
  MESSAGES: {
    LOADING: 'Cargando...',
    SAVING: 'Guardando...',
    DELETING: 'Eliminando...',
    SUCCESS_SAVE: 'Guardado exitosamente',
    SUCCESS_DELETE: 'Eliminado exitosamente',
    ERROR_GENERIC: 'Ha ocurrido un error inesperado',
    ERROR_NETWORK: 'Error de conexión. Verifica tu internet.',
    ERROR_UNAUTHORIZED: 'No tienes permisos para esta acción',
    ERROR_NOT_FOUND: 'El recurso solicitado no fue encontrado',
    CONFIRM_DELETE: '¿Estás seguro de que deseas eliminar este elemento?',
    SESSION_EXPIRED: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
  },

  // Configuración de validaciones
  VALIDATION: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 30,
    PHONE_PATTERN: /^[0-9]{10}$/,
    EMAIL_PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    NAME_PATTERN: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/
  },

  // Configuración de colores corporativos
  COLORS: {
    PRIMARY: '#f39c12',
    SECONDARY: '#2c3e50',
    SUCCESS: '#27ae60',
    WARNING: '#e67e22',
    DANGER: '#e74c3c',
    INFO: '#3498db',
    LIGHT: '#f8f9fa',
    DARK: '#343a40'
  },

  // Configuración de localStorage
  STORAGE_KEYS: {
    THEME: 'tonystylo_theme',
    LANGUAGE: 'tonystylo_language',
    CART: 'tonystylo_cart',
    PREFERENCES: 'tonystylo_preferences',
    LAST_ROUTE: 'tonystylo_last_route'
  },

  // URLs de redes sociales
  SOCIAL_MEDIA: {
    FACEBOOK: 'https://facebook.com/tonystylo',
    INSTAGRAM: 'https://instagram.com/tonystylo',
    WHATSAPP: 'https://wa.me/5551234567',
    GOOGLE_MAPS: 'https://maps.google.com/?q=Tony+Stylo+Barberia'
  },

  // Configuración de reportes
  REPORTS: {
    FORMATS: ['excel', 'pdf'],
    MAX_RECORDS: 10000,
    CACHE_DURATION: 5 * 60 * 1000 // 5 minutos
  }
};

// Funciones de utilidad
export const UTILS = {
  // Formatear precio
  formatPrice: (price: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(price);
  },

  // Formatear fecha
  formatDate: (date: string | Date): string => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  },

  // Formatear fecha y hora
  formatDateTime: (date: string | Date): string => {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  },

  // Formatear duración
  formatDuration: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  },

  // Generar ID único
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Validar email
  isValidEmail: (email: string): boolean => {
    return APP_CONSTANTS.VALIDATION.EMAIL_PATTERN.test(email);
  },

  // Validar teléfono
  isValidPhone: (phone: string): boolean => {
    return APP_CONSTANTS.VALIDATION.PHONE_PATTERN.test(phone);
  },

  // Obtener iniciales
  getInitials: (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  },

  // Truncar texto
  truncateText: (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }
};

// Configuración de desarrollo/producción
export const ENV_CONFIG = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  enableLogging: true,
  enableMockData: false,
  version: '1.0.0'
};


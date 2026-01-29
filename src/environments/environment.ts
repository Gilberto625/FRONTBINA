export const environment = {
  production: false,  // false para desarrollo local
  // Para desarrollo LOCAL descomenta esta línea:
  apiUrl: 'http://localhost:8000/api/usuarios',
  // Para producción en Render usa esta línea:
  // apiUrl: 'https://backendbina-1.onrender.com/api/usuarios',

  firebase: {
    apiKey: "AIzaSyAJ0Om_GyOwpAgJoaQc7g1oplyGx7g70LQ",
    authDomain: "auth-backend-tu-nombre.firebaseapp.com",
    projectId: "auth-backend-tu-nombre",
    storageBucket: "auth-backend-tu-nombre.firebasestorage.app", // ⚠️ ACTUALIZA CON TUS VALORES REALES
    messagingSenderId: "370925550099",
    appId: "1:370925550099:web:ebfdea93f12c7b01435de6"
  }

};


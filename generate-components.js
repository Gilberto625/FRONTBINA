const fs = require('fs');
const path = require('path');

// Definir todos los componentes que necesitamos crear
const components = [
  // Cliente
  { path: 'pages/cliente/dashboard', name: 'ClienteDashboard', title: 'Dashboard del Cliente' },
  { path: 'pages/cliente/agendar', name: 'Agendar', title: 'Agendar Cita' },
  { path: 'pages/cliente/mis-citas', name: 'MisCitas', title: 'Mis Citas' },
  { path: 'pages/cliente/mis-pedidos', name: 'MisPedidos', title: 'Mis Pedidos' },
  
  // Secretaria
  { path: 'pages/secretaria/dashboard', name: 'SecretariaDashboard', title: 'Dashboard Secretaria' },
  { path: 'pages/secretaria/agenda', name: 'AgendaGeneral', title: 'Agenda General' },
  { path: 'pages/secretaria/productos', name: 'GestionProductos', title: 'Gestión de Productos' },
  { path: 'pages/secretaria/ventas', name: 'GestionVentas', title: 'Gestión de Ventas' },
  
  // Barbero
  { path: 'pages/barbero/dashboard', name: 'BarberoDashboard', title: 'Dashboard Barbero' },
  { path: 'pages/barbero/tiempos-servicio', name: 'TiemposServicio', title: 'Tiempos de Servicio' },
  
  // Admin
  { path: 'pages/admin/dashboard', name: 'AdminDashboard', title: 'Dashboard Administrador' },
  { path: 'pages/admin/empleados', name: 'Empleados', title: 'Gestión de Empleados' },
  { path: 'pages/admin/reportes', name: 'Reportes', title: 'Reportes y Métricas' },
  { path: 'pages/admin/configuracion', name: 'AdminConfiguracion', title: 'Configuración del Sistema' }
];

// Templates para generar los archivos
const tsTemplate = (name, title) => `import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-${name.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1)}',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './${name.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1)}.component.html',
  styleUrls: ['./${name.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1)}.component.css']
})
export class ${name}Component implements OnInit {
  isLoading = true;
  error: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      this.isLoading = true;
      this.error = null;
      
      // TODO: Implementar carga de datos
      
    } catch (error) {
      console.error('Error loading data:', error);
      this.error = 'Error al cargar los datos. Por favor, intenta de nuevo.';
    } finally {
      this.isLoading = false;
    }
  }

  get currentUser() {
    return this.authService.getCurrentUser();
  }
}`;

const htmlTemplate = (title) => `<!-- Header -->
<div class="page-header">
  <div class="container">
    <h1 class="page-title">
      <i class="lucide lucide-layout-dashboard"></i>
      ${title}
    </h1>
    <p class="page-subtitle">Gestiona y visualiza la información de ${title.toLowerCase()}</p>
  </div>
</div>

<!-- Loading -->
<div class="container" *ngIf="isLoading">
  <div class="loading-container">
    <div class="spinner"></div>
    <p>Cargando datos...</p>
  </div>
</div>

<!-- Error -->
<div class="container" *ngIf="error && !isLoading">
  <div class="alert alert-error">
    <i class="lucide lucide-alert-circle"></i>
    {{ error }}
  </div>
</div>

<!-- Contenido -->
<div class="container" *ngIf="!isLoading && !error">
  <div class="content-grid">
    
    <!-- Card de bienvenida -->
    <div class="welcome-card card">
      <div class="card-header">
        <h3>¡Bienvenido, {{ currentUser?.nombre }}!</h3>
      </div>
      <div class="card-content">
        <p>Aquí podrás gestionar todas las funcionalidades de ${title.toLowerCase()}.</p>
      </div>
    </div>

    <!-- Placeholder para contenido específico -->
    <div class="feature-card card">
      <div class="card-header">
        <h3>Funcionalidades</h3>
      </div>
      <div class="card-content">
        <p>Las funcionalidades específicas de ${title.toLowerCase()} se implementarán aquí.</p>
        <div class="feature-list">
          <div class="feature-item">
            <i class="lucide lucide-check-circle"></i>
            <span>Funcionalidad 1</span>
          </div>
          <div class="feature-item">
            <i class="lucide lucide-check-circle"></i>
            <span>Funcionalidad 2</span>
          </div>
          <div class="feature-item">
            <i class="lucide lucide-check-circle"></i>
            <span>Funcionalidad 3</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</div>`;

const cssTemplate = () => `/* Header */
.page-header {
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, #1a1a1a 100%);
  color: var(--color-white);
  padding: var(--spacing-2xl) 0;
  margin-bottom: var(--spacing-xl);
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: 32px;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-gold);
  margin-bottom: var(--spacing-xs);
}

.page-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

@media (max-width: 767px) {
  .page-title {
    font-size: 24px;
  }
}

/* Layout */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

/* Cards */
.card {
  background: var(--color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--transition-base);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-light);
  background-color: var(--color-gray-light);
}

.card-header h3 {
  font-size: 20px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-dark);
  margin: 0;
}

.card-content {
  padding: var(--spacing-lg);
}

.card-content p {
  color: var(--color-gray-dark);
  margin-bottom: var(--spacing-md);
}

/* Feature list */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: 14px;
  color: var(--color-text-black);
}

.feature-item i {
  width: 16px;
  height: 16px;
  color: var(--color-success);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl);
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-gray-light);
  border-top: 4px solid var(--color-primary-gold);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--spacing-md);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Alert */
.alert {
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.alert-error {
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  color: var(--color-error);
}

/* Responsive */
@media (max-width: 767px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}`;

// Función para crear directorios recursivamente
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Función para generar un componente
function generateComponent(component) {
  const basePath = path.join('src/app', component.path);
  const componentName = component.name.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1);
  
  // Crear directorio
  ensureDirectoryExists(basePath);
  
  // Generar archivos
  const tsContent = tsTemplate(component.name, component.title);
  const htmlContent = htmlTemplate(component.title);
  const cssContent = cssTemplate();
  
  // Escribir archivos
  fs.writeFileSync(path.join(basePath, `${componentName}.component.ts`), tsContent);
  fs.writeFileSync(path.join(basePath, `${componentName}.component.html`), htmlContent);
  fs.writeFileSync(path.join(basePath, `${componentName}.component.css`), cssContent);
  
  console.log(`✅ Generado: ${component.path}/${componentName}.component`);
}

// Generar todos los componentes
console.log('🚀 Generando componentes faltantes...\n');

components.forEach(component => {
  try {
    generateComponent(component);
  } catch (error) {
    console.error(`❌ Error generando ${component.path}:`, error.message);
  }
});

console.log('\n🎉 ¡Generación completada!');
console.log('\n📋 Componentes generados:');
components.forEach(comp => {
  console.log(`   - ${comp.path} (${comp.title})`);
});

console.log('\n🔧 Próximos pasos:');
console.log('   1. Revisar y personalizar cada componente');
console.log('   2. Implementar la lógica específica de cada uno');
console.log('   3. Conectar con los servicios del backend');
console.log('   4. Añadir validaciones y manejo de errores');

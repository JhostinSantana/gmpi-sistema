// API Client para GMPI - Gestor de Mantenimiento Preventivo de Infraestructuras
// Configuración y funciones para comunicación con el backend

class GMPIApiClient {
  constructor() {
    // Detectar entorno automáticamente
    this.baseURL = this.detectEnvironment();
    this.token = localStorage.getItem('gmpi_token');
    
    console.log(`🔧 GMPI API Client inicializado - Entorno: ${this.baseURL}`);
  }

  detectEnvironment() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;

    // Producción (Vercel, Netlify, etc.)
    if (hostname.includes('vercel.app') || 
        hostname.includes('netlify.app') || 
        hostname.includes('herokuapp.com') ||
        (hostname !== 'localhost' && hostname !== '127.0.0.1')) {
      return `${protocol}//${hostname}`;
    }
    
    // Desarrollo local
    if (port && port !== '80' && port !== '443') {
      return `${protocol}//${hostname}:3000`; // Puerto del backend
    }
    
    return `${protocol}//${hostname}`;
  }

  // Configurar token de autenticación
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('gmpi_token', token);
    } else {
      localStorage.removeItem('gmpi_token');
    }
  }

  // Headers por defecto para las peticiones
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Método base para hacer peticiones HTTP
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    
    const defaultOptions = {
      headers: this.getHeaders(options.auth !== false),
      ...options
    };

    try {
      console.log(`📡 ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, defaultOptions);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`❌ Error en petición a ${endpoint}:`, error);
      throw error;
    }
  }

  // === INSTITUCIONES ===
  async getInstitutions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const endpoint = `/institutions${params ? `?${params}` : ''}`;
    return await this.request(endpoint);
  }

  async getInstitution(id) {
    return await this.request(`/institutions/${id}`);
  }

  async createInstitution(data) {
    return await this.request('/institutions', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateInstitution(id, data) {
    return await this.request(`/institutions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteInstitution(id) {
    return await this.request(`/institutions/${id}`, {
      method: 'DELETE'
    });
  }

  async getInstitutionStats() {
    return await this.request('/institutions/stats/summary');
  }

  // === INFRAESTRUCTURAS ===
  async getInfrastructures(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const endpoint = `/infrastructure${params ? `?${params}` : ''}`;
    return await this.request(endpoint);
  }

  async getInfrastructure(id) {
    return await this.request(`/infrastructure/${id}`);
  }

  async createInfrastructure(data) {
    return await this.request('/infrastructure', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateInfrastructure(id, data) {
    return await this.request(`/infrastructure/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteInfrastructure(id) {
    return await this.request(`/infrastructure/${id}`, {
      method: 'DELETE'
    });
  }

  // === MANTENIMIENTOS ===
  async getMaintenanceRecords(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const endpoint = `/maintenance${params ? `?${params}` : ''}`;
    return await this.request(endpoint);
  }

  async getMaintenanceRecord(id) {
    return await this.request(`/maintenance/${id}`);
  }

  async createMaintenanceRecord(data) {
    return await this.request('/maintenance', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateMaintenanceRecord(id, data) {
    return await this.request(`/maintenance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteMaintenanceRecord(id) {
    return await this.request(`/maintenance/${id}`, {
      method: 'DELETE'
    });
  }

  async completeMaintenanceRecord(id, data) {
    return await this.request(`/maintenance/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getMaintenanceStats() {
    return await this.request('/maintenance/stats/dashboard');
  }

  // === REPORTES ===
  async getDashboardReport() {
    return await this.request('/reports/dashboard');
  }

  async getMaintenanceReport(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const endpoint = `/reports/maintenance${params ? `?${params}` : ''}`;
    return await this.request(endpoint);
  }

  async getInstitutionsReport(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const endpoint = `/reports/institutions${params ? `?${params}` : ''}`;
    return await this.request(endpoint);
  }

  async getUpcomingMaintenanceReport(days = 30) {
    return await this.request(`/reports/upcoming-maintenance?days=${days}`);
  }

  async getCostAnalysisReport(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const endpoint = `/reports/cost-analysis${params ? `?${params}` : ''}`;
    return await this.request(endpoint);
  }

  // === AUTENTICACIÓN ===
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      auth: false
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async register(userData) {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      auth: false
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async getProfile() {
    return await this.request('/auth/profile');
  }

  async updateProfile(data) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async refreshToken() {
    const response = await this.request('/auth/refresh', {
      method: 'POST'
    });
    
    if (response.success && response.data.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('gmpi_user');
  }

  // === ARCHIVOS ===
  async uploadFile(file, relatedTable, relatedId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('related_table', relatedTable);
    formData.append('related_id', relatedId);

    const response = await fetch(`${this.baseURL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : ''
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir archivo');
    }

    return await response.json();
  }

  async uploadMultipleFiles(files, relatedTable, relatedId) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('related_table', relatedTable);
    formData.append('related_id', relatedId);

    const response = await fetch(`${this.baseURL}/api/upload/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': this.token ? `Bearer ${this.token}` : ''
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al subir archivos');
    }

    return await response.json();
  }

  async getAttachments(table, id) {
    return await this.request(`/upload/attachments/${table}/${id}`);
  }

  async deleteAttachment(id) {
    return await this.request(`/upload/attachments/${id}`, {
      method: 'DELETE'
    });
  }

  // === UTILIDADES ===
  
  // Verificar si está autenticado
  isAuthenticated() {
    return !!this.token;
  }

  // Obtener información del usuario desde el token
  getUserInfo() {
    if (!this.token) return null;
    
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      return {
        id: payload.id,
        username: payload.username,
        email: payload.email,
        role: payload.role,
        exp: payload.exp
      };
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  // Verificar si el token ha expirado
  isTokenExpired() {
    const userInfo = this.getUserInfo();
    if (!userInfo) return true;
    
    return Date.now() >= userInfo.exp * 1000;
  }

  // Manejar errores de red/API de forma centralizada
  handleApiError(error, context = '') {
    console.error(`❌ Error GMPI API ${context}:`, error);
    
    if (error.message.includes('401') || error.message.includes('Token')) {
      // Token expirado o inválido
      this.logout();
      if (window.location.pathname !== '/') {
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        window.location.href = '/';
      }
    } else if (error.message.includes('403')) {
      alert('No tienes permisos para realizar esta acción.');
    } else if (error.message.includes('404')) {
      alert('Recurso no encontrado.');
    } else if (error.message.includes('500')) {
      alert('Error del servidor. Por favor, intenta más tarde.');
    } else {
      alert(`Error: ${error.message}`);
    }
  }
}

// Instancia global del cliente API
window.gmpiApi = new GMPIApiClient();

// Funciones de conveniencia globales
window.gmpiUtils = {
  // Formatear fecha para mostrar
  formatDate: (dateString) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-ES');
  },

  // Formatear fecha con hora
  formatDateTime: (dateString) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleString('es-ES');
  },

  // Formatear moneda
  formatCurrency: (amount) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },

  // Obtener color por prioridad
  getPriorityColor: (priority) => {
    const colors = {
      low: '#28a745',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545'
    };
    return colors[priority] || '#6c757d';
  },

  // Obtener color por estado
  getStatusColor: (status) => {
    const colors = {
      active: '#28a745',
      inactive: '#6c757d',
      scheduled: '#007bff',
      in_progress: '#ffc107',
      completed: '#28a745',
      cancelled: '#dc3545',
      overdue: '#dc3545'
    };
    return colors[status] || '#6c757d';
  },

  // Traducir estado al español
  translateStatus: (status) => {
    const translations = {
      active: 'Activo',
      inactive: 'Inactivo',
      scheduled: 'Programado',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado',
      overdue: 'Vencido'
    };
    return translations[status] || status;
  },

  // Traducir prioridad al español
  translatePriority: (priority) => {
    const translations = {
      low: 'Baja',
      medium: 'Media',
      high: 'Alta',
      critical: 'Crítica'
    };
    return translations[priority] || priority;
  },

  // Mostrar notificación toast
  showToast: (message, type = 'info') => {
    // Crear elemento toast si no existe
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
      `;
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8'
    };

    toast.style.cssText = `
      background: ${colors[type] || colors.info};
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 10px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: slideInRight 0.3s ease;
      cursor: pointer;
    `;
    
    toast.textContent = message;
    toast.onclick = () => toast.remove();
    
    toastContainer.appendChild(toast);
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  }
};

// Estilos CSS para las animaciones de toast
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(toastStyles);

console.log('✅ GMPI API Client cargado correctamente');
console.log('📡 Endpoint base:', window.gmpiApi.baseURL);

export default window.gmpiApi;

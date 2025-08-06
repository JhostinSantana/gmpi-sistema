/**
 * Universal Header Component
 * Carga el header universal en todas las páginas
 */

class UniversalHeader {
    constructor() {
        this.headerPath = '../html/components/header.html';
        this.loadHeader();
    }

    async loadHeader() {
        try {
            // Buscar el contenedor del header
            const headerContainer = document.getElementById('universal-header');
            
            if (!headerContainer) {
                console.warn('No se encontró el contenedor #universal-header');
                return;
            }

            // Cargar el HTML del header
            const response = await fetch(this.headerPath);
            if (!response.ok) {
                throw new Error(`Error al cargar header: ${response.status}`);
            }
            
            const headerHTML = await response.text();
            headerContainer.innerHTML = headerHTML;
            
            // Inicializar funcionalidades después de cargar
            this.initializeHeaderEvents();
            
        } catch (error) {
            console.error('Error cargando header universal:', error);
            this.loadFallbackHeader();
        }
    }

    loadFallbackHeader() {
        // Header básico en caso de error
        const headerContainer = document.getElementById('universal-header');
        if (headerContainer) {
            headerContainer.innerHTML = `
                <header class="main-header" role="banner">
                    <nav class="navbar" role="navigation">
                        <div class="nav-container">
                            <div class="nav-logo">
                                <a href="dashboard.html" class="logo-link">
                                    <span class="logo-text">GMPI</span>
                                    <span class="logo-subtitle">Mantenimiento Escolar</span>
                                </a>
                            </div>
                            <ul class="nav-menu">
                                <li class="nav-item">
                                    <a href="dashboard.html" class="nav-link">Dashboard</a>
                                </li>
                                <li class="nav-item">
                                    <a href="contact.html" class="nav-link">Contacto</a>
                                </li>
                                <li class="nav-item">
                                    <a href="index.html" class="nav-link logout-link">Cerrar Sesión</a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </header>
            `;
            this.initializeHeaderEvents();
        }
    }

    initializeHeaderEvents() {
        // Inicializar dropdowns
        this.initializeDropdowns();
        
        // Conectar con el sistema de configuración
        this.connectToSettings();
        
        // Marcar página actual como activa
        this.markActivePage();
    }

    initializeDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.nav-link');
            const menu = dropdown.querySelector('.dropdown-menu');
            
            if (trigger && menu) {
                // Toggle dropdown
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    
                    // Cerrar otros dropdowns
                    dropdowns.forEach(otherDropdown => {
                        if (otherDropdown !== dropdown) {
                            otherDropdown.classList.remove('active');
                            const otherTrigger = otherDropdown.querySelector('.nav-link');
                            if (otherTrigger) {
                                otherTrigger.setAttribute('aria-expanded', 'false');
                            }
                        }
                    });
                    
                    // Toggle este dropdown
                    const isActive = dropdown.classList.contains('active');
                    dropdown.classList.toggle('active');
                    trigger.setAttribute('aria-expanded', !isActive);
                });
            }
        });

        // Cerrar dropdowns al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown')) {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                    const trigger = dropdown.querySelector('.nav-link');
                    if (trigger) {
                        trigger.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        });

        // Cerrar dropdowns con ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdowns.forEach(dropdown => {
                    dropdown.classList.remove('active');
                    const trigger = dropdown.querySelector('.nav-link');
                    if (trigger) {
                        trigger.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        });
    }

    connectToSettings() {
        // Conectar con SettingsManager si está disponible
        if (typeof SettingsManager !== 'undefined') {
            const settingsManager = new SettingsManager();
            
            // Conectar botones de configuración
            const languageSwitch = document.getElementById('languageSwitch');
            const themeSwitch = document.getElementById('themeSwitch');
            const keyboardShortcuts = document.getElementById('keyboardShortcuts');
            
            if (languageSwitch) {
                languageSwitch.addEventListener('click', (e) => {
                    e.preventDefault();
                    settingsManager.toggleLanguage();
                });
            }
            
            if (themeSwitch) {
                themeSwitch.addEventListener('click', (e) => {
                    e.preventDefault();
                    settingsManager.toggleTheme();
                });
            }
            
            if (keyboardShortcuts) {
                keyboardShortcuts.addEventListener('click', (e) => {
                    e.preventDefault();
                    settingsManager.showShortcuts();
                });
            }
        }
    }

    markActivePage() {
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop() || 'dashboard.html';
        
        // Remover clase active de todos los enlaces
        const navLinks = document.querySelectorAll('.nav-link, .dropdown-item');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Agregar clase active al enlace actual
        const currentLink = document.querySelector(`a[href="${fileName}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        }
    }
}

// Inicializar el header universal cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new UniversalHeader();
});

// Exportar para uso manual si es necesario
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UniversalHeader;
}

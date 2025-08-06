/**
 * INICIALIZADOR UNIVERSAL GMPI
 * Se ejecuta en todas las páginas para configurar temas, idiomas y funcionalidades globales
 */

// Inicializar configuraciones globales inmediatamente
(function() {
    'use strict';
    
    // Aplicar tema inmediatamente para evitar flash
    const savedTheme = localStorage.getItem('gmpi-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }

    // Aplicar idioma inmediatamente
    const savedLanguage = localStorage.getItem('gmpi-language') || 'es';
    document.documentElement.lang = savedLanguage;
    
    // Función de inicialización universal
    function universalInit() {
        // Inicializar SettingsManager si está disponible
        if (typeof SettingsManager !== 'undefined') {
            window.globalSettingsManager = new SettingsManager();
        }
        
        // Conectar eventos de configuración rápida universal
        connectQuickSettings();
        
        // Marcar página actual como activa en navegación
        markActivePage();
        
        // Configurar eventos de dropdowns
        setupDropdowns();
    }
    
    function connectQuickSettings() {
        // IDs posibles para botones de configuración
        const languageButtons = [
            'quickLanguageToggle', 'languageToggle', 'languageSwitch'
        ];
        const themeButtons = [
            'quickThemeToggle', 'themeToggle', 'themeSwitch'
        ];
        const shortcutButtons = [
            'quickShortcuts', 'keyboardShortcuts'
        ];
        
        // Conectar botones de idioma
        languageButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn && !btn.hasAttribute('data-universal-connected')) {
                btn.setAttribute('data-universal-connected', 'true');
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (window.globalSettingsManager) {
                        window.globalSettingsManager.toggleLanguage();
                    } else {
                        toggleLanguageFallback();
                    }
                });
            }
        });
        
        // Conectar botones de tema
        themeButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn && !btn.hasAttribute('data-universal-connected')) {
                btn.setAttribute('data-universal-connected', 'true');
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (window.globalSettingsManager) {
                        window.globalSettingsManager.toggleTheme();
                    } else {
                        toggleThemeFallback();
                    }
                });
            }
        });
        
        // Conectar botones de atajos
        shortcutButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn && !btn.hasAttribute('data-universal-connected')) {
                btn.setAttribute('data-universal-connected', 'true');
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    if (window.globalSettingsManager) {
                        window.globalSettingsManager.showShortcuts();
                    } else {
                        alert('Atajos de teclado:\nAlt+L: Cambiar idioma\nAlt+T: Cambiar tema');
                    }
                });
            }
        });
    }
    
    function toggleLanguageFallback() {
        const currentLanguage = localStorage.getItem('gmpi-language') || 'es';
        const newLanguage = currentLanguage === 'es' ? 'en' : 'es';
        localStorage.setItem('gmpi-language', newLanguage);
        
        // Actualizar elementos de idioma
        const languageElements = document.querySelectorAll('#quickLanguageText, #currentLanguage');
        languageElements.forEach(element => {
            element.textContent = newLanguage.toUpperCase();
        });
        
        // Actualizar lang del documento
        document.documentElement.lang = newLanguage;
        
        console.log('Idioma cambiado a:', newLanguage);
    }
    
    function toggleThemeFallback() {
        const currentTheme = localStorage.getItem('gmpi-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('gmpi-theme', newTheme);
        
        // Aplicar tema
        document.documentElement.setAttribute('data-theme', newTheme);
        if (newTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
        
        // Actualizar elementos de tema
        const themeElements = document.querySelectorAll('#quickThemeText, #currentTheme');
        const themeIcon = newTheme === 'light' ? '☀️' : '🌙';
        themeElements.forEach(element => {
            element.textContent = themeIcon;
        });
        
        console.log('Tema cambiado a:', newTheme);
    }
    
    function markActivePage() {
        const currentPath = window.location.pathname;
        const fileName = currentPath.split('/').pop() || 'dashboard.html';
        
        // Remover clase active de todos los enlaces
        const navLinks = document.querySelectorAll('.nav-link, .dropdown-item');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        // Agregar clase active al enlace actual
        const currentLink = document.querySelector(`a[href="${fileName}"], a[href="./${fileName}"]`);
        if (currentLink) {
            currentLink.classList.add('active');
        }
    }
    
    function setupDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.nav-link');
            const menu = dropdown.querySelector('.dropdown-content, .dropdown-menu');
            
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
    
    // Inicializar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', universalInit);
    } else {
        universalInit();
    }
    
    // Observer para elementos dinámicos
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Reconectar configuraciones si se agregan elementos nuevos
                        setTimeout(connectQuickSettings, 100);
                    }
                });
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // Atajos de teclado globales
    document.addEventListener('keydown', (e) => {
        if (e.altKey) {
            if (e.key === 'l' || e.key === 'L') {
                e.preventDefault();
                if (window.globalSettingsManager) {
                    window.globalSettingsManager.toggleLanguage();
                } else {
                    toggleLanguageFallback();
                }
            }
            if (e.key === 't' || e.key === 'T') {
                e.preventDefault();
                if (window.globalSettingsManager) {
                    window.globalSettingsManager.toggleTheme();
                } else {
                    toggleThemeFallback();
                }
            }
            if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                if (window.globalSettingsManager) {
                    window.globalSettingsManager.showShortcuts();
                } else {
                    alert('⌨️ Atajos de Teclado GMPI:\n\nAlt+L: Cambiar idioma (ES/EN)\nAlt+T: Cambiar tema (Claro/Oscuro)\nAlt+H: Mostrar esta ayuda\n\nEscape: Cerrar menús desplegables\nCtrl+K: Enfocar búsqueda (si está disponible)');
                }
            }
        }
    });
    
})();

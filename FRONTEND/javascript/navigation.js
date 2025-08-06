/**
 * Sistema de Navegación ISO 9241-11 e ISO 25010:2011
 * Gestión de navegación por teclado, estados de carga y accesibilidad
 */

class NavigationManager {
    constructor() {
        this.currentDropdown = null;
        this.keyboardNavigation = true;
        this.loadingStates = new Map();
        this.focusedElement = null;
        
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupDropdownHandlers();
        this.setupLoadingStates();
        this.setupAccessibilityFeatures();
        this.setupVisualIndicators();
    }

    /**
     * Configuración de navegación por teclado
     * Cumple con ISO 9241-11 para usabilidad de teclado
     */
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const focusedElement = document.activeElement;
            
            switch(e.key) {
                case 'Tab':
                    this.handleTabNavigation(e);
                    break;
                case 'Enter':
                case ' ':
                    this.handleActivation(e, focusedElement);
                    break;
                case 'Escape':
                    this.closeAllDropdowns();
                    break;
                case 'ArrowDown':
                case 'ArrowUp':
                    this.handleArrowNavigation(e, focusedElement);
                    break;
                case 'Home':
                case 'End':
                    this.handleHomeEndNavigation(e, focusedElement);
                    break;
            }
        });
    }

    /**
     * Manejo de navegación con Tab
     */
    handleTabNavigation(e) {
        const menuItems = Array.from(document.querySelectorAll('[role="menuitem"]'));
        const currentIndex = menuItems.findIndex(item => item === document.activeElement);
        
        if (currentIndex !== -1) {
            // Actualizar tabindex para elementos del menú
            menuItems.forEach((item, index) => {
                item.setAttribute('tabindex', index === currentIndex ? '0' : '-1');
            });
        }
    }

    /**
     * Manejo de activación con Enter/Espacio
     */
    handleActivation(e, element) {
        if (element.classList.contains('nav-link') && element.getAttribute('aria-haspopup')) {
            e.preventDefault();
            this.toggleDropdown(element);
        } else if (element.href) {
            this.showLoadingState(element);
        }
    }

    /**
     * Navegación con flechas en menús desplegables
     */
    handleArrowNavigation(e, element) {
        const dropdown = element.closest('.dropdown');
        if (!dropdown) return;

        const dropdownContent = dropdown.querySelector('.dropdown-content');
        const menuItems = Array.from(dropdownContent.querySelectorAll('[role="menuitem"]'));
        const currentIndex = menuItems.findIndex(item => item === element);

        if (currentIndex !== -1) {
            e.preventDefault();
            let nextIndex;
            
            if (e.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % menuItems.length;
            } else {
                nextIndex = currentIndex === 0 ? menuItems.length - 1 : currentIndex - 1;
            }
            
            menuItems[nextIndex].focus();
        }
    }

    /**
     * Navegación con Home/End
     */
    handleHomeEndNavigation(e, element) {
        const dropdown = element.closest('.dropdown');
        if (!dropdown) return;

        const dropdownContent = dropdown.querySelector('.dropdown-content');
        const menuItems = Array.from(dropdownContent.querySelectorAll('[role="menuitem"]'));

        if (menuItems.length > 0) {
            e.preventDefault();
            if (e.key === 'Home') {
                menuItems[0].focus();
            } else {
                menuItems[menuItems.length - 1].focus();
            }
        }
    }

    /**
     * Configuración de manejadores de dropdown
     */
    setupDropdownHandlers() {
        const dropdowns = document.querySelectorAll('.dropdown');
        
        dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.nav-link');
            const content = dropdown.querySelector('.dropdown-content');
            
            // Hover handlers
            dropdown.addEventListener('mouseenter', () => {
                this.openDropdown(trigger);
            });
            
            dropdown.addEventListener('mouseleave', () => {
                this.closeDropdown(trigger);
            });
            
            // Click handlers
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleDropdown(trigger);
            });
            
            // Focus handlers
            trigger.addEventListener('focus', () => {
                this.updateAriaExpanded(trigger, true);
            });
        });
    }

    /**
     * Abrir dropdown
     */
    openDropdown(trigger) {
        this.closeAllDropdowns();
        const dropdown = trigger.closest('.dropdown');
        const content = dropdown.querySelector('.dropdown-content');
        
        dropdown.classList.add('active');
        this.updateAriaExpanded(trigger, true);
        this.currentDropdown = dropdown;
        
        // Enfocar primer elemento del menú
        const firstMenuItem = content.querySelector('[role="menuitem"]');
        if (firstMenuItem) {
            firstMenuItem.setAttribute('tabindex', '0');
        }
    }

    /**
     * Cerrar dropdown
     */
    closeDropdown(trigger) {
        const dropdown = trigger.closest('.dropdown');
        dropdown.classList.remove('active');
        this.updateAriaExpanded(trigger, false);
        
        if (this.currentDropdown === dropdown) {
            this.currentDropdown = null;
        }
    }

    /**
     * Toggle dropdown
     */
    toggleDropdown(trigger) {
        const dropdown = trigger.closest('.dropdown');
        const isOpen = dropdown.classList.contains('active');
        
        if (isOpen) {
            this.closeDropdown(trigger);
        } else {
            this.openDropdown(trigger);
        }
    }

    /**
     * Cerrar todos los dropdowns
     */
    closeAllDropdowns() {
        const activeDropdowns = document.querySelectorAll('.dropdown.active');
        activeDropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('.nav-link');
            this.closeDropdown(trigger);
        });
    }

    /**
     * Actualizar atributo aria-expanded
     */
    updateAriaExpanded(element, expanded) {
        element.setAttribute('aria-expanded', expanded.toString());
        
        // Actualizar flecha visual
        const arrow = element.querySelector('.dropdown-arrow');
        if (arrow) {
            arrow.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }

    /**
     * Estados de carga para navegación
     */
    setupLoadingStates() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.href && !link.getAttribute('aria-haspopup')) {
                    this.showLoadingState(link);
                }
            });
        });
    }

    /**
     * Mostrar estado de carga
     */
    showLoadingState(element) {
        const loadingId = `loading_${Date.now()}`;
        this.loadingStates.set(element, loadingId);
        
        // Agregar clase de carga
        element.classList.add('loading');
        
        // Agregar indicador visual de carga
        const loadingSpinner = document.createElement('span');
        loadingSpinner.className = 'loading-spinner';
        loadingSpinner.innerHTML = '⌛';
        loadingSpinner.setAttribute('aria-hidden', 'true');
        
        element.appendChild(loadingSpinner);
        
        // Actualizar aria-label
        const originalLabel = element.getAttribute('aria-label') || element.textContent;
        element.setAttribute('aria-label', `${originalLabel} - Cargando...`);
        
        // Simular carga y limpiar después de navegación
        setTimeout(() => {
            this.clearLoadingState(element);
        }, 2000);
    }

    /**
     * Limpiar estado de carga
     */
    clearLoadingState(element) {
        element.classList.remove('loading');
        
        const spinner = element.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
        
        // Restaurar aria-label original
        const originalLabel = element.textContent.trim();
        element.setAttribute('aria-label', originalLabel);
        
        this.loadingStates.delete(element);
    }

    /**
     * Configuración de características de accesibilidad
     */
    setupAccessibilityFeatures() {
        // Agregar skip links
        this.addSkipLinks();
        
        // Configurar landmarks
        this.setupLandmarks();
        
        // Configurar live regions
        this.setupLiveRegions();
    }

    /**
     * Agregar enlaces de salto para accesibilidad
     */
    addSkipLinks() {
        const skipLink = document.createElement('a');
        skipLink.href = '#main-content';
        skipLink.className = 'skip-link';
        skipLink.textContent = 'Saltar al contenido principal';
        skipLink.setAttribute('aria-label', 'Saltar navegación e ir al contenido principal');
        
        document.body.insertBefore(skipLink, document.body.firstChild);
    }

    /**
     * Configurar landmarks de navegación
     */
    setupLandmarks() {
        const mainContent = document.querySelector('main') || document.querySelector('.main-content');
        if (mainContent && !mainContent.id) {
            mainContent.id = 'main-content';
        }
    }

    /**
     * Configurar regiones en vivo para anuncios
     */
    setupLiveRegions() {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.className = 'sr-only';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        
        document.body.appendChild(liveRegion);
        this.liveRegion = liveRegion;
    }

    /**
     * Anunciar cambios a lectores de pantalla
     */
    announce(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
            
            // Limpiar después de un tiempo
            setTimeout(() => {
                this.liveRegion.textContent = '';
            }, 3000);
        }
    }

    /**
     * Configurar indicadores visuales
     */
    setupVisualIndicators() {
        // Indicadores de estado activo
        this.updateActiveStates();
        
        // Indicadores de hover mejorados
        this.enhanceHoverStates();
        
        // Indicadores de foco mejorados
        this.enhanceFocusStates();
    }

    /**
     * Actualizar estados activos basados en la página actual
     */
    updateActiveStates() {
        const currentPage = window.location.pathname.split('/').pop();
        const navLinks = document.querySelectorAll('.nav-link, .dropdown-content a');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(currentPage)) {
                link.classList.add('active');
                this.announce(`Página actual: ${link.textContent.trim()}`);
            }
        });
    }

    /**
     * Mejorar estados de hover
     */
    enhanceHoverStates() {
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.classList.add('hover');
            });
            
            item.addEventListener('mouseleave', () => {
                item.classList.remove('hover');
            });
        });
    }

    /**
     * Mejorar estados de foco
     */
    enhanceFocusStates() {
        const focusableElements = document.querySelectorAll('a[role="menuitem"], button, input, select, textarea');
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.classList.add('focused');
                this.focusedElement = element;
            });
            
            element.addEventListener('blur', () => {
                element.classList.remove('focused');
                if (this.focusedElement === element) {
                    this.focusedElement = null;
                }
            });
        });
    }
}

// Inicializar el sistema de navegación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}

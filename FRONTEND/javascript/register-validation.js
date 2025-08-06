/**
 * Sistema de Validación de Registro - Buenas Prácticas
 * Validación en tiempo real, barra de fortaleza, accesibilidad completa
 */

class RegisterValidator {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.progressBar = document.getElementById('progressBar');
        this.progressText = document.getElementById('progressText');
        this.messageContainer = document.getElementById('messageContainer');
        this.registerButton = document.getElementById('registerButton');
        this.cancelButton = document.getElementById('cancelButton');
        
        // Campos del formulario
        this.fields = {
            firstName: document.getElementById('firstName'),
            lastName: document.getElementById('lastName'),
            documentType: document.getElementById('documentType'),
            documentNumber: document.getElementById('documentNumber'),
            email: document.getElementById('email'),
            phone: document.getElementById('phone'),
            position: document.getElementById('position'),
            password: document.getElementById('password'),
            confirmPassword: document.getElementById('confirmPassword'),
            acceptTerms: document.getElementById('acceptTerms'),
            acceptPrivacy: document.getElementById('acceptPrivacy')
        };
        
        // Botones de toggle password
        this.togglePasswordBtn = document.getElementById('togglePassword');
        this.toggleConfirmPasswordBtn = document.getElementById('toggleConfirmPassword');
        
        // Elementos de fortaleza de contraseña
        this.strengthFill = document.getElementById('strengthFill');
        this.strengthText = document.getElementById('strengthText');
        
        // Tracking de completitud
        this.fieldCompleteness = {};
        this.validationRules = this.setupValidationRules();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAccessibility();
        this.setupKeyboardNavigation();
        this.updateProgress();
    }

    /**
     * Configurar reglas de validación
     */
    setupValidationRules() {
        return {
            firstName: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
                message: 'Solo se permiten letras y espacios'
            },
            lastName: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
                message: 'Solo se permiten letras y espacios'
            },
            documentType: {
                required: true,
                message: 'Selecciona un tipo de documento'
            },
            documentNumber: {
                required: true,
                minLength: 6,
                maxLength: 20,
                pattern: /^[0-9]+$/,
                message: 'Solo se permiten números'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Ingresa un correo electrónico válido'
            },
            phone: {
                required: true,
                minLength: 10,
                maxLength: 10,
                pattern: /^[0-9]{10}$/,
                message: 'Ingresa 10 dígitos'
            },
            position: {
                required: true,
                message: 'Selecciona tu cargo'
            },
            password: {
                required: true,
                minLength: 8,
                maxLength: 50,
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                message: 'Debe incluir mayúsculas, minúsculas, números y símbolos'
            },
            confirmPassword: {
                required: true,
                match: 'password',
                message: 'Las contraseñas deben coincidir'
            },
            acceptTerms: {
                required: true,
                message: 'Debes aceptar los términos y condiciones'
            },
            acceptPrivacy: {
                required: true,
                message: 'Debes aceptar las políticas de privacidad'
            }
        };
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Validación en tiempo real para todos los campos
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            
            if (field.type === 'checkbox') {
                field.addEventListener('change', (e) => this.validateFieldRealTime(fieldName, e));
            } else {
                field.addEventListener('input', (e) => this.validateFieldRealTime(fieldName, e));
                field.addEventListener('blur', (e) => this.validateFieldOnBlur(fieldName, e));
            }
        });

        // Validación especial para contraseña (barra de fortaleza)
        this.fields.password.addEventListener('input', (e) => this.updatePasswordStrength(e));
        
        // Toggle password visibility
        this.togglePasswordBtn.addEventListener('click', () => this.togglePasswordVisibility('password'));
        this.toggleConfirmPasswordBtn.addEventListener('click', () => this.togglePasswordVisibility('confirmPassword'));
        
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmission(e));
        
        // Cancel button
        this.cancelButton.addEventListener('click', () => this.handleCancel());
    }

    /**
     * Validación en tiempo real
     */
    validateFieldRealTime(fieldName, event) {
        const field = this.fields[fieldName];
        const value = field.type === 'checkbox' ? field.checked : field.value;
        const rules = this.validationRules[fieldName];
        
        // Limpiar errores previos
        this.clearFieldError(fieldName);
        
        // Validación básica para campos no vacíos
        if (value && value.length > 0) {
            let isValid = true;
            let errorMessage = '';
            
            // Validar patrón
            if (rules.pattern && !rules.pattern.test(value)) {
                isValid = false;
                errorMessage = rules.message;
            }
            
            // Validar longitud mínima
            if (rules.minLength && value.length < rules.minLength) {
                isValid = false;
                errorMessage = `Mínimo ${rules.minLength} caracteres`;
            }
            
            // Validar longitud máxima
            if (rules.maxLength && value.length > rules.maxLength) {
                isValid = false;
                errorMessage = `Máximo ${rules.maxLength} caracteres`;
            }
            
            // Validar coincidencia (para confirmación de contraseña)
            if (rules.match && value !== this.fields[rules.match].value) {
                isValid = false;
                errorMessage = rules.message;
            }
            
            // Actualizar estado visual
            if (isValid) {
                this.setFieldStatus(fieldName, 'success');
                this.fieldCompleteness[fieldName] = true;
            } else {
                this.setFieldStatus(fieldName, 'error');
                this.setFieldError(fieldName, errorMessage);
                this.fieldCompleteness[fieldName] = false;
            }
        } else {
            // Campo vacío
            this.setFieldStatus(fieldName, 'neutral');
            this.fieldCompleteness[fieldName] = false;
        }
        
        this.updateProgress();
    }

    /**
     * Validación al perder el foco
     */
    validateFieldOnBlur(fieldName, event) {
        const field = this.fields[fieldName];
        const value = field.type === 'checkbox' ? field.checked : field.value;
        const rules = this.validationRules[fieldName];
        
        // Validar campo requerido
        if (rules.required && (!value || value.length === 0)) {
            this.setFieldError(fieldName, `Este campo es obligatorio`);
            this.setFieldStatus(fieldName, 'error');
            this.fieldCompleteness[fieldName] = false;
            this.updateProgress();
            return false;
        }
        
        return true;
    }

    /**
     * Actualizar barra de fortaleza de contraseña
     */
    updatePasswordStrength(event) {
        const password = event.target.value;
        let strength = 0;
        let strengthClass = 'weak';
        let strengthLabel = 'Débil';
        
        if (password.length >= 8) strength += 1;
        if (/[a-z]/.test(password)) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[@$!%*?&]/.test(password)) strength += 1;
        
        switch (strength) {
            case 0:
            case 1:
                strengthClass = 'weak';
                strengthLabel = 'Muy débil';
                break;
            case 2:
                strengthClass = 'weak';
                strengthLabel = 'Débil';
                break;
            case 3:
                strengthClass = 'fair';
                strengthLabel = 'Regular';
                break;
            case 4:
                strengthClass = 'good';
                strengthLabel = 'Buena';
                break;
            case 5:
                strengthClass = 'strong';
                strengthLabel = 'Muy fuerte';
                break;
        }
        
        // Actualizar barra visual
        this.strengthFill.className = `strength-fill ${strengthClass}`;
        this.strengthText.textContent = strengthLabel;
        this.strengthText.className = `strength-text ${strengthClass}`;
        
        // Anunciar cambio a lectores de pantalla
        this.announceToScreenReader(`Fortaleza de contraseña: ${strengthLabel}`);
    }

    /**
     * Toggle visibilidad de contraseña
     */
    togglePasswordVisibility(fieldName) {
        const field = this.fields[fieldName];
        const toggleBtn = fieldName === 'password' ? this.togglePasswordBtn : this.toggleConfirmPasswordBtn;
        const toggleIcon = toggleBtn.querySelector('.toggle-icon');
        
        const isPassword = field.type === 'password';
        
        if (isPassword) {
            field.type = 'text';
            toggleIcon.textContent = '🙈';
            toggleBtn.setAttribute('aria-label', `Ocultar ${fieldName === 'password' ? 'contraseña' : 'confirmación de contraseña'}`);
            this.announceToScreenReader(`${fieldName === 'password' ? 'Contraseña' : 'Confirmación de contraseña'} visible`);
        } else {
            field.type = 'password';
            toggleIcon.textContent = '👁️';
            toggleBtn.setAttribute('aria-label', `Mostrar ${fieldName === 'password' ? 'contraseña' : 'confirmación de contraseña'}`);
            this.announceToScreenReader(`${fieldName === 'password' ? 'Contraseña' : 'Confirmación de contraseña'} oculta`);
        }
    }

    /**
     * Actualizar progreso del formulario
     */
    updateProgress() {
        const totalFields = Object.keys(this.fields).length;
        const completedFields = Object.values(this.fieldCompleteness).filter(Boolean).length;
        const percentage = Math.round((completedFields / totalFields) * 100);
        
        this.progressBar.style.width = `${percentage}%`;
        this.progressText.textContent = `${percentage}% completado`;
        
        // Actualizar atributos ARIA
        const progressIndicator = document.querySelector('.progress-indicator');
        progressIndicator.setAttribute('aria-valuenow', percentage);
        
        // Cambiar color de la barra según progreso
        if (percentage < 50) {
            this.progressBar.style.background = 'linear-gradient(90deg, #dc3545, #ffc107)';
        } else if (percentage < 80) {
            this.progressBar.style.background = 'linear-gradient(90deg, #ffc107, #28a745)';
        } else {
            this.progressBar.style.background = 'linear-gradient(90deg, #28a745, #007bff)';
        }
    }

    /**
     * Manejo del envío del formulario
     */
    async handleFormSubmission(event) {
        event.preventDefault();
        
        // Validar todos los campos
        if (!this.validateAllFields()) {
            this.showMessage('error', 'Por favor, completa todos los campos correctamente antes de continuar.');
            this.announceToScreenReader('Formulario contiene errores. Por favor, corrígelos antes de continuar.');
            return;
        }
        
        // Mostrar estado de carga
        this.setLoadingState(true);
        
        try {
            // Simular proceso de registro
            await this.simulateRegistration();
            
            // Mostrar éxito
            this.showRegistrationSuccess();
            
        } catch (error) {
            this.handleRegistrationError(error);
        }
    }

    /**
     * Validar todos los campos
     */
    validateAllFields() {
        let allValid = true;
        
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            const value = field.type === 'checkbox' ? field.checked : field.value;
            const rules = this.validationRules[fieldName];
            
            if (rules.required && (!value || value.length === 0)) {
                this.setFieldError(fieldName, 'Este campo es obligatorio');
                this.setFieldStatus(fieldName, 'error');
                allValid = false;
            } else if (value && value.length > 0) {
                // Validar patrón
                if (rules.pattern && !rules.pattern.test(value)) {
                    this.setFieldError(fieldName, rules.message);
                    this.setFieldStatus(fieldName, 'error');
                    allValid = false;
                }
                
                // Validar coincidencia
                if (rules.match && value !== this.fields[rules.match].value) {
                    this.setFieldError(fieldName, rules.message);
                    this.setFieldStatus(fieldName, 'error');
                    allValid = false;
                }
            }
        });
        
        return allValid;
    }

    /**
     * Simular proceso de registro
     */
    async simulateRegistration() {
        // Simular delay de red
        await this.delay(2000);
        
        // Simular éxito (en caso real, aquí iría la llamada a la API)
        return {
            success: true,
            message: 'Usuario registrado exitosamente'
        };
    }

    /**
     * Mostrar éxito de registro
     */
    showRegistrationSuccess() {
        this.setLoadingState(false);
        
        // Mostrar mensaje de éxito
        this.showMessage('success', '¡Registro exitoso! Tu cuenta ha sido creada correctamente.');
        
        // Anunciar a lectores de pantalla
        this.announceToScreenReader('Registro completado exitosamente. Serás redirigido al inicio de sesión.');
        
        // Actualizar progreso a 100%
        this.progressBar.style.width = '100%';
        this.progressText.textContent = '100% completado ✓';
        
        // Deshabilitar formulario
        this.disableForm();
        
        // Redireccionar después de un momento
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    }

    /**
     * Manejar error de registro
     */
    handleRegistrationError(error) {
        this.setLoadingState(false);
        this.showMessage('error', 'Error al registrar usuario. Por favor, intenta nuevamente.');
        console.error('Registration error:', error);
    }

    /**
     * Manejar cancelación
     */
    handleCancel() {
        if (confirm('¿Estás seguro de que quieres cancelar el registro? Se perderán todos los datos ingresados.')) {
            window.location.href = 'index.html';
        }
    }

    /**
     * Configurar accesibilidad
     */
    setupAccessibility() {
        // Configurar anuncios para lectores de pantalla
        this.setupScreenReaderAnnouncements();
        
        // Configurar gestión de focus
        this.setupFocusManagement();
        
        // Configurar soporte de alto contraste
        this.setupHighContrastSupport();
    }

    /**
     * Configurar navegación por teclado
     */
    setupKeyboardNavigation() {
        const focusableElements = this.form.querySelectorAll(
            'input, select, button, a[href], [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach((element, index) => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && element.type !== 'submit' && element.type !== 'button') {
                    e.preventDefault();
                    const nextElement = focusableElements[index + 1];
                    if (nextElement) {
                        nextElement.focus();
                    }
                }
            });
        });
    }

    /**
     * Configurar anuncios para lectores de pantalla
     */
    setupScreenReaderAnnouncements() {
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.className = 'sr-only';
        document.body.appendChild(this.liveRegion);
    }

    /**
     * Anunciar a lectores de pantalla
     */
    announceToScreenReader(message) {
        if (this.liveRegion) {
            this.liveRegion.textContent = message;
            setTimeout(() => {
                this.liveRegion.textContent = '';
            }, 3000);
        }
    }

    /**
     * Configurar gestión de focus
     */
    setupFocusManagement() {
        const focusableElements = this.form.querySelectorAll('input, select, button');
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.classList.add('focused');
            });
            
            element.addEventListener('blur', () => {
                element.classList.remove('focused');
            });
        });
    }

    /**
     * Configurar soporte para alto contraste
     */
    setupHighContrastSupport() {
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
    }

    /**
     * Establecer estado de error en campo
     */
    setFieldError(fieldName, message) {
        const field = this.fields[fieldName];
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        field.setAttribute('aria-invalid', 'true');
        field.classList.add('error');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    /**
     * Limpiar error de campo
     */
    clearFieldError(fieldName) {
        const field = this.fields[fieldName];
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        field.setAttribute('aria-invalid', 'false');
        field.classList.remove('error');
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    /**
     * Establecer estado visual de campo
     */
    setFieldStatus(fieldName, status) {
        const field = this.fields[fieldName];
        const statusElement = document.getElementById(`${fieldName}-status`);
        
        field.classList.remove('success', 'warning', 'error', 'neutral');
        field.classList.add(status);
        
        if (statusElement) {
            statusElement.className = `input-status ${status}`;
            
            switch (status) {
                case 'success':
                    statusElement.textContent = '✓';
                    break;
                case 'warning':
                    statusElement.textContent = '⚠️';
                    break;
                case 'error':
                    statusElement.textContent = '❌';
                    break;
                default:
                    statusElement.textContent = '';
            }
        }
    }

    /**
     * Mostrar mensaje general
     */
    showMessage(type, message) {
        this.messageContainer.innerHTML = `
            <div class="message ${type}">
                <span class="message-icon" aria-hidden="true">
                    ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <span class="message-text">${message}</span>
            </div>
        `;
        this.messageContainer.style.display = 'block';
        
        // Scroll al mensaje
        this.messageContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-ocultar mensajes exitosos
        if (type === 'success') {
            setTimeout(() => {
                this.messageContainer.style.display = 'none';
            }, 5000);
        }
    }

    /**
     * Establecer estado de carga
     */
    setLoadingState(loading) {
        const btnText = this.registerButton.querySelector('.btn-text');
        const btnLoader = this.registerButton.querySelector('.btn-loader');
        const btnIcon = this.registerButton.querySelector('.btn-icon');
        
        if (loading) {
            this.registerButton.disabled = true;
            this.cancelButton.disabled = true;
            btnText.textContent = 'Registrando...';
            btnLoader.style.display = 'inline-block';
            btnIcon.style.display = 'none';
            this.registerButton.setAttribute('aria-label', 'Registrando usuario, por favor espera');
        } else {
            this.registerButton.disabled = false;
            this.cancelButton.disabled = false;
            btnText.textContent = 'Registrarse';
            btnLoader.style.display = 'none';
            btnIcon.style.display = 'inline-block';
            this.registerButton.setAttribute('aria-label', 'Registrar usuario');
        }
    }

    /**
     * Deshabilitar formulario
     */
    disableForm() {
        Object.values(this.fields).forEach(field => {
            field.disabled = true;
        });
        this.registerButton.disabled = true;
        this.cancelButton.disabled = true;
    }

    /**
     * Utility: Delay promisificado
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.registerValidator = new RegisterValidator();
});

// Agregar estilos adicionales para screen readers
const style = document.createElement('style');
style.textContent = `
    .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
    }
    
    .high-contrast .form-input {
        border-width: 2px;
    }
    
    .high-contrast .btn {
        border-width: 2px;
    }
`;
document.head.appendChild(style);

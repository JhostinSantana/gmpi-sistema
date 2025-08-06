/**
 * Sistema de Validación de Login - Buenas Prácticas ISO
 * Validación en tiempo real, accesibilidad y seguridad
 */

class LoginValidator {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.emailInput = document.getElementById('email');
        this.passwordInput = document.getElementById('password');
        this.toggleButton = document.getElementById('togglePassword');
        this.loginButton = document.getElementById('loginButton');
        this.messageContainer = document.getElementById('messageContainer');
        this.attemptsCounter = document.getElementById('attemptsCounter');
        this.captchaContainer = document.getElementById('captchaContainer');
        this.rememberCheckbox = document.getElementById('rememberUser');
        
        // Security tracking
        this.failedAttempts = 0;
        this.maxAttempts = 3;
        this.lockoutTime = 300000; // 5 minutos
        this.isLocked = false;
        this.captchaRequired = false;
        this.currentCaptcha = null;
        
        // Timing tracking
        this.startTime = Date.now();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAccessibility();
        this.loadRememberedUser();
        this.setAutoFocus();
        this.setupPerformanceTracking();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Validación en tiempo real
        this.emailInput.addEventListener('input', (e) => this.validateEmailRealTime(e));
        this.emailInput.addEventListener('blur', (e) => this.validateEmailOnBlur(e));
        this.passwordInput.addEventListener('input', (e) => this.validatePasswordRealTime(e));
        this.passwordInput.addEventListener('blur', (e) => this.validatePasswordOnBlur(e));
        
        // Toggle password visibility
        this.toggleButton.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        
        // Form submission
        this.form.addEventListener('submit', (e) => this.handleFormSubmission(e));
        
        // Accessibility navigation
        this.setupKeyboardNavigation();
        
        // Remember user checkbox
        this.rememberCheckbox.addEventListener('change', (e) => this.handleRememberUser(e));
    }

    /**
     * Configurar accesibilidad
     */
    setupAccessibility() {
        // Anunciar errores a lectores de pantalla
        this.setupScreenReaderAnnouncements();
        
        // Focus management
        this.setupFocusManagement();
        
        // High contrast support
        this.setupHighContrastSupport();
    }

    /**
     * Validación de email en tiempo real
     */
    validateEmailRealTime(e) {
        const email = e.target.value;
        const emailStatus = document.getElementById('email-status');
        const emailError = document.getElementById('email-error');
        
        // Limpiar errores previos
        this.clearFieldError('email');
        
        if (email.length === 0) {
            this.setFieldStatus('email', 'neutral');
            return;
        }
        
        // Validación básica de formato
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email.length > 0 && email.length < 5) {
            this.setFieldStatus('email', 'warning');
            return;
        }
        
        if (emailRegex.test(email)) {
            this.setFieldStatus('email', 'success');
            emailStatus.textContent = '✓';
            emailStatus.className = 'input-status success';
        } else if (email.length > 5) {
            this.setFieldStatus('email', 'error');
            emailStatus.textContent = '⚠️';
            emailStatus.className = 'input-status error';
        }
    }

    /**
     * Validación de email al perder foco
     */
    validateEmailOnBlur(e) {
        const email = e.target.value;
        
        if (email.length === 0) {
            this.setFieldError('email', 'El correo electrónico es obligatorio');
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.setFieldError('email', 'Ingresa un correo electrónico válido');
            return false;
        }
        
        return true;
    }

    /**
     * Validación de contraseña en tiempo real
     */
    validatePasswordRealTime(e) {
        const password = e.target.value;
        const passwordStatus = document.getElementById('password-status');
        
        this.clearFieldError('password');
        
        if (password.length === 0) {
            this.setFieldStatus('password', 'neutral');
            return;
        }
        
        if (password.length < 6) {
            this.setFieldStatus('password', 'warning');
            passwordStatus.textContent = '⚠️';
            passwordStatus.className = 'input-status warning';
        } else {
            this.setFieldStatus('password', 'success');
            passwordStatus.textContent = '✓';
            passwordStatus.className = 'input-status success';
        }
    }

    /**
     * Validación de contraseña al perder foco
     */
    validatePasswordOnBlur(e) {
        const password = e.target.value;
        
        if (password.length === 0) {
            this.setFieldError('password', 'La contraseña es obligatoria');
            return false;
        }
        
        if (password.length < 6) {
            this.setFieldError('password', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        
        return true;
    }

    /**
     * Toggle de visibilidad de contraseña
     */
    togglePasswordVisibility(e) {
        e.preventDefault();
        
        const isPassword = this.passwordInput.type === 'password';
        const toggleIcon = this.toggleButton.querySelector('.toggle-icon');
        
        if (isPassword) {
            this.passwordInput.type = 'text';
            toggleIcon.textContent = '🙈';
            this.toggleButton.setAttribute('aria-label', 'Ocultar contraseña');
            this.announceToScreenReader('Contraseña visible');
        } else {
            this.passwordInput.type = 'password';
            toggleIcon.textContent = '👁️';
            this.toggleButton.setAttribute('aria-label', 'Mostrar contraseña');
            this.announceToScreenReader('Contraseña oculta');
        }
    }

    /**
     * Manejo del envío del formulario
     */
    async handleFormSubmission(e) {
        e.preventDefault();
        
        if (this.isLocked) {
            this.showMessage('error', 'Cuenta temporalmente bloqueada. Intenta nuevamente más tarde.');
            return;
        }
        
        // Validar formulario completo
        if (!this.validateForm()) {
            this.announceToScreenReader('Formulario contiene errores. Por favor, corrígelos antes de continuar.');
            return;
        }
        
        // Validar captcha si es requerido
        if (this.captchaRequired && !this.validateCaptcha()) {
            this.setFieldError('captcha-input', 'Verificación de seguridad incorrecta');
            return;
        }
        
        await this.performLogin();
    }

    /**
     * Validar formulario completo
     */
    validateForm() {
        const emailValid = this.validateEmailOnBlur({ target: this.emailInput });
        const passwordValid = this.validatePasswordOnBlur({ target: this.passwordInput });
        
        return emailValid && passwordValid;
    }

    /**
     * Realizar login
     */
    async performLogin() {
        const email = this.emailInput.value;
        const password = this.passwordInput.value;
        
        // Mostrar estado de carga
        this.setLoadingState(true);
        
        try {
            // Simular delay realista
            await this.delay(1500);
            
            // Validar credenciales
            if ((email === 'admin@colegio.edu' && password === 'admin123') ||
                (email === 'vic@colegio.edu' && password === 'Vic1234567!')) {
                await this.handleSuccessfulLogin();
            } else {
                this.handleFailedLogin();
            }
        } catch (error) {
            this.handleLoginError(error);
        }
    }

    /**
     * Manejar login exitoso
     */
    async handleSuccessfulLogin() {
        // Guardar usuario si está marcado
        if (this.rememberCheckbox.checked) {
            this.saveRememberedUser();
        }
        
        // Resetear intentos fallidos
        this.resetFailedAttempts();
        
        // Mostrar mensaje de éxito
        this.showMessage('success', '¡Inicio de sesión exitoso! Redirigiendo...');
        this.announceToScreenReader('Inicio de sesión exitoso. Redirigiendo al panel de administración.');
        
        // Calcular tiempo de inicio
        const loginTime = (Date.now() - this.startTime) / 1000;
        console.log(`Tiempo de inicio de sesión: ${loginTime}s`);
        
        // Redireccionar después de un momento
        await this.delay(1500);
        window.location.href = 'dashboard.html';
    }

    /**
     * Manejar login fallido
     */
    handleFailedLogin() {
        this.failedAttempts++;
        this.setLoadingState(false);
        
        // Mostrar mensaje neutral de seguridad
        this.showMessage('error', 'Usuario o contraseña incorrectos. Verifica tus credenciales.');
        
        // Actualizar contador de intentos
        this.updateAttemptsDisplay();
        
        // Verificar si necesita captcha o bloqueo
        if (this.failedAttempts >= 2 && !this.captchaRequired) {
            this.enableCaptcha();
        }
        
        if (this.failedAttempts >= this.maxAttempts) {
            this.lockAccount();
        }
        
        this.announceToScreenReader(`Credenciales incorrectas. Intento ${this.failedAttempts} de ${this.maxAttempts}.`);
    }

    /**
     * Manejar error de login
     */
    handleLoginError(error) {
        this.setLoadingState(false);
        this.showMessage('error', 'Error de conexión. Intenta nuevamente.');
        console.error('Login error:', error);
    }

    /**
     * Habilitar captcha
     */
    enableCaptcha() {
        this.captchaRequired = true;
        this.captchaContainer.style.display = 'block';
        this.generateCaptcha();
        this.announceToScreenReader('Se requiere verificación de seguridad adicional');
    }

    /**
     * Generar captcha
     */
    generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let result;
        let questionText;
        
        switch(operation) {
            case '+':
                result = num1 + num2;
                questionText = `${num1} + ${num2} = ?`;
                break;
            case '-':
                result = Math.max(num1, num2) - Math.min(num1, num2);
                questionText = `${Math.max(num1, num2)} - ${Math.min(num1, num2)} = ?`;
                break;
            case '*':
                result = num1 * num2;
                questionText = `${num1} × ${num2} = ?`;
                break;
        }
        
        this.currentCaptcha = { question: questionText, answer: result };
        document.getElementById('captchaQuestion').textContent = questionText;
        document.getElementById('captcha-input').value = '';
        
        // Setup refresh button
        document.getElementById('captchaRefresh').addEventListener('click', () => {
            this.generateCaptcha();
            this.announceToScreenReader('Nueva verificación de seguridad generada');
        });
    }

    /**
     * Validar captcha
     */
    validateCaptcha() {
        const userAnswer = parseInt(document.getElementById('captcha-input').value);
        return userAnswer === this.currentCaptcha.answer;
    }

    /**
     * Bloquear cuenta
     */
    lockAccount() {
        this.isLocked = true;
        this.showMessage('error', `Cuenta bloqueada por ${this.lockoutTime / 60000} minutos debido a múltiples intentos fallidos.`);
        
        setTimeout(() => {
            this.unlockAccount();
        }, this.lockoutTime);
    }

    /**
     * Desbloquear cuenta
     */
    unlockAccount() {
        this.isLocked = false;
        this.resetFailedAttempts();
        this.showMessage('info', 'Cuenta desbloqueada. Puedes intentar nuevamente.');
    }

    /**
     * Resetear intentos fallidos
     */
    resetFailedAttempts() {
        this.failedAttempts = 0;
        this.captchaRequired = false;
        this.captchaContainer.style.display = 'none';
        this.attemptsCounter.style.display = 'none';
    }

    /**
     * Actualizar display de intentos
     */
    updateAttemptsDisplay() {
        const remaining = this.maxAttempts - this.failedAttempts;
        this.attemptsCounter.style.display = 'block';
        this.attemptsCounter.querySelector('.attempts-text').textContent = 
            `Intentos restantes: ${remaining}`;
    }

    /**
     * Guardar usuario recordado
     */
    saveRememberedUser() {
        if (typeof(Storage) !== "undefined") {
            localStorage.setItem('rememberedUser', this.emailInput.value);
        }
    }

    /**
     * Cargar usuario recordado
     */
    loadRememberedUser() {
        if (typeof(Storage) !== "undefined") {
            const rememberedUser = localStorage.getItem('rememberedUser');
            if (rememberedUser) {
                this.emailInput.value = rememberedUser;
                this.rememberCheckbox.checked = true;
                this.passwordInput.focus(); // Focus en contraseña si email ya está lleno
            }
        }
    }

    /**
     * Configurar auto-focus
     */
    setAutoFocus() {
        // Si no hay usuario recordado, focus en email
        if (!this.emailInput.value) {
            setTimeout(() => {
                this.emailInput.focus();
            }, 100);
        }
    }

    /**
     * Configurar navegación por teclado
     */
    setupKeyboardNavigation() {
        const focusableElements = this.form.querySelectorAll(
            'input, button, a[href], [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach((element, index) => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && element.type !== 'submit') {
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
        // Marcar elementos enfocados
        const focusableElements = this.form.querySelectorAll('input, button');
        
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
     * Soporte para alto contraste
     */
    setupHighContrastSupport() {
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
    }

    /**
     * Configurar tracking de performance
     */
    setupPerformanceTracking() {
        // Marcar tiempo de inicio
        this.startTime = Date.now();
        
        // Tracking de tiempo de primer input
        let firstInputTime = null;
        const inputs = [this.emailInput, this.passwordInput];
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                if (!firstInputTime) {
                    firstInputTime = Date.now();
                    console.log(`Tiempo hasta primer input: ${(firstInputTime - this.startTime) / 1000}s`);
                }
            }, { once: true });
        });
    }

    /**
     * Establecer estado de error en campo
     */
    setFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
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
        const field = document.getElementById(fieldName);
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
        const field = document.getElementById(fieldName);
        
        field.classList.remove('success', 'warning', 'error', 'neutral');
        field.classList.add(status);
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
        
        // Auto-ocultar mensajes exitosos
        if (type === 'success') {
            setTimeout(() => {
                this.messageContainer.style.display = 'none';
            }, 3000);
        }
    }

    /**
     * Establecer estado de carga
     */
    setLoadingState(loading) {
        const btnText = this.loginButton.querySelector('.btn-text');
        const btnLoader = this.loginButton.querySelector('.btn-loader');
        const btnIcon = this.loginButton.querySelector('.btn-icon');
        
        if (loading) {
            this.loginButton.disabled = true;
            btnText.textContent = 'Verificando...';
            btnLoader.style.display = 'inline-block';
            btnIcon.style.display = 'none';
            this.loginButton.setAttribute('aria-label', 'Verificando credenciales, por favor espera');
        } else {
            this.loginButton.disabled = false;
            btnText.textContent = 'Iniciar Sesión';
            btnLoader.style.display = 'none';
            btnIcon.style.display = 'inline-block';
            this.loginButton.setAttribute('aria-label', 'Iniciar sesión');
        }
    }

    /**
     * Manejar checkbox de recordar usuario
     */
    handleRememberUser(e) {
        if (!e.target.checked) {
            localStorage.removeItem('rememberedUser');
        }
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
    window.loginValidator = new LoginValidator();
});

// Agregar clase para screen readers
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
`;
document.head.appendChild(style);

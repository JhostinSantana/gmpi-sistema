/**
 * VALIDACIÓN Y FUNCIONALIDAD DEL FORMULARIO DE CONTACTO
 * Implementa todas las buenas prácticas requeridas
 */

class ContactFormValidator {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.fields = {
            fullName: document.getElementById('fullName'),
            email: document.getElementById('email'),
            subject: document.getElementById('subject'),
            message: document.getElementById('message'),
            institution: document.getElementById('institution'),
            phone: document.getElementById('phone'),
            captchaAnswer: document.getElementById('captcha-answer'),
            notRobot: document.getElementById('notRobot')
        };
        this.messageContainer = document.getElementById('messageContainer');
        this.sendButton = document.getElementById('sendButton');
        this.cancelButton = document.getElementById('cancelButton');
        this.captchaQuestion = document.getElementById('captchaQuestion');
        this.captchaRefresh = document.getElementById('captchaRefresh');
        this.messageCounter = document.getElementById('message-count');
        this.btnLoader = document.getElementById('btnLoader');
        
        // Variables para la validación
        this.currentCaptchaAnswer = 0;
        this.failedAttempts = 0;
        this.isSubmitting = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.generateCaptcha();
        this.setupMessageCounter();
        this.setupKeyboardNavigation();
        this.setupAccessibilityFeatures();
        this.announceToScreenReader('Formulario de contacto cargado correctamente');
    }

    setupEventListeners() {
        // Validación en tiempo real
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field) {
                field.addEventListener('blur', () => this.validateField(fieldName));
                field.addEventListener('input', () => this.clearFieldError(fieldName));
                
                // Validación específica para algunos campos
                if (fieldName === 'email') {
                    field.addEventListener('input', () => this.validateEmailFormat(field));
                }
                if (fieldName === 'phone') {
                    field.addEventListener('input', () => this.formatPhoneNumber(field));
                }
            }
        });

        // Eventos del formulario
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.cancelButton.addEventListener('click', () => this.handleCancel());
        this.captchaRefresh.addEventListener('click', () => this.generateCaptcha());
        
        // Eventos de teclado
        this.form.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    setupMessageCounter() {
        this.fields.message.addEventListener('input', () => {
            const count = this.fields.message.value.length;
            this.messageCounter.textContent = count;
            
            // Cambiar color según el límite
            if (count > 950) {
                this.messageCounter.style.color = 'var(--error-color)';
            } else if (count > 800) {
                this.messageCounter.style.color = 'var(--warning-color)';
            } else {
                this.messageCounter.style.color = 'var(--primary-color)';
            }
        });
    }

    setupKeyboardNavigation() {
        // Mejorar navegación por teclado
        const focusableElements = this.form.querySelectorAll(
            'input, select, textarea, button, [tabindex]:not([tabindex="-1"])'
        );
        
        focusableElements.forEach((element, index) => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    // Lógica adicional para navegación por teclado si es necesaria
                }
            });
        });
    }

    setupAccessibilityFeatures() {
        // Configurar ARIA live regions
        this.messageContainer.setAttribute('aria-live', 'polite');
        this.messageContainer.setAttribute('aria-atomic', 'true');
        
        // Configurar roles adicionales
        this.form.setAttribute('role', 'form');
        
        // Mejorar labels y descripciones
        this.improveFieldAccessibility();
    }

    improveFieldAccessibility() {
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field) {
                // Asegurar que todos los campos tengan aria-describedby
                const helpId = `${fieldName}-help`;
                const errorId = `${fieldName}-error`;
                
                if (document.getElementById(helpId)) {
                    field.setAttribute('aria-describedby', `${helpId} ${errorId}`);
                }
            }
        });
    }

    generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let answer;
        let questionText;
        
        switch (operation) {
            case '+':
                answer = num1 + num2;
                questionText = `¿Cuánto es ${num1} + ${num2}?`;
                break;
            case '-':
                answer = Math.abs(num1 - num2);
                questionText = `¿Cuánto es ${Math.max(num1, num2)} - ${Math.min(num1, num2)}?`;
                break;
            case '*':
                const smallNum1 = Math.floor(Math.random() * 5) + 1;
                const smallNum2 = Math.floor(Math.random() * 5) + 1;
                answer = smallNum1 * smallNum2;
                questionText = `¿Cuánto es ${smallNum1} × ${smallNum2}?`;
                break;
        }
        
        this.currentCaptchaAnswer = answer;
        this.captchaQuestion.textContent = questionText;
        
        // Limpiar respuesta anterior
        this.fields.captchaAnswer.value = '';
        this.clearFieldError('captchaAnswer');
        
        // Anunciar cambio a lectores de pantalla
        this.announceToScreenReader(`Nueva verificación generada: ${questionText}`);
    }

    validateField(fieldName) {
        const field = this.fields[fieldName];
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        switch (fieldName) {
            case 'fullName':
                if (!value) {
                    isValid = false;
                    errorMessage = 'El nombre completo es obligatorio';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'El nombre debe tener al menos 2 caracteres';
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'El nombre solo puede contener letras y espacios';
                }
                break;

            case 'email':
                if (!value) {
                    isValid = false;
                    errorMessage = 'El correo electrónico es obligatorio';
                } else if (!this.isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Ingrese un correo electrónico válido (ej: usuario@dominio.com)';
                }
                break;

            case 'subject':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Debe seleccionar un asunto';
                }
                break;

            case 'message':
                if (!value) {
                    isValid = false;
                    errorMessage = 'El mensaje es obligatorio';
                } else if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'El mensaje debe tener al menos 10 caracteres';
                } else if (value.length > 1000) {
                    isValid = false;
                    errorMessage = 'El mensaje no puede superar los 1000 caracteres';
                }
                break;

            case 'phone':
                if (value && !/^\d{10}$/.test(value.replace(/\s/g, ''))) {
                    isValid = false;
                    errorMessage = 'El teléfono debe tener 10 dígitos';
                }
                break;

            case 'captchaAnswer':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Debe resolver la verificación de seguridad';
                } else if (parseInt(value) !== this.currentCaptchaAnswer) {
                    isValid = false;
                    errorMessage = 'La respuesta es incorrecta. Intente nuevamente';
                }
                break;

            case 'notRobot':
                if (!field.checked) {
                    isValid = false;
                    errorMessage = 'Debe confirmar que no es un robot';
                }
                break;
        }

        this.updateFieldValidation(fieldName, isValid, errorMessage);
        return isValid;
    }

    validateEmailFormat(field) {
        const email = field.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email && !emailRegex.test(email)) {
            this.showFieldError('email', 'Formato de correo inválido');
            this.setFieldStatus('email', 'invalid');
        } else if (email && emailRegex.test(email)) {
            this.clearFieldError('email');
            this.setFieldStatus('email', 'valid');
        }
    }

    formatPhoneNumber(field) {
        let value = field.value.replace(/\D/g, '');
        if (value.length > 10) {
            value = value.substring(0, 10);
        }
        field.value = value;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    updateFieldValidation(fieldName, isValid, errorMessage) {
        const field = this.fields[fieldName];
        
        if (isValid) {
            field.classList.remove('invalid');
            field.classList.add('valid');
            this.setFieldStatus(fieldName, 'valid');
            this.clearFieldError(fieldName);
        } else {
            field.classList.remove('valid');
            field.classList.add('invalid');
            this.setFieldStatus(fieldName, 'invalid');
            this.showFieldError(fieldName, errorMessage);
        }
        
        field.setAttribute('aria-invalid', !isValid);
    }

    setFieldStatus(fieldName, status) {
        const statusElement = document.getElementById(`${fieldName}-status`);
        if (statusElement) {
            statusElement.className = `input-status ${status}`;
        }
    }

    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    clearFieldError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}-error`);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    validateForm() {
        const requiredFields = ['fullName', 'email', 'subject', 'message', 'captchaAnswer', 'notRobot'];
        let isFormValid = true;
        
        requiredFields.forEach(fieldName => {
            const isFieldValid = this.validateField(fieldName);
            if (!isFieldValid) {
                isFormValid = false;
            }
        });
        
        return isFormValid;
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) {
            return;
        }
        
        // Validar formulario completo
        if (!this.validateForm()) {
            this.showMessage('Por favor, corrija los errores antes de enviar el formulario', 'error');
            this.focusFirstInvalidField();
            return;
        }
        
        // Mostrar estado de carga
        this.setSubmitState(true);
        
        try {
            // Simular envío del formulario
            await this.submitForm();
            
            // Mostrar mensaje de éxito
            this.showSuccessMessage();
            
            // Limpiar formulario
            this.resetForm();
            
        } catch (error) {
            this.showMessage('Error al enviar el formulario. Por favor, intente nuevamente.', 'error');
            this.failedAttempts++;
        } finally {
            this.setSubmitState(false);
        }
    }

    async submitForm() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Aquí iría la lógica real de envío
                console.log('Formulario enviado exitosamente');
                resolve();
            }, 2000);
        });
    }

    setSubmitState(isSubmitting) {
        this.isSubmitting = isSubmitting;
        const btnText = this.sendButton.querySelector('.btn-text');
        
        if (isSubmitting) {
            btnText.textContent = 'Enviando...';
            this.btnLoader.style.display = 'inline';
            this.sendButton.disabled = true;
            this.cancelButton.disabled = true;
        } else {
            btnText.textContent = 'Enviar Mensaje';
            this.btnLoader.style.display = 'none';
            this.sendButton.disabled = false;
            this.cancelButton.disabled = false;
        }
    }

    showSuccessMessage() {
        const successMessage = `
            <div class="message success">
                <span aria-hidden="true">✅</span>
                <div>
                    <strong>¡Mensaje enviado exitosamente!</strong><br>
                    Hemos recibido tu consulta y te responderemos en un máximo de 24 horas hábiles.
                    Revisa tu correo electrónico incluyendo la carpeta de spam.
                </div>
            </div>
        `;
        
        this.messageContainer.innerHTML = successMessage;
        this.messageContainer.classList.add('show');
        this.messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Anunciar éxito a lectores de pantalla
        this.announceToScreenReader('Mensaje enviado exitosamente. Te responderemos en 24 horas hábiles.');
    }

    showMessage(message, type = 'info') {
        const icons = {
            success: '✅',
            error: '❌',
            info: 'ℹ️',
            warning: '⚠️'
        };
        
        const messageHTML = `
            <div class="message ${type}">
                <span aria-hidden="true">${icons[type]}</span>
                <div>${message}</div>
            </div>
        `;
        
        this.messageContainer.innerHTML = messageHTML;
        this.messageContainer.classList.add('show');
        this.messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Anunciar a lectores de pantalla
        this.announceToScreenReader(message);
    }

    handleCancel() {
        if (confirm('¿Está seguro de que desea cancelar y limpiar el formulario?')) {
            this.resetForm();
            this.announceToScreenReader('Formulario cancelado y limpiado');
        }
    }

    resetForm() {
        this.form.reset();
        this.messageContainer.innerHTML = '';
        this.messageContainer.classList.remove('show');
        this.messageCounter.textContent = '0';
        this.messageCounter.style.color = 'var(--primary-color)';
        this.generateCaptcha();
        
        // Limpiar estados de validación
        Object.keys(this.fields).forEach(fieldName => {
            const field = this.fields[fieldName];
            if (field) {
                field.classList.remove('valid', 'invalid');
                field.setAttribute('aria-invalid', 'false');
                this.clearFieldError(fieldName);
                this.setFieldStatus(fieldName, '');
            }
        });
        
        // Foco en primer campo
        this.fields.fullName.focus();
    }

    focusFirstInvalidField() {
        const invalidField = this.form.querySelector('.invalid');
        if (invalidField) {
            invalidField.focus();
            invalidField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    handleKeyDown(e) {
        // Enviar con Ctrl+Enter
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.handleSubmit(e);
        }
        
        // Escape para cancelar
        if (e.key === 'Escape') {
            if (this.isSubmitting) {
                return;
            }
            this.handleCancel();
        }
    }

    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ContactFormValidator();
});

// Funciones adicionales para mejorar la experiencia
document.addEventListener('DOMContentLoaded', () => {
    // Mejorar la experiencia del usuario con animaciones suaves
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Observar secciones del formulario
    document.querySelectorAll('.form-section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(section);
    });
    
    // Mejorar el contraste en modo alto contraste
    if (window.matchMedia('(prefers-contrast: high)').matches) {
        document.documentElement.style.setProperty('--border-color', '#000');
        document.documentElement.style.setProperty('--text-secondary', '#333');
    }
    
    // Reducir animaciones si el usuario lo prefiere
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition', 'none');
    }
});

// Manejo del estado de la conexión
window.addEventListener('online', () => {
    console.log('Conexión restaurada');
});

window.addEventListener('offline', () => {
    console.log('Sin conexión a internet');
    const messageContainer = document.getElementById('messageContainer');
    if (messageContainer) {
        messageContainer.innerHTML = `
            <div class="message warning">
                <span aria-hidden="true">⚠️</span>
                <div>Sin conexión a internet. Verifique su conexión antes de enviar el formulario.</div>
            </div>
        `;
        messageContainer.classList.add('show');
    }
});

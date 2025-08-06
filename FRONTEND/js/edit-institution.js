// Edit Institution Form JavaScript
class EditInstitutionForm {
    constructor() {
        this.form = document.getElementById('editInstitutionForm');
        this.originalData = {};
        this.modifiedFields = new Set();
        this.isSubmitting = false;
        this.criticalFields = ['email', 'phone', 'institutionName'];
        this.pendingCriticalField = null;
        
        this.init();
    }

    init() {
        this.loadOriginalData();
        this.setupEventListeners();
        this.setupValidation();
        this.updateChangeStatus();
        this.populateForm();
    }

    loadOriginalData() {
        // Datos precargados de la institución (simulación de datos del backend)
        this.originalData = {
            institutionName: 'Universidad Laica Eloy Alfaro de Manabí',
            institutionCode: 'INST-001',
            institutionType: 'university',
            address: 'Av. Circunvalación, Vía San Mateo, Manta, Ecuador',
            city: 'Manta',
            province: 'manabi',
            buildings: '8',
            classrooms: '45',
            laboratories: '12',
            email: 'info@ulaem.edu.ec',
            phone: '(05) 262-3740',
            website: 'https://www.ulaem.edu.ec'
        };
    }

    populateForm() {
        // Llenar el formulario con los datos originales
        Object.keys(this.originalData).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                field.value = this.originalData[key];
                // Marcar como no modificado inicialmente
                field.classList.remove('modified');
            }
        });
    }

    setupEventListeners() {
        // Listeners para cambios en los campos
        const formInputs = this.form.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', (e) => this.handleFieldChange(e));
            input.addEventListener('change', (e) => this.handleFieldChange(e));
            input.addEventListener('blur', (e) => this.validateField(e.target));
        });

        // Listeners para botones
        document.getElementById('updateButton').addEventListener('click', (e) => this.handleSave(e));
        document.getElementById('cancelButton').addEventListener('click', (e) => this.handleCancel(e));
        
        // Listeners para cerrar modales
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => this.closeModal(e.target.closest('.modal')));
        });

        // Listeners para modal de confirmación
        document.getElementById('modalConfirm').addEventListener('click', () => this.confirmSave());
        document.getElementById('modalCancel').addEventListener('click', () => this.closeModal(document.getElementById('confirmModal')));

        // Listeners para modal de campo crítico
        document.getElementById('criticalModalConfirm').addEventListener('click', () => this.confirmCriticalChange());
        document.getElementById('criticalModalCancel').addEventListener('click', () => this.cancelCriticalChange());

        // Listeners para modal de éxito
        document.getElementById('continueEditing').addEventListener('click', () => this.continueEditing());
        document.getElementById('backToList').addEventListener('click', () => this.backToList());
        document.getElementById('successModalClose').addEventListener('click', () => this.closeModal(document.getElementById('successModal')));

        // Prevenir envío accidental del formulario
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSave(e);
        });

        // Advertir sobre cambios no guardados
        window.addEventListener('beforeunload', (e) => {
            if (this.modifiedFields.size > 0 && !this.isSubmitting) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    handleFieldChange(event) {
        const field = event.target;
        const fieldName = field.id;
        const currentValue = field.value;
        const originalValue = this.originalData[fieldName];

        // Verificar si es un campo crítico que se está modificando
        if (this.criticalFields.includes(fieldName) && currentValue !== originalValue && currentValue !== '') {
            // Si es la primera vez que se modifica este campo crítico
            if (!this.modifiedFields.has(fieldName)) {
                this.pendingCriticalField = { field, fieldName, currentValue, originalValue };
                this.showCriticalFieldWarning(fieldName);
                return;
            }
        }

        // Marcar como modificado si el valor cambió
        if (currentValue !== originalValue) {
            this.modifiedFields.add(fieldName);
            field.classList.add('modified');
        } else {
            this.modifiedFields.delete(fieldName);
            field.classList.remove('modified');
        }

        // Actualizar indicador de estado
        this.updateChangeStatus();
        
        // Validar campo en tiempo real
        this.validateField(field);
    }

    showCriticalFieldWarning(fieldName) {
        const modal = document.getElementById('criticalModal');
        const message = modal.querySelector('.modal-body p');
        
        let fieldDisplayName = '';
        switch(fieldName) {
            case 'email':
                fieldDisplayName = 'correo electrónico';
                break;
            case 'phone':
                fieldDisplayName = 'teléfono';
                break;
            case 'institutionName':
                fieldDisplayName = 'nombre de la institución';
                break;
        }
        
        message.textContent = `Está modificando un campo crítico (${fieldDisplayName}). Este cambio puede afectar las operaciones de la institución.`;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    confirmCriticalChange() {
        if (this.pendingCriticalField) {
            const { field, fieldName, currentValue, originalValue } = this.pendingCriticalField;
            
            // Procesar el cambio
            if (currentValue !== originalValue) {
                this.modifiedFields.add(fieldName);
                field.classList.add('modified');
            } else {
                this.modifiedFields.delete(fieldName);
                field.classList.remove('modified');
            }
            
            this.updateChangeStatus();
            this.validateField(field);
            this.pendingCriticalField = null;
        }
        
        this.closeModal(document.getElementById('criticalModal'));
    }

    cancelCriticalChange() {
        if (this.pendingCriticalField) {
            const { field, originalValue } = this.pendingCriticalField;
            
            // Revertir el valor
            field.value = originalValue;
            field.classList.remove('modified');
            this.pendingCriticalField = null;
        }
        
        this.closeModal(document.getElementById('criticalModal'));
    }

    validateField(field) {
        const fieldName = field.id;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remover clases anteriores
        field.classList.remove('error', 'valid');
        this.hideFieldError(fieldName);

        // Validaciones específicas por campo
        switch (fieldName) {
            case 'institutionName':
                if (!value) {
                    isValid = false;
                    errorMessage = 'El nombre de la institución es obligatorio';
                } else if (value.length < 3) {
                    isValid = false;
                    errorMessage = 'El nombre debe tener al menos 3 caracteres';
                } else if (value.length > 100) {
                    isValid = false;
                    errorMessage = 'El nombre no puede exceder 100 caracteres';
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'El nombre solo puede contener letras y espacios';
                }
                break;

            case 'institutionType':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Debe seleccionar un tipo de institución';
                }
                break;

            case 'address':
                if (!value) {
                    isValid = false;
                    errorMessage = 'La dirección es obligatoria';
                } else if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'La dirección debe ser más específica (mínimo 10 caracteres)';
                } else if (value.length > 200) {
                    isValid = false;
                    errorMessage = 'La dirección no puede exceder 200 caracteres';
                }
                break;

            case 'city':
                if (!value) {
                    isValid = false;
                    errorMessage = 'La ciudad es obligatoria';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'El nombre de la ciudad debe tener al menos 2 caracteres';
                } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'El nombre de la ciudad solo puede contener letras y espacios';
                }
                break;

            case 'province':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Debe seleccionar una provincia';
                }
                break;

            case 'buildings':
                if (!value) {
                    isValid = false;
                    errorMessage = 'La cantidad de edificios es obligatoria';
                } else if (!this.isValidNumber(value) || parseInt(value) < 1 || parseInt(value) > 100) {
                    isValid = false;
                    errorMessage = 'Debe ser un número entre 1 y 100';
                }
                break;

            case 'classrooms':
                if (!value) {
                    isValid = false;
                    errorMessage = 'La cantidad de aulas es obligatoria';
                } else if (!this.isValidNumber(value) || parseInt(value) < 1 || parseInt(value) > 1000) {
                    isValid = false;
                    errorMessage = 'Debe ser un número entre 1 y 1000';
                }
                break;

            case 'laboratories':
                if (value && (!this.isValidNumber(value) || parseInt(value) < 0 || parseInt(value) > 100)) {
                    isValid = false;
                    errorMessage = 'Debe ser un número entre 0 y 100';
                }
                break;

            case 'email':
                if (!value) {
                    isValid = false;
                    errorMessage = 'El correo electrónico es obligatorio';
                } else if (!this.isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'El formato del correo electrónico no es válido';
                } else if (value.length > 100) {
                    isValid = false;
                    errorMessage = 'El correo electrónico no puede exceder 100 caracteres';
                }
                break;

            case 'phone':
                if (!value) {
                    isValid = false;
                    errorMessage = 'El teléfono es obligatorio';
                } else if (!this.isValidPhone(value)) {
                    isValid = false;
                    errorMessage = 'El formato del teléfono no es válido (ej: (02) 123-4567)';
                }
                break;

            case 'website':
                if (value && !this.isValidURL(value)) {
                    isValid = false;
                    errorMessage = 'El formato de la URL no es válido (debe incluir http:// o https://)';
                }
                break;
        }

        // Aplicar resultado de validación
        if (isValid) {
            field.classList.add('valid');
        } else {
            field.classList.add('error');
            this.showFieldError(fieldName, errorMessage);
        }

        return isValid;
    }

    showFieldError(fieldName, message) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('show');
            
            // Agregar animación de shake al campo
            const field = document.getElementById(fieldName);
            if (field) {
                field.classList.add('shake');
                setTimeout(() => {
                    field.classList.remove('shake');
                }, 500);
            }
        } else {
            // Si no existe el elemento de error, crear uno dinámicamente
            const field = document.getElementById(fieldName);
            if (field) {
                const errorDiv = document.createElement('div');
                errorDiv.id = `${fieldName}Error`;
                errorDiv.className = 'field-error show';
                errorDiv.textContent = message;
                field.parentNode.insertBefore(errorDiv, field.nextSibling);
            }
        }
    }

    hideFieldError(fieldName) {
        const errorElement = document.getElementById(`${fieldName}Error`);
        if (errorElement) {
            errorElement.classList.remove('show');
        }
    }

    showNotification(message, type = 'info') {
        // Crear notificación dinámica
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'error' ? '❌' : 
                      type === 'success' ? '✅' : 
                      type === 'warning' ? '⚠️' : 'ℹ️'}
                </span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        // Posicionar en la parte superior derecha
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
            padding: 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInRight 0.3s ease-out;
        `;
        
        // Colores según tipo
        switch(type) {
            case 'error':
                notification.style.backgroundColor = '#fee2e2';
                notification.style.borderLeft = '4px solid #dc2626';
                notification.style.color = '#991b1b';
                break;
            case 'success':
                notification.style.backgroundColor = '#dcfce7';
                notification.style.borderLeft = '4px solid #16a34a';
                notification.style.color = '#166534';
                break;
            case 'warning':
                notification.style.backgroundColor = '#fef3c7';
                notification.style.borderLeft = '4px solid #d97706';
                notification.style.color = '#92400e';
                break;
            default:
                notification.style.backgroundColor = '#dbeafe';
                notification.style.borderLeft = '4px solid #2563eb';
                notification.style.color = '#1d4ed8';
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    isValidPhone(phone) {
        // Acepta formatos como: (02) 123-4567, 02-123-4567, 0999123456, +593 99 123 4567
        const phoneRegex = /^(\+593\s?)?(\(?\d{1,3}\)?[\s\-]?)?\d{3,4}[\s\-]?\d{3,4}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    isValidEmail(email) {
        // Validación más estricta para emails institucionales
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    isValidURL(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    isValidNumber(value) {
        return !isNaN(value) && !isNaN(parseFloat(value)) && isFinite(value);
    }

    updateChangeStatus() {
        const noChangesStatus = document.getElementById('noChangesStatus');
        const changeStatus = document.getElementById('changeStatus');

        if (this.modifiedFields.size === 0) {
            // No hay cambios
            noChangesStatus.style.display = 'block';
            changeStatus.style.display = 'none';
        } else {
            // Hay cambios
            noChangesStatus.style.display = 'none';
            changeStatus.style.display = 'block';
            
            const statusText = changeStatus.querySelector('.status-text');
            const changeCount = this.modifiedFields.size;
            const changesText = changeCount === 1 ? 'cambio detectado' : 'cambios detectados';
            statusText.textContent = `${changeCount} ${changesText} - Los campos modificados están resaltados`;
        }

        // Actualizar translations si existe el sistema
        if (window.settingsManager) {
            window.settingsManager.updateTranslations();
        }
    }

    validateForm() {
        const formInputs = this.form.querySelectorAll('input, select, textarea');
        let isValid = true;
        const errors = [];

        formInputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
                const label = document.querySelector(`label[for="${input.id}"]`);
                const fieldName = label ? label.textContent.replace('*', '').trim() : input.id;
                errors.push({ id: input.id, name: fieldName, element: input });
            }
        });

        return { isValid, errors };
    }

    handleSave(event) {
        event.preventDefault();
        
        if (this.isSubmitting) {
            return;
        }

        const validation = this.validateForm();
        if (!validation.isValid) {
            this.showValidationErrors(validation.errors);
            return;
        }

        if (this.modifiedFields.size === 0) {
            this.showNotification('No se han detectado cambios para guardar', 'warning');
            return;
        }

        this.showConfirmationModal();
    }

    showValidationErrors(errors) {
        // Mostrar notificación de error general
        this.showNotification(
            `Se encontraron ${errors.length} error(es). Por favor, revisa los campos marcados.`, 
            'error'
        );
        
        // Scroll al primer error
        if (errors.length > 0) {
            const firstError = errors[0].element;
            firstError.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            
            // Focus en el primer campo con error después de un pequeño delay
            setTimeout(() => {
                firstError.focus();
            }, 300);
        }
    }

    showNoChangesMessage() {
        // Mostrar mensaje de que no hay cambios
        const statusElement = document.getElementById('changeStatus');
        const originalClass = statusElement.className;
        statusElement.className = 'change-status pulse';
        
        setTimeout(() => {
            statusElement.className = originalClass;
        }, 2000);
    }

    showConfirmationModal() {
        const modal = document.getElementById('confirmModal');
        const changesList = document.getElementById('changesList');
        
        // Generar lista de cambios
        const changes = Array.from(this.modifiedFields).map(fieldName => {
            const field = document.getElementById(fieldName);
            const label = document.querySelector(`label[for="${fieldName}"]`).textContent.replace('*', '').trim();
            const newValue = field.value;
            const oldValue = this.originalData[fieldName];
            
            return `<li><strong>${label}:</strong> "${oldValue}" → "${newValue}"</li>`;
        }).join('');
        
        changesList.innerHTML = changes;
        
        // Mostrar modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    handleCancel(event) {
        event.preventDefault();
        
        if (this.modifiedFields.size > 0) {
            // Mostrar modal de confirmación personalizado
            this.showCancelConfirmation();
        } else {
            // Si no hay cambios, regresar directamente
            this.backToList();
        }
    }

    showCancelConfirmation() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header warning">
                    <h3>⚠️ Confirmar Cancelación</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <p>Tienes <strong>${this.modifiedFields.size}</strong> cambio(s) sin guardar.</p>
                    <p>¿Estás seguro de que deseas cancelar? Se perderán todos los cambios realizados.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Continuar Editando</button>
                    <button class="btn btn-danger" onclick="editFormInstance.confirmCancel(); this.closest('.modal').remove();">Sí, Cancelar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
    }

    confirmCancel() {
        // Limpiar cambios y regresar
        this.modifiedFields.clear();
        this.backToList();
    }

    confirmSave() {
        this.isSubmitting = true;
        
        // Simular guardado
        this.showLoadingState();
        
        setTimeout(() => {
            this.completeSave();
        }, 2000);
    }

    showLoadingState() {
        const saveBtn = document.getElementById('updateButton');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span>💾</span> Guardando...';
        saveBtn.disabled = true;
        
        const cancelBtn = document.getElementById('cancelButton');
        cancelBtn.disabled = true;
        
        // Mostrar notificación de guardado
        this.showNotification('Guardando cambios...', 'info');
    }

    completeSave() {
        // Cerrar modal de confirmación
        this.closeModal(document.getElementById('confirmModal'));
        
        // Actualizar datos originales
        this.originalData = this.getCurrentFormData();
        this.modifiedFields.clear();
        
        // Limpiar estados visuales
        this.form.querySelectorAll('.modified').forEach(field => {
            field.classList.remove('modified');
        });
        
        // Actualizar estado
        this.updateChangeStatus();
        
        // Mostrar notificación de éxito
        this.showNotification('✅ Los cambios han sido guardados exitosamente', 'success');
        
        // Mostrar modal de éxito
        this.showSuccessModal();
        
        // Restaurar botones
        this.restoreButtonState();
        
        this.isSubmitting = false;
    }

    getCurrentFormData() {
        const formData = {};
        const formInputs = this.form.querySelectorAll('input, select, textarea');
        
        formInputs.forEach(input => {
            formData[input.id] = input.value;
        });
        
        return formData;
    }

    restoreButtonState() {
        const saveBtn = document.getElementById('updateButton');
        saveBtn.innerHTML = '<span>💾</span> <span data-translate="edit.save_changes">Guardar cambios</span>';
        saveBtn.disabled = false;
        
        const cancelBtn = document.getElementById('cancelButton');
        cancelBtn.disabled = false;
    }

    showSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    saveAndNew() {
        this.closeModal(document.getElementById('successModal'));
        // Resetear formulario para nueva institución
        this.resetForm();
    }

    backToList() {
        window.location.href = 'infraestructuras.html';
    }

    resetForm() {
        this.form.reset();
        this.modifiedFields.clear();
        this.form.querySelectorAll('.modified, .error, .valid').forEach(field => {
            field.classList.remove('modified', 'error', 'valid');
        });
        this.form.querySelectorAll('.field-error').forEach(error => {
            error.classList.remove('show');
        });
        this.updateChangeStatus();
    }

    closeModal(modal) {
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    showConfirmationModal() {
        const modal = document.getElementById('confirmModal');
        const changesSummary = document.getElementById('changesSummary');
        
        // Generar lista de cambios
        const changes = Array.from(this.modifiedFields).map(fieldName => {
            const field = document.getElementById(fieldName);
            const label = document.querySelector(`label[for="${fieldName}"]`).textContent.replace('*', '').trim();
            const newValue = field.value;
            const oldValue = this.originalData[fieldName];
            
            return `<li><strong>${label}:</strong><br>
                    <span style="color: #e74c3c;">Anterior: "${oldValue || 'Sin valor'}"</span><br>
                    <span style="color: #27ae60;">Nuevo: "${newValue || 'Sin valor'}"</span></li>`;
        }).join('');
        
        changesSummary.innerHTML = `
            <h4>Cambios a realizar:</h4>
            <ul style="margin: 10px 0; padding-left: 20px;">
                ${changes}
            </ul>
        `;
        
        // Mostrar modal
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    confirmSave() {
        this.isSubmitting = true;
        
        // Simular guardado con progress
        this.showLoadingState();
        
        // Simular delay del servidor
        setTimeout(() => {
            this.completeSave();
        }, 2000);
    }

    showLoadingState() {
        const saveBtn = document.getElementById('updateButton');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span>⏳</span> Guardando cambios...';
        saveBtn.disabled = true;
        
        const cancelBtn = document.getElementById('cancelButton');
        cancelBtn.disabled = true;
        
        // Guardar texto original para restaurar después
        saveBtn.dataset.originalText = originalText;
    }

    completeSave() {
        // Cerrar modal de confirmación
        this.closeModal(document.getElementById('confirmModal'));
        
        // Actualizar datos originales con los nuevos valores
        this.originalData = this.getCurrentFormData();
        this.modifiedFields.clear();
        
        // Limpiar estados visuales
        this.form.querySelectorAll('.modified').forEach(field => {
            field.classList.remove('modified');
            field.classList.add('valid');
        });
        
        // Actualizar estado
        this.updateChangeStatus();
        
        // Mostrar modal de éxito
        this.showSuccessModal();
        
        // Restaurar botones
        this.restoreButtonState();
        
        this.isSubmitting = false;
    }

    getCurrentFormData() {
        const formData = {};
        const formInputs = this.form.querySelectorAll('input, select, textarea');
        
        formInputs.forEach(input => {
            if (input.type !== 'hidden') {
                formData[input.id] = input.value;
            }
        });
        
        return formData;
    }

    restoreButtonState() {
        const saveBtn = document.getElementById('updateButton');
        const originalText = saveBtn.dataset.originalText || 'Actualizar Institución';
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        
        const cancelBtn = document.getElementById('cancelButton');
        cancelBtn.disabled = false;
    }

    showSuccessModal() {
        const modal = document.getElementById('successModal');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    continueEditing() {
        this.closeModal(document.getElementById('successModal'));
        // Foco en el primer campo para continuar editando
        document.getElementById('institutionName').focus();
    }

    backToList() {
        window.location.href = 'infraestructuras.html';
    }
}

// Variable global para acceder a la instancia
let editFormInstance;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    editFormInstance = new EditInstitutionForm();
    window.editFormInstance = editFormInstance;
});

// Funciones auxiliares para navegación
function goBack() {
    if (window.editForm && window.editForm.modifiedFields.size > 0) {
        const confirmLeave = confirm('¿Está seguro de que desea salir? Se perderán todos los cambios no guardados.');
        if (!confirmLeave) {
            return;
        }
    }
    window.history.back();
}

function goToInfrastructure() {
    if (window.editForm && window.editForm.modifiedFields.size > 0) {
        const confirmLeave = confirm('¿Está seguro de que desea salir? Se perderán todos los cambios no guardados.');
        if (!confirmLeave) {
            return;
        }
    }
    window.location.href = 'infraestructuras.html';
}

// Exponer instancia globalmente para acceso desde navegación
window.addEventListener('load', () => {
    if (window.editFormInstance) {
        window.editForm = window.editFormInstance;
    }
});

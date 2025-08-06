/**
 * SISTEMA DE CONFIGURACIÓN GMPI UNIVERSAL
 * Maneja idiomas, temas y atajos de teclado en todas las páginas
 */

class SettingsManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('gmpi-language') || 'es';
        this.currentTheme = localStorage.getItem('gmpi-theme') || 'light';
        this.translations = {};
        this.shortcuts = {};
        
        this.init();
    }

    init() {
        this.loadTranslations();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.applyTheme();
        this.applyLanguage();
        this.updateUI();
        this.updateLanguageDisplay();
        this.updateThemeDisplay();
        
        // Conectar botones de configuración en todas las páginas
        this.connectUniversalButtons();
        
        // Observer para elementos dinámicos
        this.setupMutationObserver();
    }

    setupMutationObserver() {
        // Observar cambios en el DOM para aplicar configuraciones a elementos nuevos
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            this.applyLanguageToElement(node);
                            this.connectUniversalButtons();
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    connectUniversalButtons() {
        // Conectar todos los posibles botones de configuración en todas las páginas
        const languageButtons = [
            'quickLanguageToggle', 'languageToggle', 'languageSwitch'
        ];
        const themeButtons = [
            'quickThemeToggle', 'themeToggle', 'themeSwitch'
        ];
        const shortcutButtons = [
            'quickShortcuts', 'keyboardShortcuts'
        ];

        languageButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn && !btn.hasAttribute('data-settings-connected')) {
                btn.setAttribute('data-settings-connected', 'true');
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleLanguage();
                });
            }
        });

        themeButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn && !btn.hasAttribute('data-settings-connected')) {
                btn.setAttribute('data-settings-connected', 'true');
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleTheme();
                });
            }
        });

        shortcutButtons.forEach(id => {
            const btn = document.getElementById(id);
            if (btn && !btn.hasAttribute('data-settings-connected')) {
                btn.setAttribute('data-settings-connected', 'true');
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showShortcuts();
                });
            }
        });
    }

    loadTranslations() {
        this.translations = {
            es: {
                // Navegación
                'dashboard': 'Panel de Control',
                'management': 'Gestión',
                'planning': 'Planificación',
                'configuration': 'Configuración',
                'help': 'Ayuda',
                'logout': 'Cerrar Sesión',
                'welcome': 'Bienvenido, Inspector',
                
                // Gestión
                'maintenance': 'Mantenimientos',
                'infrastructures': 'Infraestructuras',
                'reports': 'Reportes',
                
                // Planificación
                'calendar': 'Calendario',
                'schedules': 'Cronogramas',
                'alerts': 'Alertas',
                
                // Ayuda
                'contact': 'Contacto',
                'faq': 'Preguntas Frecuentes',
                'shortcuts': 'Atajos de Teclado',
                
                // Configuración
                'language': 'Idioma',
                'theme': 'Tema',
                'spanish': 'Español',
                'english': 'Inglés',
                'light': 'Claro',
                'dark': 'Oscuro',
                
                // Hero Section
                'hero_title': 'Mantén tus infraestructuras escolares en perfecto estado',
                'hero_subtitle': 'La plataforma integral para gestionar el mantenimiento preventivo de instalaciones educativas. Desde pequeñas escuelas hasta grandes complejos universitarios.',
                
                // Login Page
                'login_title': 'Iniciar Sesión',
                'login_subtitle': 'Accede a tu panel de administración',
                'email_label': 'Correo Electrónico',
                'password_label': 'Contraseña',
                'remember_me': 'Recordar usuario',
                'forgot_password': '¿Olvidaste tu contraseña?',
                'login_button': 'Iniciar Sesión',
                'register_link': '¿No tienes cuenta? Regístrate aquí',
                'create_account': 'Crear Cuenta Nueva',
                'back_to_login': 'Regresar al inicio de sesión',
                'email_help': 'Ingresa tu correo electrónico institucional',
                'password_help': 'Mínimo 6 caracteres',
                'remember_help': 'Tu usuario se guardará de forma segura en este dispositivo',
                'login_help': 'Tiempo promedio de inicio: menos de 5 segundos',
                'accessibility_info': 'Este formulario es compatible con lectores de pantalla y navegación por teclado.',
                'accessibility_navigation': 'Use Tab para navegar, Enter para enviar, y Space para activar controles.',
                'system_title': 'Gestor de Mantenimiento Preventivo',
                'system_subtitle': 'Infraestructuras Escolares',
                'visual_title': 'Mantén tus instalaciones educativas en perfecto estado',
                'visual_subtitle': 'Sistema para gestionar preventivamente el mantenimiento escolar',
                'feature_reports': 'Reportes en Tiempo Real',
                'feature_reports_desc': 'Monitorea el estado de todas tus instalaciones',
                'feature_maintenance': 'Mantenimiento Programado',
                'feature_maintenance_desc': 'Automatiza las tareas de mantenimiento preventivo',
                'feature_campus': 'Multi-Campus',
                'feature_campus_desc': 'Gestiona múltiples sedes desde un solo lugar',
                'feature_mobile': 'Acceso Móvil',
                'feature_mobile_desc': 'Supervisa desde cualquier dispositivo',
                
                // Infrastructure Page
                'registered_infrastructures': 'Infraestructuras Registradas',
                'infrastructure_subtitle': 'Gestiona y supervisa todas las instituciones educativas del sistema',
                'educational_institutions': 'Instituciones Educativas',
                'add_institution': '+ Agregar Institución',
                'buildings': 'Edificios',
                'classrooms': 'Aulas',
                'laboratories': 'Laboratorios',
                'last_maintenance': 'Último Mantenimiento:',
                'next_maintenance': 'Próximo Mantenimiento:',
                'view_details': 'Ver Detalles',
                'manage': 'Gestionar',
                
                // Institution Types
                'public_university': 'Universidad Pública',
                'public_school': 'Colegio público',
                
                // Institution Locations
                'manta_manabi': 'Manta, Manabí, Ecuador',
                'quito_pichincha': 'Quito, Pichincha, Ecuador',
                
                // Contact Page
                'contact_title': 'Contáctanos',
                'contact_instructions': 'Completa este formulario para enviarnos tu consulta, sugerencia o reporte de problema.',
                'contact_info': 'Solo necesitamos la información básica para poder responderte adecuadamente.',
                'response_time': 'Tiempo de respuesta: Responderemos en un máximo de 24 horas hábiles.',
                'full_name': 'Nombre Completo',
                'email': 'Correo Electrónico',
                'subject': 'Asunto',
                'message': 'Mensaje',
                'institution': 'Institución Educativa',
                'phone': 'Teléfono de Contacto',
                'send_button': 'Enviar Mensaje',
                'cancel_button': 'Cancelar',
                
                // Register Page
                'register_title': 'Crear Cuenta',
                'register_subtitle': 'Únete al sistema de gestión de mantenimiento',
                'personal_data': 'Datos Personales',
                'contact_info': 'Información de Contacto',
                'credentials': 'Credenciales',
                'terms': 'Términos y Condiciones',
                'create_account': 'Crear Cuenta',
                'back_to_login': 'Regresar al inicio de sesión',
                'new_user_register': 'Registro de Nuevo Usuario',
                'register_instruction': 'Completa todos los campos obligatorios (*) para registrarte',
                'first_name': 'Nombres',
                'last_name': 'Apellidos',
                'document_type': 'Tipo de Documento',
                'document_number': 'Número de Documento',
                'address': 'Dirección',
                'city': 'Ciudad',
                'phone': 'Teléfono',
                'confirm_password': 'Confirmar Contraseña',
                'accept_terms': 'Acepto los términos y condiciones',
                'accept_privacy': 'Acepto las políticas de privacidad',
                'register_button': 'Registrarse',
                'cancel_button': 'Cancelar',
                'password_strength': 'Fortaleza de contraseña:',
                'weak': 'Débil',
                'medium': 'Medio',
                'strong': 'Fuerte',
                'very_strong': 'Muy Fuerte',
                'accessibility_info_1': 'Este formulario es compatible con lectores de pantalla y navegación por teclado.',
                'accessibility_info_2': 'Use Tab para navegar, Enter para enviar, y Space para activar controles.',
                'accessibility_info_3': 'Los campos obligatorios están marcados con asterisco (*).',
                
                // Notificaciones
                'language_changed': 'Idioma cambiado exitosamente',
                'theme_changed': 'Tema cambiado exitosamente',
                'shortcuts_info': 'Información de atajos mostrada',
                
                // Botones generales
                'save': 'Guardar',
                'cancel': 'Cancelar',
                'close': 'Cerrar',
                'edit': 'Editar',
                'delete': 'Eliminar',
                'add': 'Agregar',
                'search': 'Buscar',
                'filter': 'Filtrar',
                'export': 'Exportar',
                'import': 'Importar',
                'print': 'Imprimir',
                
                // Edit Form
                'edit.title': 'Editar Institución',
                'edit.subtitle': 'Actualizar información de la institución educativa',
                'edit.breadcrumb.home': 'Inicio',
                'edit.breadcrumb.infrastructure': 'Infraestructuras',
                'edit.breadcrumb.current': 'Editar',
                'edit.status.no_changes': 'No hay cambios pendientes',
                'edit.status.changes_pending': 'cambios pendientes',
                'edit.basic_info': 'Información Básica',
                'edit.location_info': 'Información de Ubicación',
                'edit.contact_info': 'Información de Contacto',
                'edit.additional_info': 'Información Adicional',
                'edit.name': 'Nombre de la Institución',
                'edit.name_help': 'Nombre completo de la institución educativa',
                'edit.type': 'Tipo de Institución',
                'edit.address': 'Dirección',
                'edit.address_help': 'Dirección completa de la institución',
                'edit.city': 'Ciudad',
                'edit.phone': 'Teléfono',
                'edit.phone_help': 'Número de contacto principal',
                'edit.email': 'Correo Electrónico',
                'edit.email_help': 'Correo institucional oficial',
                'edit.website': 'Sitio Web',
                'edit.website_help': 'URL del sitio web institucional',
                'edit.director': 'Director/Rector',
                'edit.director_help': 'Nombre del director o rector actual',
                'edit.capacity': 'Capacidad de Estudiantes',
                'edit.capacity_help': 'Número máximo de estudiantes',
                'edit.levels': 'Niveles Educativos',
                'edit.status': 'Estado',
                'edit.description': 'Descripción',
                'edit.description_help': 'Descripción detallada de la institución',
                'edit.save_changes': 'Guardar Cambios',
                'edit.cancel': 'Cancelar',
                'edit.confirm.title': 'Confirmar Cambios',
                'edit.confirm.message': 'Está a punto de guardar los siguientes cambios:',
                'edit.confirm.changes': 'Cambios a realizar:',
                'edit.confirm.save': 'Guardar',
                'edit.confirm.cancel': 'Cancelar',
                'edit.success.title': 'Cambios Guardados',
                'edit.success.message': 'Los cambios han sido guardados exitosamente.',
                'edit.success.save_another': 'Guardar y Crear Nuevo',
                'edit.success.back_to_list': 'Volver a la Lista',
                'edit.success.close': 'Cerrar',
                'edit.type.public_university': 'Universidad Pública',
                'edit.type.private_university': 'Universidad Privada',
                'edit.type.public_school': 'Colegio Público',
                'edit.type.private_school': 'Colegio Privado',
                'edit.type.technical_institute': 'Instituto Técnico',
                'edit.levels.preschool': 'Preescolar',
                'edit.levels.elementary': 'Primaria',
                'edit.levels.middle': 'Secundaria',
                'edit.levels.high': 'Bachillerato',
                'edit.levels.university': 'Universitario',
                'edit.status.active': 'Activo',
                'edit.status.inactive': 'Inactivo',
                'edit.status.maintenance': 'En Mantenimiento',
                'edit.status.construction': 'En Construcción',
                
                // Mensajes de validación
                'validation.required': 'Este campo es obligatorio',
                'validation.min_length': 'Debe tener al menos {min} caracteres',
                'validation.max_length': 'No puede exceder {max} caracteres',
                'validation.invalid_email': 'El formato del correo electrónico no es válido',
                'validation.invalid_phone': 'El formato del teléfono no es válido',
                'validation.invalid_url': 'El formato de la URL no es válido',
                'validation.invalid_number': 'Debe ser un número válido',
                'validation.errors_found': 'Se encontraron {count} error(es). Por favor, revisa los campos marcados.',
                
                // Mensajes de notificación
                'notification.saving': 'Guardando cambios...',
                'notification.saved': 'Los cambios han sido guardados exitosamente',
                'notification.no_changes': 'No se han detectado cambios para guardar',
                'notification.cancel_confirm': 'Tienes {count} cambio(s) sin guardar. ¿Estás seguro de que deseas cancelar?',
                
                // Títulos de páginas
                'edit_institution_title': 'Editar Institución',
                'edit_institution_subtitle': 'Modifica los datos de la institución educativa',
                'edit_institution': 'Editar Institución',
                'home': 'Inicio',
                'school_maintenance': 'Mantenimiento Escolar',
                'preventive': 'Preventivo',
                'emergencies': 'Emergencias',
                
                // Navegación
                'dashboard': 'Panel de Control',
                'breadcrumb_home': 'Inicio',
                'breadcrumb_infrastructures': 'Infraestructuras',
                'breadcrumb_edit': 'Editar',
                
                // Secciones del formulario
                'basic_information': 'Información Básica',
                'location_information': 'Información de Ubicación',
                'infrastructure_details': 'Detalles de Infraestructura',
                'contact_information': 'Información de Contacto',
                
                // Campos del formulario
                'institution_name': 'Nombre de la Institución',
                'institution_name_help': 'Ingresa el nombre completo de la institución educativa',
                'institution_code': 'Código de Institución',
                'institution_code_help': 'Código único de la institución (no editable)',
                'institution_type': 'Tipo de Institución',
                'institution_type_help': 'Selecciona el tipo de institución educativa',
                'address': 'Dirección',
                'address_help': 'Dirección completa de la institución',
                'city': 'Ciudad',
                'city_help': 'Ciudad donde se encuentra la institución',
                'province': 'Provincia',
                'province_help': 'Provincia donde se encuentra la institución',
                'buildings_count': 'Cantidad de Edificios',
                'buildings_help': 'Número total de edificios en la institución',
                'classrooms_count': 'Cantidad de Aulas',
                'classrooms_help': 'Número total de aulas disponibles',
                'laboratories_count': 'Cantidad de Laboratorios',
                'laboratories_help': 'Número total de laboratorios (opcional)',
                'email_help': 'Correo electrónico institucional principal',
                'phone_help': 'Número de teléfono principal de la institución',
                'website_help': 'URL del sitio web oficial (opcional)',
                
                // Opciones de select
                'select_option': 'Seleccione una opción',
                'university': 'Universidad',
                'school': 'Colegio',
                'primary_school': 'Escuela Primaria',
                'technical_institute': 'Instituto Técnico',
                'manabi': 'Manabí',
                'pichincha': 'Pichincha',
                'guayas': 'Guayas',
                'azuay': 'Azuay',
                
                // Botones
                'update_institution': 'Actualizar Institución',
                'confirm_changes': 'Confirmar Cambios',
                'confirm_changes_message': '¿Está seguro de que desea guardar los cambios realizados?',
                'save_changes': 'Guardar Cambios',
                
                // Indicadores de estado
                'changes_detected': 'Cambios detectados - Los campos modificados están resaltados',
                'no_changes_detected': 'No se han detectado cambios'
            },
            
            en: {
                // Navigation
                'dashboard': 'Dashboard',
                'management': 'Management',
                'planning': 'Planning',
                'configuration': 'Settings',
                'help': 'Help',
                'logout': 'Logout',
                'welcome': 'Welcome, Inspector',
                
                // Management
                'maintenance': 'Maintenance',
                'infrastructures': 'Infrastructures',
                'reports': 'Reports',
                
                // Planning
                'calendar': 'Calendar',
                'schedules': 'Schedules',
                'alerts': 'Alerts',
                
                // Help
                'contact': 'Contact',
                'faq': 'FAQ',
                'shortcuts': 'Keyboard Shortcuts',
                
                // Configuration
                'language': 'Language',
                'theme': 'Theme',
                'spanish': 'Spanish',
                'english': 'English',
                'light': 'Light',
                'dark': 'Dark',
                
                // Hero Section
                'hero_title': 'Keep your school infrastructure in perfect condition',
                'hero_subtitle': 'The comprehensive platform to manage preventive maintenance of educational facilities. From small schools to large university complexes.',
                
                // Login Page
                'login_title': 'Sign In',
                'login_subtitle': 'Access your administration panel',
                'email_label': 'Email Address',
                'password_label': 'Password',
                'remember_me': 'Remember me',
                'forgot_password': 'Forgot your password?',
                'login_button': 'Sign In',
                'register_link': 'Don\'t have an account? Sign up here',
                'create_account': 'Create New Account',
                'back_to_login': 'Back to Login',
                'email_help': 'Enter your institutional email address',
                'password_help': 'Minimum 6 characters',
                'remember_help': 'Your user will be securely saved on this device',
                'login_help': 'Average login time: less than 5 seconds',
                'accessibility_info': 'This form is compatible with screen readers and keyboard navigation.',
                'accessibility_navigation': 'Use Tab to navigate, Enter to submit, and Space to activate controls.',
                'system_title': 'Preventive Maintenance Manager',
                'system_subtitle': 'School Infrastructure',
                'visual_title': 'Keep your educational facilities in perfect condition',
                'visual_subtitle': 'System to preventively manage school maintenance',
                'feature_reports': 'Real-Time Reports',
                'feature_reports_desc': 'Monitor the status of all your facilities',
                'feature_maintenance': 'Scheduled Maintenance',
                'feature_maintenance_desc': 'Automate preventive maintenance tasks',
                'feature_campus': 'Multi-Campus',
                'feature_campus_desc': 'Manage multiple sites from one place',
                'feature_mobile': 'Mobile Access',
                'feature_mobile_desc': 'Monitor from any device',
                
                // Infrastructure Page
                'registered_infrastructures': 'Registered Infrastructures',
                'infrastructure_subtitle': 'Manage and supervise all educational institutions in the system',
                'educational_institutions': 'Educational Institutions',
                'add_institution': '+ Add Institution',
                'buildings': 'Buildings',
                'classrooms': 'Classrooms',
                'laboratories': 'Laboratories',
                'last_maintenance': 'Last Maintenance:',
                'next_maintenance': 'Next Maintenance:',
                'view_details': 'View Details',
                'manage': 'Manage',
                
                // Institution Types
                'public_university': 'Public University',
                'public_school': 'Public School',
                
                // Institution Locations
                'manta_manabi': 'Manta, Manabí, Ecuador',
                'quito_pichincha': 'Quito, Pichincha, Ecuador',
                
                // Contact Page
                'contact_title': 'Contact Us',
                'contact_instructions': 'Complete this form to send us your inquiry, suggestion or problem report.',
                'contact_info': 'We only need basic information to respond to you appropriately.',
                'response_time': 'Response time: We will respond within a maximum of 24 business hours.',
                'full_name': 'Full Name',
                'email': 'Email Address',
                'subject': 'Subject',
                'message': 'Message',
                'institution': 'Educational Institution',
                'phone': 'Phone Number',
                'send_button': 'Send Message',
                'cancel_button': 'Cancel',
                
                // Register Page
                'register_title': 'Create Account',
                'register_subtitle': 'Join the maintenance management system',
                'personal_data': 'Personal Information',
                'contact_info': 'Contact Information',
                'credentials': 'Credentials',
                'terms': 'Terms and Conditions',
                'create_account': 'Create Account',
                'back_to_login': 'Back to login',
                'new_user_register': 'New User Registration',
                'register_instruction': 'Complete all required fields (*) to register',
                'first_name': 'First Name',
                'last_name': 'Last Name',
                'document_type': 'Document Type',
                'document_number': 'Document Number',
                'address': 'Address',
                'city': 'City',
                'phone': 'Phone',
                'confirm_password': 'Confirm Password',
                'accept_terms': 'I accept the terms and conditions',
                'accept_privacy': 'I accept the privacy policies',
                'register_button': 'Register',
                'cancel_button': 'Cancel',
                'password_strength': 'Password strength:',
                'weak': 'Weak',
                'medium': 'Medium',
                'strong': 'Strong',
                'very_strong': 'Very Strong',
                'accessibility_info_1': 'This form is compatible with screen readers and keyboard navigation.',
                'accessibility_info_2': 'Use Tab to navigate, Enter to submit, and Space to activate controls.',
                'accessibility_info_3': 'Required fields are marked with an asterisk (*).',
                
                // Notifications
                'language_changed': 'Language changed successfully',
                'theme_changed': 'Theme changed successfully',
                'shortcuts_info': 'Shortcuts information displayed',
                
                // General buttons
                'save': 'Save',
                'cancel': 'Cancel',
                'close': 'Close',
                'edit': 'Edit',
                'delete': 'Delete',
                'add': 'Add',
                'search': 'Search',
                'filter': 'Filter',
                'export': 'Export',
                'import': 'Import',
                'print': 'Print',
                
                // Edit Form
                'edit.title': 'Edit Institution',
                'edit.subtitle': 'Update educational institution information',
                'edit.breadcrumb.home': 'Home',
                'edit.breadcrumb.infrastructure': 'Infrastructure',
                'edit.breadcrumb.current': 'Edit',
                'edit.status.no_changes': 'No pending changes',
                'edit.status.changes_pending': 'pending changes',
                'edit.basic_info': 'Basic Information',
                'edit.location_info': 'Location Information',
                'edit.contact_info': 'Contact Information',
                'edit.additional_info': 'Additional Information',
                'edit.name': 'Institution Name',
                'edit.name_help': 'Full name of the educational institution',
                'edit.type': 'Institution Type',
                'edit.address': 'Address',
                'edit.address_help': 'Complete address of the institution',
                'edit.city': 'City',
                'edit.phone': 'Phone',
                'edit.phone_help': 'Main contact number',
                'edit.email': 'Email',
                'edit.email_help': 'Official institutional email',
                'edit.website': 'Website',
                'edit.website_help': 'Institutional website URL',
                'edit.director': 'Director/Principal',
                'edit.director_help': 'Name of current director or principal',
                'edit.capacity': 'Student Capacity',
                'edit.capacity_help': 'Maximum number of students',
                'edit.levels': 'Educational Levels',
                'edit.status': 'Status',
                'edit.description': 'Description',
                'edit.description_help': 'Detailed description of the institution',
                'edit.save_changes': 'Save Changes',
                'edit.cancel': 'Cancel',
                'edit.confirm.title': 'Confirm Changes',
                'edit.confirm.message': 'You are about to save the following changes:',
                'edit.confirm.changes': 'Changes to be made:',
                'edit.confirm.save': 'Save',
                'edit.confirm.cancel': 'Cancel',
                'edit.success.title': 'Changes Saved',
                'edit.success.message': 'Changes have been saved successfully.',
                'edit.success.save_another': 'Save and Create New',
                'edit.success.back_to_list': 'Back to List',
                'edit.success.close': 'Close',
                'edit.type.public_university': 'Public University',
                'edit.type.private_university': 'Private University',
                'edit.type.public_school': 'Public School',
                'edit.type.private_school': 'Private School',
                'edit.type.technical_institute': 'Technical Institute',
                'edit.levels.preschool': 'Preschool',
                'edit.levels.elementary': 'Elementary',
                'edit.levels.middle': 'Middle School',
                'edit.levels.high': 'High School',
                'edit.levels.university': 'University',
                'edit.status.active': 'Active',
                'edit.status.inactive': 'Inactive',
                'edit.status.maintenance': 'Under Maintenance',
                'edit.status.construction': 'Under Construction',
                
                // Validation messages
                'validation.required': 'This field is required',
                'validation.min_length': 'Must have at least {min} characters',
                'validation.max_length': 'Cannot exceed {max} characters',
                'validation.invalid_email': 'Invalid email format',
                'validation.invalid_phone': 'Invalid phone format',
                'validation.invalid_url': 'Invalid URL format',
                'validation.invalid_number': 'Must be a valid number',
                'validation.errors_found': 'Found {count} error(s). Please review the marked fields.',
                
                // Notification messages
                'notification.saving': 'Saving changes...',
                'notification.saved': 'Changes have been saved successfully',
                'notification.no_changes': 'No changes detected to save',
                'notification.cancel_confirm': 'You have {count} unsaved change(s). Are you sure you want to cancel?',
                
                // Page titles
                'edit_institution_title': 'Edit Institution',
                'edit_institution_subtitle': 'Modify educational institution data',
                'edit_institution': 'Edit Institution',
                'home': 'Home',
                'school_maintenance': 'School Maintenance',
                'preventive': 'Preventive',
                'emergencies': 'Emergencies',
                
                // Navigation
                'dashboard': 'Dashboard',
                'breadcrumb_home': 'Home',
                'breadcrumb_infrastructures': 'Infrastructures',
                'breadcrumb_edit': 'Edit',
                
                // Form sections
                'basic_information': 'Basic Information',
                'location_information': 'Location Information',
                'infrastructure_details': 'Infrastructure Details',
                'contact_information': 'Contact Information',
                
                // Form fields
                'institution_name': 'Institution Name',
                'institution_name_help': 'Enter the complete name of the educational institution',
                'institution_code': 'Institution Code',
                'institution_code_help': 'Unique institution code (not editable)',
                'institution_type': 'Institution Type',
                'institution_type_help': 'Select the type of educational institution',
                'address': 'Address',
                'address_help': 'Complete address of the institution',
                'city': 'City',
                'city_help': 'City where the institution is located',
                'province': 'Province',
                'province_help': 'Province where the institution is located',
                'buildings_count': 'Number of Buildings',
                'buildings_help': 'Total number of buildings in the institution',
                'classrooms_count': 'Number of Classrooms',
                'classrooms_help': 'Total number of available classrooms',
                'laboratories_count': 'Number of Laboratories',
                'laboratories_help': 'Total number of laboratories (optional)',
                'email_help': 'Main institutional email address',
                'phone_help': 'Main telephone number of the institution',
                'website_help': 'Official website URL (optional)',
                
                // Select options
                'select_option': 'Select an option',
                'university': 'University',
                'school': 'School',
                'primary_school': 'Primary School',
                'technical_institute': 'Technical Institute',
                'manabi': 'Manabí',
                'pichincha': 'Pichincha',
                'guayas': 'Guayas',
                'azuay': 'Azuay',
                
                // Buttons
                'update_institution': 'Update Institution',
                'confirm_changes': 'Confirm Changes',
                'confirm_changes_message': 'Are you sure you want to save the changes made?',
                'save_changes': 'Save Changes',
                
                // Status indicators
                'changes_detected': 'Changes detected - Modified fields are highlighted',
                'no_changes_detected': 'No changes detected'
            }
        };
    }

    setupEventListeners() {
        // Toggle de idioma
        document.getElementById('languageToggle')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleLanguage();
        });

        // Toggle de tema
        document.getElementById('themeToggle')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleTheme();
        });

        // Mostrar atajos
        document.getElementById('keyboardShortcuts')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showShortcuts();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Solo procesar si Alt está presionado
            if (e.altKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        window.location.href = 'dashboard.html';
                        break;
                    case '2':
                        e.preventDefault();
                        window.location.href = 'infraestructuras.html';
                        break;
                    case '3':
                        e.preventDefault();
                        this.openDropdown('gestión');
                        break;
                    case '4':
                        e.preventDefault();
                        this.openDropdown('planificación');
                        break;
                    case 'h':
                    case 'H':
                        e.preventDefault();
                        this.openDropdown('ayuda');
                        break;
                    case 'c':
                    case 'C':
                        e.preventDefault();
                        window.location.href = 'contact.html';
                        break;
                    case 's':
                    case 'S':
                        e.preventDefault();
                        window.location.href = 'index.html';
                        break;
                    case 't':
                    case 'T':
                        e.preventDefault();
                        this.toggleTheme();
                        break;
                    case 'l':
                    case 'L':
                        e.preventDefault();
                        this.toggleLanguage();
                        break;
                }
            }
            
            // Ctrl + K para búsqueda
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.showSearchModal();
            }
            
            // Escape para cerrar menús
            if (e.key === 'Escape') {
                this.closeAllDropdowns();
            }
        });
    }

    toggleLanguage() {
        this.currentLanguage = this.currentLanguage === 'es' ? 'en' : 'es';
        localStorage.setItem('gmpi-language', this.currentLanguage);
        this.applyLanguage();
        this.updateUI();
        this.updateLanguageDisplay();
        this.showNotification(this.t('language_changed'));
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('gmpi-theme', this.currentTheme);
        this.applyTheme();
        this.updateUI();
        this.updateThemeDisplay();
        this.showNotification(this.t('theme_changed'));
    }

    updateLanguageDisplay() {
        // Actualizar texto de botones de idioma
        const languageElements = document.querySelectorAll('#quickLanguageText, #currentLanguage');
        languageElements.forEach(element => {
            element.textContent = this.currentLanguage.toUpperCase();
        });
    }

    updateThemeDisplay() {
        // Actualizar texto de botones de tema
        const themeElements = document.querySelectorAll('#quickThemeText, #currentTheme');
        const themeIcon = this.currentTheme === 'light' ? '☀️' : '🌙';
        themeElements.forEach(element => {
            element.textContent = themeIcon;
        });
    }

    applyLanguage() {
        document.documentElement.lang = this.currentLanguage;
        
        // Actualizar título de la página
        const pageTitle = document.title;
        if (pageTitle.includes('GESTOR DE MANTENIMIENTO PREVENTIVO')) {
            document.title = this.currentLanguage === 'es' ? 
                'GESTOR DE MANTENIMIENTO PREVENTIVO - Infraestructuras Escolares' : 
                'PREVENTIVE MAINTENANCE MANAGER - School Infrastructure';
        } else if (pageTitle.includes('Iniciar Sesión')) {
            document.title = this.currentLanguage === 'es' ? 
                'Iniciar Sesión - GESTOR DE MANTENIMIENTO PREVENTIVO' : 
                'Sign In - PREVENTIVE MAINTENANCE MANAGER';
        } else if (pageTitle.includes('Contacto')) {
            document.title = this.currentLanguage === 'es' ? 
                'Contacto - GESTOR DE MANTENIMIENTO PREVENTIVO' : 
                'Contact - PREVENTIVE MAINTENANCE MANAGER';
        } else if (pageTitle.includes('Registro')) {
            document.title = this.currentLanguage === 'es' ? 
                'Registro - GESTOR DE MANTENIMIENTO PREVENTIVO' : 
                'Register - PREVENTIVE MAINTENANCE MANAGER';
        }
        
        // Actualizar elementos con data-translate
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.t(key);
            if (translation && translation !== key) {
                element.textContent = translation;
            }
        });
        
        // Actualizar placeholders
        document.querySelectorAll('[data-translate-placeholder]').forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            const translation = this.t(key);
            if (translation && translation !== key) {
                element.placeholder = translation;
            }
        });
        
        // Actualizar aria-labels
        document.querySelectorAll('[data-translate-aria]').forEach(element => {
            const key = element.getAttribute('data-translate-aria');
            const translation = this.t(key);
            if (translation && translation !== key) {
                element.setAttribute('aria-label', translation);
            }
        });
        
        // Actualizar alt texts
        document.querySelectorAll('[data-translate-alt]').forEach(element => {
            const key = element.getAttribute('data-translate-alt');
            const translation = this.t(key);
            if (translation && translation !== key) {
                element.setAttribute('alt', translation);
            }
        });
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        
        if (this.currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }

    updateUI() {
        // Actualizar indicadores en el menú
        const languageElement = document.getElementById('currentLanguage');
        const themeElement = document.getElementById('currentTheme');
        
        if (languageElement) {
            languageElement.textContent = this.currentLanguage === 'es' ? 'Español' : 'English';
        }
        
        if (themeElement) {
            themeElement.textContent = this.t(this.currentTheme);
        }
    }

    showShortcuts() {
        // Remover modal existente primero
        this.closeShortcuts();
        
        const shortcutsContent = `
            <div class="shortcuts-modal" id="shortcutsModal">
                <div class="shortcuts-content">
                    <div class="shortcuts-header">
                        <h3>${this.t('shortcuts')}</h3>
                        <button class="close-btn" id="closeShortcutsBtn">×</button>
                    </div>
                    <div class="shortcuts-body">
                        <div class="shortcuts-section">
                            <h4>${this.t('navigation')}</h4>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Alt + 1</span>
                                <span class="shortcut-desc">${this.t('dashboard')}</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Alt + 2</span>
                                <span class="shortcut-desc">${this.t('infrastructures')}</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Alt + 3</span>
                                <span class="shortcut-desc">${this.t('management')}</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Alt + 4</span>
                                <span class="shortcut-desc">${this.t('planning')}</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Alt + H</span>
                                <span class="shortcut-desc">${this.t('help')}</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Alt + C</span>
                                <span class="shortcut-desc">${this.t('contact')}</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Alt + S</span>
                                <span class="shortcut-desc">${this.t('logout')}</span>
                            </div>
                        </div>
                        <div class="shortcuts-section">
                            <h4>${this.t('configuration')}</h4>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Alt + L</span>
                                <span class="shortcut-desc">${this.t('language')}</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Alt + T</span>
                                <span class="shortcut-desc">${this.t('theme')}</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Ctrl + K</span>
                                <span class="shortcut-desc">Búsqueda rápida</span>
                            </div>
                            <div class="shortcut-item">
                                <span class="shortcut-key">Esc</span>
                                <span class="shortcut-desc">Cerrar menús</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', shortcutsContent);
        
        // Agregar event listeners una sola vez
        const closeBtn = document.getElementById('closeShortcutsBtn');
        const modal = document.getElementById('shortcutsModal');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeShortcuts());
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeShortcuts();
                }
            });
        }
        
        // Cerrar con escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                this.closeShortcuts();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
        
        this.showNotification(this.t('shortcuts_info'));
    }

    closeShortcuts() {
        const modal = document.getElementById('shortcutsModal');
        if (modal) {
            modal.remove();
        }
    }

    openDropdown(menu) {
        // Cerrar todos los menús primero
        this.closeAllDropdowns();
        
        // Abrir el menú específico
        const menuElement = document.querySelector(`[data-menu="${menu}"]`);
        if (menuElement) {
            menuElement.classList.add('active');
            menuElement.setAttribute('aria-expanded', 'true');
        }
    }

    closeAllDropdowns() {
        document.querySelectorAll('.dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
            dropdown.querySelector('.nav-link')?.setAttribute('aria-expanded', 'false');
        });
    }

    showSearchModal() {
        // Implementar modal de búsqueda rápida
        const searchContent = `
            <div class="search-modal" id="searchModal">
                <div class="search-content">
                    <input type="text" placeholder="Buscar..." id="quickSearch" autofocus>
                    <button onclick="settingsManager.closeSearch()">×</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', searchContent);
        
        // Cerrar con Escape
        document.getElementById('quickSearch').addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeSearch();
            }
        });
    }

    closeSearch() {
        const modal = document.getElementById('searchModal');
        if (modal) {
            modal.remove();
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Función helper para traducciones
    t(key) {
        return this.translations[this.currentLanguage][key] || key;
    }
}

// Inicializar el sistema cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});

// Añadir estilos CSS dinámicamente
const styles = `
    .shortcuts-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
    }

    .shortcuts-content {
        background: white;
        border-radius: 12px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
    }

    .shortcuts-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 2px solid #f0f0f0;
    }

    .shortcuts-header h3 {
        margin: 0;
        color: var(--primary-color);
        font-size: 24px;
    }

    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
        padding: 5px;
        border-radius: 50%;
        width: 35px;
        height: 35px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .close-btn:hover {
        background: #f0f0f0;
        color: var(--primary-color);
    }

    .shortcuts-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 30px;
    }

    .shortcuts-section h4 {
        margin: 0 0 15px 0;
        color: var(--text-primary);
        font-size: 18px;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 8px;
    }

    .shortcut-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid #f5f5f5;
    }

    .shortcut-key {
        background: #f8f9fa;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        padding: 4px 8px;
        font-family: monospace;
        font-size: 12px;
        font-weight: bold;
        color: #495057;
    }

    .shortcut-desc {
        color: var(--text-secondary);
        font-size: 14px;
    }

    .search-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: flex-start;
        justify-content: center;
        z-index: 10000;
        padding-top: 100px;
    }

    .search-content {
        background: white;
        border-radius: 12px;
        padding: 20px;
        width: 500px;
        max-width: 90%;
        display: flex;
        gap: 10px;
        align-items: center;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    #quickSearch {
        flex: 1;
        padding: 12px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
        outline: none;
    }

    #quickSearch:focus {
        border-color: var(--primary-color);
    }

    .setting-value {
        font-size: 12px;
        color: var(--text-secondary);
        font-weight: normal;
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }

    @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
    }

    @keyframes slideOut {
        from { transform: translateX(0); }
        to { transform: translateX(100%); }
    }

    @media (max-width: 768px) {
        .shortcuts-body {
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .shortcuts-content {
            padding: 20px;
        }
    }
`;

// Insertar estilos en el documento
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

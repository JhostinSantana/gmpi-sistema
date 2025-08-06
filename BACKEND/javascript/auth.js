// GESTOR DE MANTENIMIENTO PREVENTIVO - Backend Authentication
// Simulación de autenticación para el sistema

class AuthenticationSystem {
    constructor() {
        this.users = [
            {
                id: 1,
                email: 'admin@colegio.edu',
                password: 'admin123',
                role: 'inspector',
                name: 'Inspector del Sistema',
                permissions: ['read', 'write', 'delete', 'manage_users', 'manage_maintenance', 'manage_calendar']
            },
            {
                id: 2,
                email: 'vic@colegio.edu',
                password: 'Vic1234567!',
                role: 'autoridad',
                name: 'Autoridad Educativa',
                permissions: ['read', 'write', 'manage_maintenance', 'manage_calendar']
            }
        ];
        
        this.sessions = new Map();
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
        this.loadUsersFromStorage();
    }

    // Cargar usuarios del localStorage
    loadUsersFromStorage() {
        try {
            const storedUsers = localStorage.getItem('gmpi_users');
            if (storedUsers) {
                const users = JSON.parse(storedUsers);
                // Mantener los usuarios por defecto y agregar los almacenados
                this.users = [
                    ...this.users,
                    ...users.filter(user => user.email !== 'admin@colegio.edu' && user.email !== 'vic@colegio.edu')
                ];
            }
        } catch (error) {
            console.error('Error loading users from storage:', error);
        }
    }

    // Guardar usuarios en localStorage
    saveUsersToStorage() {
        try {
            // Guardar solo los usuarios que no sean los usuarios por defecto
            const usersToStore = this.users.filter(user => user.email !== 'admin@colegio.edu' && user.email !== 'vic@colegio.edu');
            localStorage.setItem('gmpi_users', JSON.stringify(usersToStore));
        } catch (error) {
            console.error('Error saving users to storage:', error);
        }
    }

    // Registrar nuevo usuario
    registerUser(userData) {
        try {
            // Validar que el email no exista
            if (this.users.find(u => u.email === userData.email)) {
                return {
                    success: false,
                    message: 'El email ya está registrado en el sistema'
                };
            }

            // Validar campos requeridos
            if (!userData.email || !userData.password || !userData.name || !userData.role) {
                return {
                    success: false,
                    message: 'Todos los campos son requeridos'
                };
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(userData.email)) {
                return {
                    success: false,
                    message: 'Formato de email inválido'
                };
            }

            // Validar longitud de contraseña
            if (userData.password.length < 6) {
                return {
                    success: false,
                    message: 'La contraseña debe tener al menos 6 caracteres'
                };
            }

            // Definir permisos según el rol
            let permissions = ['read'];
            if (userData.role === 'inspector') {
                permissions = ['read', 'write', 'delete', 'manage_users', 'manage_maintenance', 'manage_calendar'];
            } else if (userData.role === 'authority') {
                permissions = ['read', 'write', 'manage_maintenance'];
            }

            // Crear nuevo usuario
            const newUser = {
                id: Date.now(), // ID temporal basado en timestamp
                email: userData.email,
                password: userData.password, // En producción esto debería estar hasheado
                role: userData.role,
                name: userData.name,
                permissions: permissions,
                registrationDate: new Date().toISOString(),
                active: true
            };

            // Agregar el usuario al array
            this.users.push(newUser);
            
            // Guardar en localStorage
            this.saveUsersToStorage();

            return {
                success: true,
                message: 'Usuario registrado exitosamente',
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                    registrationDate: newUser.registrationDate
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error interno del servidor durante el registro'
            };
        }
    }

    // Obtener lista de usuarios (solo para inspector)
    getAllUsers(sessionId) {
        const session = this.validateSession(sessionId);
        if (!session || !session.user.permissions.includes('manage_users')) {
            return {
                success: false,
                message: 'Sin permisos para ver la lista de usuarios'
            };
        }

        const userList = this.users.map(user => ({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            registrationDate: user.registrationDate || 'Usuario por defecto',
            active: user.active !== false
        }));

        return {
            success: true,
            users: userList
        };
    }

    // Actualizar usuario (solo para inspector)
    updateUser(sessionId, userId, updateData) {
        const session = this.validateSession(sessionId);
        if (!session || !session.user.permissions.includes('manage_users')) {
            return {
                success: false,
                message: 'Sin permisos para modificar usuarios'
            };
        }

        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return {
                success: false,
                message: 'Usuario no encontrado'
            };
        }

        // No permitir modificar el usuario admin principal
        if (this.users[userIndex].email === 'admin@colegio.edu') {
            return {
                success: false,
                message: 'No se puede modificar el usuario inspector principal'
            };
        }

        // Actualizar solo los campos permitidos
        if (updateData.name) this.users[userIndex].name = updateData.name;
        if (updateData.role) {
            this.users[userIndex].role = updateData.role;
            // Actualizar permisos según el nuevo rol
            if (updateData.role === 'inspector') {
                this.users[userIndex].permissions = ['read', 'write', 'delete', 'manage_users', 'manage_maintenance', 'manage_calendar'];
            } else if (updateData.role === 'authority') {
                this.users[userIndex].permissions = ['read', 'write', 'manage_maintenance'];
            }
        }
        if (updateData.active !== undefined) this.users[userIndex].active = updateData.active;

        this.saveUsersToStorage();

        return {
            success: true,
            message: 'Usuario actualizado exitosamente'
        };
    }

    // Eliminar usuario (solo para inspector)
    deleteUser(sessionId, userId) {
        const session = this.validateSession(sessionId);
        if (!session || !session.user.permissions.includes('manage_users')) {
            return {
                success: false,
                message: 'Sin permisos para eliminar usuarios'
            };
        }

        const userIndex = this.users.findIndex(u => u.id === userId);
        if (userIndex === -1) {
            return {
                success: false,
                message: 'Usuario no encontrado'
            };
        }

        // No permitir eliminar el usuario admin principal
        if (this.users[userIndex].email === 'admin@colegio.edu') {
            return {
                success: false,
                message: 'No se puede eliminar el usuario inspector principal'
            };
        }

        this.users.splice(userIndex, 1);
        this.saveUsersToStorage();

        return {
            success: true,
            message: 'Usuario eliminado exitosamente'
        };
    }

    // Validar credenciales de usuario
    validateCredentials(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        return user || null;
    }

    // Crear sesión de usuario
    createSession(user) {
        const sessionId = this.generateSessionId();
        const session = {
            id: sessionId,
            userId: user.id,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                permissions: user.permissions
            },
            createdAt: new Date(),
            lastActivity: new Date(),
            expiresAt: new Date(Date.now() + this.sessionTimeout)
        };
        
        this.sessions.set(sessionId, session);
        return session;
    }

    // Validar sesión existente
    validateSession(sessionId) {
        const session = this.sessions.get(sessionId);
        
        if (!session) {
            return null;
        }
        
        // Verificar si la sesión ha expirado
        if (new Date() > session.expiresAt) {
            this.sessions.delete(sessionId);
            return null;
        }
        
        // Actualizar última actividad
        session.lastActivity = new Date();
        session.expiresAt = new Date(Date.now() + this.sessionTimeout);
        
        return session;
    }

    // Cerrar sesión
    logout(sessionId) {
        return this.sessions.delete(sessionId);
    }

    // Generar ID de sesión único
    generateSessionId() {
        return 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Limpiar sesiones expiradas
    cleanExpiredSessions() {
        const now = new Date();
        for (let [sessionId, session] of this.sessions) {
            if (now > session.expiresAt) {
                this.sessions.delete(sessionId);
            }
        }
    }

    // Verificar permisos de usuario
    hasPermission(sessionId, permission) {
        const session = this.validateSession(sessionId);
        if (!session) return false;
        
        return session.user.permissions.includes(permission);
    }
}

// Sistema de Gestión de Mantenimiento
class MaintenanceManagementSystem {
    constructor() {
        this.auth = new AuthenticationSystem();
        this.calendar = new CalendarManagementSystem();
        this.maintenanceRecords = [];
        this.facilities = [];
        this.personnel = [];
        this.materials = [];
        
        this.initializeData();
    }

    // Inicializar datos de ejemplo
    initializeData() {
        // Instalaciones de ejemplo
        this.facilities = [
            {
                id: 1,
                name: 'Edificio Principal',
                type: 'academic',
                location: 'Campus Central',
                status: 'active',
                lastMaintenance: '2024-12-15',
                nextMaintenance: '2025-03-15'
            },
            {
                id: 2,
                name: 'Laboratorio de Ciencias',
                type: 'laboratory',
                location: 'Piso 2 - Ala Norte',
                status: 'maintenance_required',
                lastMaintenance: '2024-11-20',
                nextMaintenance: '2025-02-20'
            },
            {
                id: 3,
                name: 'Gimnasio',
                type: 'sports',
                location: 'Campus Deportivo',
                status: 'active',
                lastMaintenance: '2025-01-05',
                nextMaintenance: '2025-04-05'
            }
        ];

        // Personal de mantenimiento
        this.personnel = [
            {
                id: 1,
                name: 'Carlos Rodríguez',
                role: 'Supervisor de Mantenimiento',
                specialization: 'Sistemas Eléctricos',
                status: 'available'
            },
            {
                id: 2,
                name: 'María González',
                role: 'Técnica de Plomería',
                specialization: 'Sistemas Hidráulicos',
                status: 'occupied'
            },
            {
                id: 3,
                name: 'Juan Pérez',
                role: 'Técnico General',
                specialization: 'Mantenimiento General',
                status: 'available'
            }
        ];

        // Materiales y suministros
        this.materials = [
            {
                id: 1,
                name: 'Pintura Blanca',
                category: 'Pintura',
                quantity: 25,
                unit: 'galones',
                minStock: 5
            },
            {
                id: 2,
                name: 'Cables Eléctricos',
                category: 'Eléctrico',
                quantity: 150,
                unit: 'metros',
                minStock: 50
            },
            {
                id: 3,
                name: 'Tubería PVC',
                category: 'Plomería',
                quantity: 8,
                unit: 'metros',
                minStock: 10
            }
        ];
    }

    // Login de usuario
    login(email, password) {
        try {
            const user = this.auth.validateCredentials(email, password);
            
            if (!user) {
                return {
                    success: false,
                    message: 'Credenciales inválidas'
                };
            }

            // Verificar si el usuario está activo
            if (user.active === false) {
                return {
                    success: false,
                    message: 'Usuario desactivado. Contacte al administrador.'
                };
            }

            const session = this.auth.createSession(user);
            
            return {
                success: true,
                message: 'Login exitoso',
                session: {
                    id: session.id,
                    user: session.user,
                    expiresAt: session.expiresAt
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Error interno del servidor'
            };
        }
    }

    // Registrar nuevo usuario
    register(userData) {
        return this.auth.registerUser(userData);
    }

    // Obtener usuarios (solo administradores)
    getUsers(sessionId) {
        return this.auth.getAllUsers(sessionId);
    }

    // Actualizar usuario (solo administradores)
    updateUser(sessionId, userId, updateData) {
        return this.auth.updateUser(sessionId, userId, updateData);
    }

    // Eliminar usuario (solo administradores)
    deleteUser(sessionId, userId) {
        return this.auth.deleteUser(sessionId, userId);
    }

    // ===== MÉTODOS DE CALENDARIO =====
    
    // Crear evento en el calendario
    createCalendarEvent(sessionId, eventData) {
        return this.calendar.createEvent(sessionId, eventData);
    }

    // Obtener eventos del calendario
    getCalendarEvents(sessionId, filters = {}) {
        return this.calendar.getEvents(sessionId, filters);
    }

    // Actualizar evento del calendario
    updateCalendarEvent(sessionId, eventId, updateData) {
        return this.calendar.updateEvent(sessionId, eventId, updateData);
    }

    // Eliminar evento del calendario
    deleteCalendarEvent(sessionId, eventId) {
        return this.calendar.deleteEvent(sessionId, eventId);
    }

    // Completar evento del calendario
    completeCalendarEvent(sessionId, eventId) {
        return this.calendar.completeEvent(sessionId, eventId);
    }

    // Obtener eventos próximos
    getUpcomingCalendarEvents(sessionId, days = 7) {
        return this.calendar.getUpcomingEvents(sessionId, days);
    }

    // Logout de usuario
    logout(sessionId) {
        const success = this.auth.logout(sessionId);
        return {
            success,
            message: success ? 'Logout exitoso' : 'Sesión no encontrada'
        };
    }

    // Obtener dashboard data
    getDashboardData(sessionId) {
        const session = this.auth.validateSession(sessionId);
        if (!session) {
            return { success: false, message: 'Sesión inválida' };
        }

        const stats = {
            totalFacilities: this.facilities.length,
            activeFacilities: this.facilities.filter(f => f.status === 'active').length,
            maintenanceRequired: this.facilities.filter(f => f.status === 'maintenance_required').length,
            availablePersonnel: this.personnel.filter(p => p.status === 'available').length,
            lowStockMaterials: this.materials.filter(m => m.quantity <= m.minStock).length
        };

        return {
            success: true,
            data: {
                user: session.user,
                stats,
                upcomingMaintenance: this.getUpcomingMaintenance(),
                recentActivity: this.getRecentActivity()
            }
        };
    }

    // Obtener mantenimientos próximos
    getUpcomingMaintenance() {
        const now = new Date();
        const oneMonth = new Date();
        oneMonth.setMonth(oneMonth.getMonth() + 1);

        return this.facilities
            .filter(f => {
                const nextDate = new Date(f.nextMaintenance);
                return nextDate >= now && nextDate <= oneMonth;
            })
            .sort((a, b) => new Date(a.nextMaintenance) - new Date(b.nextMaintenance));
    }

    // Obtener actividad reciente
    getRecentActivity() {
        return [
            {
                id: 1,
                type: 'maintenance_completed',
                description: 'Mantenimiento de aires acondicionados completado',
                facility: 'Biblioteca Principal',
                date: '2025-01-02',
                technician: 'Carlos Rodríguez'
            },
            {
                id: 2,
                type: 'inspection_scheduled',
                description: 'Inspección de sistemas eléctricos programada',
                facility: 'Laboratorio de Química',
                date: '2025-01-03',
                technician: 'María González'
            }
        ];
    }
}

// Sistema de Gestión de Calendario para Mantenimiento
class CalendarManagementSystem {
    constructor() {
        this.events = [];
        this.loadEventsFromStorage();
    }

    // Cargar eventos del localStorage
    loadEventsFromStorage() {
        try {
            const storedEvents = localStorage.getItem('gmpi_calendar_events');
            if (storedEvents) {
                this.events = JSON.parse(storedEvents);
            }
        } catch (error) {
            console.error('Error loading calendar events from storage:', error);
        }
    }

    // Guardar eventos en localStorage
    saveEventsToStorage() {
        try {
            localStorage.setItem('gmpi_calendar_events', JSON.stringify(this.events));
        } catch (error) {
            console.error('Error saving calendar events to storage:', error);
        }
    }

    // Crear nuevo evento de mantenimiento
    createEvent(sessionId, eventData) {
        // Validar permisos (solo administradores)
        if (!sessionId || !this.validateAdminPermission(sessionId)) {
            return {
                success: false,
                message: 'Sin permisos para crear eventos en el calendario'
            };
        }

        // Validar campos requeridos
        if (!eventData.title || !eventData.date || !eventData.facility) {
            return {
                success: false,
                message: 'Título, fecha y instalación son campos requeridos'
            };
        }

        const newEvent = {
            id: Date.now(),
            title: eventData.title,
            description: eventData.description || '',
            date: eventData.date,
            time: eventData.time || '09:00',
            facility: eventData.facility,
            type: eventData.type || 'maintenance',
            status: 'scheduled',
            assignedTo: eventData.assignedTo || '',
            priority: eventData.priority || 'medium',
            createdAt: new Date().toISOString(),
            createdBy: sessionId
        };

        this.events.push(newEvent);
        this.saveEventsToStorage();

        return {
            success: true,
            message: 'Evento creado exitosamente',
            event: newEvent
        };
    }

    // Obtener eventos del calendario
    getEvents(sessionId, filters = {}) {
        // Validar permisos
        if (!sessionId || !this.validateAdminPermission(sessionId)) {
            return {
                success: false,
                message: 'Sin permisos para ver el calendario'
            };
        }

        let filteredEvents = [...this.events];

        // Aplicar filtros
        if (filters.month && filters.year) {
            filteredEvents = filteredEvents.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate.getMonth() === parseInt(filters.month) - 1 && 
                       eventDate.getFullYear() === parseInt(filters.year);
            });
        }

        if (filters.facility) {
            filteredEvents = filteredEvents.filter(event => 
                event.facility.toLowerCase().includes(filters.facility.toLowerCase())
            );
        }

        if (filters.status) {
            filteredEvents = filteredEvents.filter(event => event.status === filters.status);
        }

        return {
            success: true,
            events: filteredEvents.sort((a, b) => new Date(a.date) - new Date(b.date))
        };
    }

    // Actualizar evento
    updateEvent(sessionId, eventId, updateData) {
        // Validar permisos
        if (!sessionId || !this.validateAdminPermission(sessionId)) {
            return {
                success: false,
                message: 'Sin permisos para modificar eventos'
            };
        }

        const eventIndex = this.events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
            return {
                success: false,
                message: 'Evento no encontrado'
            };
        }

        // Actualizar campos permitidos
        const allowedFields = ['title', 'description', 'date', 'time', 'facility', 'assignedTo', 'priority', 'status'];
        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                this.events[eventIndex][field] = updateData[field];
            }
        });

        this.events[eventIndex].updatedAt = new Date().toISOString();
        this.saveEventsToStorage();

        return {
            success: true,
            message: 'Evento actualizado exitosamente',
            event: this.events[eventIndex]
        };
    }

    // Eliminar evento
    deleteEvent(sessionId, eventId) {
        // Validar permisos
        if (!sessionId || !this.validateAdminPermission(sessionId)) {
            return {
                success: false,
                message: 'Sin permisos para eliminar eventos'
            };
        }

        const eventIndex = this.events.findIndex(e => e.id === eventId);
        if (eventIndex === -1) {
            return {
                success: false,
                message: 'Evento no encontrado'
            };
        }

        this.events.splice(eventIndex, 1);
        this.saveEventsToStorage();

        return {
            success: true,
            message: 'Evento eliminado exitosamente'
        };
    }

    // Marcar evento como completado
    completeEvent(sessionId, eventId) {
        return this.updateEvent(sessionId, eventId, { 
            status: 'completed',
            completedAt: new Date().toISOString()
        });
    }

    // Validar permisos de administrador
    validateAdminPermission(sessionId) {
        // Esta función debería verificar con el sistema de autenticación
        // Por ahora es una implementación simplificada
        return true; // En la implementación real, verificar permisos de administrador
    }

    // Obtener eventos próximos (para dashboard)
    getUpcomingEvents(sessionId, days = 7) {
        if (!sessionId || !this.validateAdminPermission(sessionId)) {
            return {
                success: false,
                message: 'Sin permisos para ver eventos'
            };
        }

        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const upcomingEvents = this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate >= now && eventDate <= futureDate && event.status === 'scheduled';
        });

        return {
            success: true,
            events: upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date))
        };
    }
}

// Exportar para uso en diferentes entornos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthenticationSystem, CalendarManagementSystem, MaintenanceManagementSystem };
} else if (typeof window !== 'undefined') {
    window.GMPI = { AuthenticationSystem, CalendarManagementSystem, MaintenanceManagementSystem };
}

// Inicializar sistema (para demo)
console.log('🏫 GMPI - Gestor de Mantenimiento Preventivo Inicializado');
console.log('📧 Usuario: admin@colegio.edu / admin123');

// Crear instancia global para demo
const gmpiSystem = new MaintenanceManagementSystem();

// Función helper para testing
function testLogin() {
    const result = gmpiSystem.login('admin@colegio.edu', 'admin123');
    console.log('Test Login Result:', result);
    
    if (result.success) {
        const dashboardData = gmpiSystem.getDashboardData(result.session.id);
        console.log('Dashboard Data:', dashboardData);
    }
    
    return result;
}

# 🏗️ GMPI - Sistema de Gestión de Mantenimiento Preventivo de Infraestructuras

## 📋 Descripción del Proyecto

GMPI es una aplicación web completa para la gestión de mantenimiento preventivo de infraestructuras educativas (universidades, colegios, escuelas, institutos). Incluye un frontend moderno y un backend robusto con base de datos.

## 🚀 Funcionalidades Principales

### ✅ Gestión de Instituciones

- ✅ Crear, editar, eliminar y visualizar instituciones
- ✅ Clasificación por tipo (universidad, colegio, escuela, instituto)
- ✅ Información detallada: ubicación, contacto, capacidades
- ✅ Estadísticas de infraestructura

### ✅ Gestión de Infraestructuras

- ✅ Gestión de facultades y edificios por institución
- ✅ Control de aulas, laboratorios y espacios
- ✅ Estado y condiciones de las instalaciones

### ✅ Sistema de Mantenimiento

- ✅ Programación de mantenimientos preventivos y correctivos
- ✅ Estados: programado, en progreso, completado, vencido
- ✅ Prioridades: baja, media, alta, crítica
- ✅ Control de costos y proveedores
- ✅ Historial completo de mantenimientos

### ✅ Búsqueda y Filtros Avanzados

- ✅ Búsqueda inteligente con autocompletado
- ✅ Filtros por tipo, ubicación, estado
- ✅ Búsqueda en tiempo real

### ✅ Reportes y Estadísticas

- ✅ Dashboard con métricas principales
- ✅ Reportes de mantenimientos próximos y vencidos
- ✅ Análisis de costos por período
- ✅ Estadísticas por institución

### ✅ Sistema de Archivos

- ✅ Subida de documentos y fotos
- ✅ Gestión de archivos adjuntos
- ✅ Soporte para múltiples formatos

### ✅ Autenticación y Seguridad

- ✅ Sistema de usuarios con roles
- ✅ Autenticación JWT
- ✅ Protección de rutas
- ✅ Rate limiting

## 🛠️ Tecnologías Utilizadas

### Frontend

- **HTML5, CSS3, JavaScript ES6+**
- **Responsive Design** con CSS Grid/Flexbox
- **Modales interactivos** con animaciones
- **API Client** para comunicación con backend
- **LocalStorage** para persistencia offline

### Backend

- **Node.js** con Express.js
- **SQLite** para desarrollo / **PostgreSQL** para producción
- **JWT** para autenticación
- **bcrypt** para hash de contraseñas
- **Multer** para subida de archivos
- **Express-validator** para validaciones
- **Helmet** y **CORS** para seguridad

### Base de Datos

- **Estructura relacional** con foreign keys
- **Índices optimizados** para búsquedas rápidas
- **Soft deletes** para mantener historial
- **Triggers automáticos** para fechas

## 📁 Estructura del Proyecto

```
INTERFAZ-Infres/
├── FRONTEND/                    # Interfaz de usuario
│   ├── html/                    # Páginas HTML
│   │   ├── index.html          # Página principal/portal
│   │   ├── infraestructuras.html # Gestión principal
│   │   ├── dashboard.html      # Panel de control
│   │   ├── edit-institution.html # Edición de instituciones
│   │   └── components/         # Componentes reutilizables
│   ├── css/                     # Hojas de estilo
│   │   ├── styles.css          # Estilos principales
│   │   ├── infraestructuras.css # Estilos específicos
│   │   └── dark-theme.css      # Tema oscuro
│   └── javascript/              # Scripts del cliente
│       ├── api-client.js       # Cliente API principal
│       ├── universal-header.js  # Header universal
│       └── navigation.js       # Navegación
├── BACKEND/                     # Servidor y API
│   ├── server.js               # Servidor principal
│   ├── config/                 # Configuraciones
│   │   └── database.js         # Configuración DB
│   ├── routes/                 # Rutas de la API
│   │   ├── institutions.js     # CRUD instituciones
│   │   ├── infrastructure.js   # CRUD infraestructuras
│   │   ├── maintenance.js      # CRUD mantenimientos
│   │   ├── reports.js          # Reportes y estadísticas
│   │   ├── auth.js             # Autenticación
│   │   └── upload.js           # Subida de archivos
│   ├── database/               # Base de datos SQLite
│   ├── uploads/                # Archivos subidos
│   └── package.json            # Dependencias
├── scripts/                     # Scripts de despliegue
│   ├── deploy.sh               # Despliegue Linux/Mac
│   └── deploy.bat              # Despliegue Windows
├── vercel.json                 # Configuración Vercel
└── README.md                   # Esta documentación
```

## 🌐 Opciones de Despliegue

### 1. 🎯 **RECOMENDADO: Vercel (Gratis)**

#### Ventajas:

- ✅ **Gratis** para proyectos personales
- ✅ **Deploy automático** desde Git
- ✅ **CDN global** para máximo rendimiento
- ✅ **HTTPS automático** con certificado SSL
- ✅ **Dominio personalizable**
- ✅ **Serverless** - escala automáticamente

#### Pasos para Vercel:

1. **Preparar el repositorio:**

```bash
# Instalar Vercel CLI
npm install -g vercel

# En la carpeta del proyecto
cd INTERFAZ-Infres
```

2. **Configurar variables de entorno en Vercel:**

```
NODE_ENV=production
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
ALLOWED_ORIGINS=https://tu-dominio.vercel.app
```

3. **Desplegar:**

```bash
vercel --prod
```

#### Configuración adicional:

- El archivo `vercel.json` ya está configurado
- La base de datos SQLite funcionará en desarrollo
- Para producción, considera migrar a **PostgreSQL** (Vercel Postgres)

---

### 2. 🚂 **Railway (Recomendado para full-stack)**

#### Ventajas:

- ✅ **$5/mes** con base de datos PostgreSQL incluida
- ✅ **Deploy desde Git** automático
- ✅ **Base de datos persistente**
- ✅ **Logs en tiempo real**
- ✅ **Variables de entorno** fáciles

#### Pasos para Railway:

1. **Crear cuenta en Railway.app**
2. **Conectar repositorio de GitHub**
3. **Agregar PostgreSQL addon**
4. **Configurar variables:**

```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
```

---

### 3. 📦 **Render (Alternativa gratuita)**

#### Ventajas:

- ✅ **Plan gratuito** disponible
- ✅ **PostgreSQL gratis** (limitado)
- ✅ **SSL automático**
- ✅ **Deploy desde Git**

#### Limitaciones del plan gratuito:

- ❌ Se "duerme" después de inactividad
- ❌ Arranque lento en primera carga

---

### 4. 💻 **Servidor VPS (DigitalOcean, Vultr, etc.)**

#### Para proyectos de producción serios:

- ✅ **Control total** del servidor
- ✅ **Performance predecible**
- ✅ **Base de datos dedicada**
- ❌ Requiere conocimientos de **DevOps**
- ❌ **$5-20/mes** aproximadamente

---

## 🔧 Configuración de Base de Datos

### SQLite (Desarrollo)

```env
DB_TYPE=sqlite
DB_PATH=./database/gmpi.db
```

### PostgreSQL (Producción)

```env
DB_TYPE=postgresql
DATABASE_URL=postgresql://user:password@host:port/database
```

### Migración automática:

El sistema detecta automáticamente el tipo de base de datos y:

1. ✅ Crea las tablas necesarias
2. ✅ Inserta datos iniciales
3. ✅ Configura índices para optimización

---

## 🚀 Instrucciones de Despliegue Paso a Paso

### Opción A: Despliegue Rápido en Vercel

1. **Subir código a GitHub:**

```bash
git init
git add .
git commit -m "Initial GMPI deployment"
git branch -M main
git remote add origin https://github.com/tu-usuario/gmpi-sistema.git
git push -u origin main
```

2. **Conectar con Vercel:**

- Ve a [vercel.com](https://vercel.com)
- Conecta tu repositorio de GitHub
- ✅ Vercel detectará automáticamente la configuración

3. **Configurar variables de entorno en Vercel:**

```
NODE_ENV=production
JWT_SECRET=tu_jwt_secret_cambiar_por_uno_seguro
ALLOWED_ORIGINS=https://tu-proyecto.vercel.app
```

4. **¡Listo!** Tu aplicación estará disponible en `https://tu-proyecto.vercel.app`

### Opción B: Script Automatizado

```bash
# Windows
cd INTERFAZ-Infres
scripts/deploy.bat

# Linux/Mac
cd INTERFAZ-Infres
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

---

## 🔒 Configuración de Seguridad

### Variables de Entorno Críticas:

```env
# JWT Secret (CAMBIAR OBLIGATORIAMENTE)
JWT_SECRET=tu_jwt_secret_super_seguro_de_al_menos_32_caracteres

# CORS - Dominios permitidos
ALLOWED_ORIGINS=https://tu-dominio.com,https://tu-dominio.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW=15  # minutos
RATE_LIMIT_MAX=100    # peticiones por ventana

# Encriptación
BCRYPT_ROUNDS=12
```

### Recomendaciones de Seguridad:

- ✅ **Cambiar JWT_SECRET** en producción
- ✅ **Configurar CORS** solo para tu dominio
- ✅ **HTTPS obligatorio** en producción
- ✅ **Rate limiting** habilitado
- ✅ **Validation** en todos los endpoints
- ✅ **Sanitización** de inputs

---

## 📊 Monitoreo y Mantenimiento

### Logs y Debugging:

```bash
# Ver logs en desarrollo
npm run dev

# Ver logs en Vercel
vercel logs

# Ver logs en Railway
railway logs
```

### Backup de Base de Datos:

```bash
# SQLite
cp database/gmpi.db backup/gmpi-$(date +%Y%m%d).db

# PostgreSQL
pg_dump $DATABASE_URL > backup/gmpi-$(date +%Y%m%d).sql
```

### Actualizaciones:

```bash
# Actualizar dependencias
npm update

# Deploy nueva versión
git add .
git commit -m "Update: descripción del cambio"
git push
```

---

## 🛡️ Resolución de Problemas Comunes

### Error: "API not responding"

**Solución:** Verificar que las variables de entorno estén configuradas correctamente.

### Error: "Database connection failed"

**Solución:** Verificar `DATABASE_URL` o ruta de SQLite.

### Error: "CORS blocked"

**Solución:** Agregar tu dominio a `ALLOWED_ORIGINS`.

### Error: "Token expired"

**Solución:** El sistema redirige automáticamente al login.

### Performance lento:

- ✅ Verificar índices de base de datos
- ✅ Optimizar consultas pesadas
- ✅ Usar CDN para archivos estáticos

---

## 📞 Soporte y Mantenimiento

### Estructura de Soporte:

1. **Documentación** - Este README
2. **Logs del sistema** - Consultar en plataforma de hosting
3. **Base de datos** - Queries de diagnóstico incluidas
4. **API Testing** - Endpoints documentados

### Escalabilidad:

- **SQLite**: Hasta 1,000 usuarios concurrentes
- **PostgreSQL**: Sin límites prácticos
- **Archivos**: Considerar CDN para +100MB

---

## 🎯 Próximas Mejoras Sugeridas

### Funcionalidades Futuras:

- 📧 **Notificaciones por email** para mantenimientos vencidos
- 📱 **App móvil** con React Native
- 🔔 **Push notifications** del navegador
- 📈 **Analytics avanzados** con gráficos
- 🗓️ **Calendario integrado** para programación
- 👥 **Gestión de equipos** y permisos granulares
- 🔄 **API pública** para integraciones
- 🌍 **Multi-idioma** (inglés, portugués)

### Optimizaciones Técnicas:

- ⚡ **Caching con Redis**
- 🔍 **Búsqueda full-text** con Elasticsearch
- 📊 **Dashboard en tiempo real** con WebSockets
- 🏗️ **Microservicios** para mayor escalabilidad

---

## ✅ Lista de Verificación Pre-Despliegue

- [ ] **Código subido a Git** con commits descriptivos
- [ ] **Variables de entorno configuradas** en la plataforma
- [ ] **JWT_SECRET cambiado** por uno seguro único
- [ ] **CORS configurado** para tu dominio específico
- [ ] **Base de datos** lista (SQLite para desarrollo, PostgreSQL para producción)
- [ ] **Archivos de configuración** (`vercel.json`, etc.) incluidos
- [ ] **Scripts de deploy** testados
- [ ] **Dominio personalizado** configurado (opcional)
- [ ] **SSL/HTTPS** habilitado automáticamente
- [ ] **Pruebas funcionales** realizadas

---

## 🎉 ¡Listo para Producción!

Tu sistema GMPI está completamente preparado para ser desplegado en producción con:

- ✅ **Backend robusto** con API REST completa
- ✅ **Base de datos relacional** optimizada
- ✅ **Frontend moderno** y responsive
- ✅ **Seguridad implementada** con mejores prácticas
- ✅ **Escalabilidad** para crecimiento futuro
- ✅ **Documentación completa** para mantenimiento

**¡Despliega con confianza y gestiona infraestructuras como un profesional!** 🚀

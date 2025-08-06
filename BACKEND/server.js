const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Cargar dotenv solo si está disponible (para desarrollo local)
try {
  require('dotenv').config();
} catch (err) {
  console.log('dotenv not available, using environment variables from system');
}

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de seguridad
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: {
    error: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
  }
});
app.use('/api/', limiter);

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
  process.env.ALLOWED_ORIGINS.split(',') : 
  ['http://localhost:3000', 'http://localhost:8080'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware general
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../FRONTEND')));

// Base de datos
const Database = require('./config/database');
const db = new Database();

// Inicializar base de datos
db.initialize().then(() => {
  console.log('✅ Base de datos inicializada correctamente');
}).catch(err => {
  console.error('❌ Error al inicializar la base de datos:', err);
});

// Rutas de la API
app.use('/api/auth', require('./routes/auth').router);
app.use('/api/institutions', require('./routes/institutions'));
app.use('/api/infrastructure', require('./routes/infrastructure'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/upload', require('./routes/upload'));

// Ruta para servir el frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/html/index.html'));
});

app.get('/infraestructuras', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/html/infraestructuras.html'));
});

app.get('/edit-institution', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/html/edit-institution.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../FRONTEND/html/dashboard.html'));
});

// Manejo de errores 404
app.use('*', (req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(404).json({
      success: false,
      message: 'Endpoint no encontrado'
    });
  } else {
    res.sendFile(path.join(__dirname, '../FRONTEND/html/index.html'));
  }
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error del servidor:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Error interno del servidor' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor GMPI ejecutándose en puerto ${PORT}`);
  console.log(`🌐 Modo: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📂 Sirviendo frontend desde: ${path.join(__dirname, '../FRONTEND')}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('🔄 Cerrando servidor...');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 Cerrando servidor...');
  db.close();
  process.exit(0);
});

module.exports = app;

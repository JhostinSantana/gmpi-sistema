const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const Database = require('../config/database');
const router = express.Router();

const db = new Database();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  next();
};

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acceso denegado. Token requerido.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// POST /api/auth/register - Registrar nuevo usuario
router.post('/register',
  [
    body('username').trim().isLength({ min: 3 }).withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('role').optional().isIn(['admin', 'user']).withMessage('Rol inválido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { username, email, password, role = 'user' } = req.body;
      
      // Verificar si el usuario ya existe
      const existingUser = await db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'El usuario o email ya existe'
        });
      }
      
      // Hashear la contraseña
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      // Crear usuario
      const result = await db.run(`
        INSERT INTO users (username, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `, [username, email, password_hash, role]);
      
      // Generar JWT
      const token = jwt.sign(
        { 
          id: result.id, 
          username, 
          email, 
          role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          id: result.id,
          username,
          email,
          role,
          token
        }
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario'
      });
    }
  }
);

// POST /api/auth/login - Iniciar sesión
router.post('/login',
  [
    body('login').trim().notEmpty().withMessage('Username o email requerido'),
    body('password').notEmpty().withMessage('Contraseña requerida')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { login, password } = req.body;
      
      // Buscar usuario por username o email
      const user = await db.get(`
        SELECT id, username, email, password_hash, role
        FROM users 
        WHERE username = ? OR email = ?
      `, [login, login]);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      
      // Verificar contraseña
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }
      
      // Generar JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );
      
      res.json({
        success: true,
        message: 'Login exitoso',
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          token
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión'
      });
    }
  }
);

// GET /api/auth/profile - Obtener perfil del usuario
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await db.get(`
      SELECT id, username, email, role, created_at, updated_at
      FROM users 
      WHERE id = ?
    `, [req.user.id]);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil'
    });
  }
});

// PUT /api/auth/profile - Actualizar perfil
router.put('/profile',
  verifyToken,
  [
    body('username').optional().trim().isLength({ min: 3 }),
    body('email').optional().isEmail(),
    body('currentPassword').optional().notEmpty(),
    body('newPassword').optional().isLength({ min: 6 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { username, email, currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      // Si se quiere cambiar la contraseña, verificar la actual
      if (newPassword && currentPassword) {
        const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [userId]);
        const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
        
        if (!validPassword) {
          return res.status(400).json({
            success: false,
            message: 'Contraseña actual incorrecta'
          });
        }
        
        const password_hash = await bcrypt.hash(newPassword, 12);
        await db.run('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [password_hash, userId]);
      }
      
      // Actualizar otros campos
      if (username || email) {
        const updates = [];
        const values = [];
        
        if (username) {
          updates.push('username = ?');
          values.push(username);
        }
        
        if (email) {
          updates.push('email = ?');
          values.push(email);
        }
        
        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(userId);
        
        await db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
      }
      
      const updatedUser = await db.get(`
        SELECT id, username, email, role, created_at, updated_at
        FROM users WHERE id = ?
      `, [userId]);
      
      res.json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: updatedUser
      });
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el perfil'
      });
    }
  }
);

// POST /api/auth/refresh - Renovar token
router.post('/refresh', verifyToken, async (req, res) => {
  try {
    const newToken = jwt.sign(
      { 
        id: req.user.id, 
        username: req.user.username, 
        email: req.user.email, 
        role: req.user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({
      success: true,
      message: 'Token renovado exitosamente',
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Error renovando token:', error);
    res.status(500).json({
      success: false,
      message: 'Error al renovar el token'
    });
  }
});

module.exports = { router, verifyToken };

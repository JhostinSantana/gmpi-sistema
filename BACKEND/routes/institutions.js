const express = require('express');
const { body, validationResult } = require('express-validator');
const Database = require('../config/database');
const router = express.Router();

// Instancia de base de datos
const db = new Database();

// Middleware para validar errores
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

// GET /api/institutions - Obtener todas las instituciones
router.get('/', async (req, res) => {
  try {
    const { type, status = 'active', search } = req.query;
    
    let query = 'SELECT * FROM institutions WHERE status = ?';
    let params = [status];
    
    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    
    if (search) {
      query += ' AND (name LIKE ? OR location LIKE ? OR acronym LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY name ASC';
    
    const institutions = await db.all(query, params);
    
    // Obtener estadísticas de mantenimiento para cada institución
    for (let institution of institutions) {
      const maintenanceStats = await db.get(`
        SELECT 
          COUNT(*) as total_maintenance,
          COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as pending_maintenance,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_maintenance,
          MAX(completed_date) as last_maintenance,
          MIN(CASE WHEN status = 'scheduled' THEN scheduled_date END) as next_maintenance
        FROM maintenance_records 
        WHERE institution_id = ?
      `, [institution.id]);
      
      institution.maintenance_stats = maintenanceStats;
    }
    
    res.json({
      success: true,
      data: institutions,
      count: institutions.length
    });
  } catch (error) {
    console.error('Error obteniendo instituciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las instituciones'
    });
  }
});

// GET /api/institutions/:id - Obtener una institución específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const institution = await db.get(
      'SELECT * FROM institutions WHERE id = ? AND status = ?',
      [id, 'active']
    );
    
    if (!institution) {
      return res.status(404).json({
        success: false,
        message: 'Institución no encontrada'
      });
    }
    
    // Obtener infraestructuras asociadas
    const infrastructures = await db.all(
      'SELECT * FROM infrastructures WHERE institution_id = ? AND status = ?',
      [id, 'active']
    );
    
    // Obtener historial de mantenimiento
    const maintenanceHistory = await db.all(
      `SELECT * FROM maintenance_records 
       WHERE institution_id = ? 
       ORDER BY scheduled_date DESC 
       LIMIT 10`,
      [id]
    );
    
    institution.infrastructures = infrastructures;
    institution.maintenance_history = maintenanceHistory;
    
    res.json({
      success: true,
      data: institution
    });
  } catch (error) {
    console.error('Error obteniendo institución:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la institución'
    });
  }
});

// POST /api/institutions - Crear nueva institución
router.post('/',
  [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('type').isIn(['universidad', 'colegio', 'escuela', 'instituto']).withMessage('Tipo de institución inválido'),
    body('location').trim().notEmpty().withMessage('La ubicación es requerida'),
    body('buildings_count').isInt({ min: 0 }).withMessage('Número de edificios debe ser un entero positivo'),
    body('classrooms_count').isInt({ min: 0 }).withMessage('Número de aulas debe ser un entero positivo'),
    body('laboratories_count').isInt({ min: 0 }).withMessage('Número de laboratorios debe ser un entero positivo')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        name,
        type,
        acronym,
        location,
        address,
        phone,
        email,
        website,
        buildings_count = 0,
        classrooms_count = 0,
        laboratories_count = 0
      } = req.body;
      
      // Verificar si ya existe una institución con el mismo nombre
      const existing = await db.get('SELECT id FROM institutions WHERE name = ?', [name]);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una institución con ese nombre'
        });
      }
      
      const total_capacity = (classrooms_count * 30) + (laboratories_count * 20);
      
      const result = await db.run(`
        INSERT INTO institutions (
          name, type, acronym, location, address, phone, email, website,
          buildings_count, classrooms_count, laboratories_count, total_capacity
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        name, type, acronym, location, address, phone, email, website,
        buildings_count, classrooms_count, laboratories_count, total_capacity
      ]);
      
      const newInstitution = await db.get('SELECT * FROM institutions WHERE id = ?', [result.id]);
      
      res.status(201).json({
        success: true,
        message: 'Institución creada exitosamente',
        data: newInstitution
      });
    } catch (error) {
      console.error('Error creando institución:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la institución'
      });
    }
  }
);

// PUT /api/institutions/:id - Actualizar institución
router.put('/:id',
  [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('type').isIn(['universidad', 'colegio', 'escuela', 'instituto']).withMessage('Tipo de institución inválido'),
    body('location').trim().notEmpty().withMessage('La ubicación es requerida')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        type,
        acronym,
        location,
        address,
        phone,
        email,
        website,
        buildings_count = 0,
        classrooms_count = 0,
        laboratories_count = 0
      } = req.body;
      
      // Verificar si la institución existe
      const existing = await db.get('SELECT id FROM institutions WHERE id = ? AND status = ?', [id, 'active']);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Institución no encontrada'
        });
      }
      
      const total_capacity = (classrooms_count * 30) + (laboratories_count * 20);
      
      await db.run(`
        UPDATE institutions SET
          name = ?, type = ?, acronym = ?, location = ?, address = ?,
          phone = ?, email = ?, website = ?, buildings_count = ?,
          classrooms_count = ?, laboratories_count = ?, total_capacity = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        name, type, acronym, location, address, phone, email, website,
        buildings_count, classrooms_count, laboratories_count, total_capacity, id
      ]);
      
      const updatedInstitution = await db.get('SELECT * FROM institutions WHERE id = ?', [id]);
      
      res.json({
        success: true,
        message: 'Institución actualizada exitosamente',
        data: updatedInstitution
      });
    } catch (error) {
      console.error('Error actualizando institución:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la institución'
      });
    }
  }
);

// DELETE /api/institutions/:id - Eliminar institución (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar si la institución existe
    const existing = await db.get('SELECT id FROM institutions WHERE id = ? AND status = ?', [id, 'active']);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Institución no encontrada'
      });
    }
    
    // Soft delete
    await db.run(
      'UPDATE institutions SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['deleted', id]
    );
    
    res.json({
      success: true,
      message: 'Institución eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando institución:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la institución'
    });
  }
});

// GET /api/institutions/stats/summary - Estadísticas generales
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_institutions,
        COUNT(CASE WHEN type = 'universidad' THEN 1 END) as universities,
        COUNT(CASE WHEN type = 'colegio' THEN 1 END) as colleges,
        COUNT(CASE WHEN type = 'escuela' THEN 1 END) as schools,
        COUNT(CASE WHEN type = 'instituto' THEN 1 END) as institutes,
        SUM(buildings_count) as total_buildings,
        SUM(classrooms_count) as total_classrooms,
        SUM(laboratories_count) as total_laboratories,
        SUM(total_capacity) as total_capacity
      FROM institutions WHERE status = 'active'
    `);
    
    const maintenanceStats = await db.get(`
      SELECT 
        COUNT(*) as total_maintenance,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as pending_maintenance,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_maintenance,
        COUNT(CASE WHEN status = 'overdue' THEN 1 END) as overdue_maintenance
      FROM maintenance_records
    `);
    
    res.json({
      success: true,
      data: {
        institutions: stats,
        maintenance: maintenanceStats
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las estadísticas'
    });
  }
});

module.exports = router;

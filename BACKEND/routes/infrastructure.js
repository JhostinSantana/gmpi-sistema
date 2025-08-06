const express = require('express');
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

// GET /api/infrastructure - Obtener todas las infraestructuras
router.get('/', async (req, res) => {
  try {
    const { institution_id, type, status = 'active' } = req.query;
    
    let query = `
      SELECT i.*, inst.name as institution_name, inst.type as institution_type
      FROM infrastructures i
      LEFT JOIN institutions inst ON i.institution_id = inst.id
      WHERE i.status = ?
    `;
    let params = [status];
    
    if (institution_id) {
      query += ' AND i.institution_id = ?';
      params.push(institution_id);
    }
    
    if (type) {
      query += ' AND i.type = ?';
      params.push(type);
    }
    
    query += ' ORDER BY inst.name ASC, i.name ASC';
    
    const infrastructures = await db.all(query, params);
    
    res.json({
      success: true,
      data: infrastructures,
      count: infrastructures.length
    });
  } catch (error) {
    console.error('Error obteniendo infraestructuras:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las infraestructuras'
    });
  }
});

// GET /api/infrastructure/:id - Obtener una infraestructura específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const infrastructure = await db.get(`
      SELECT i.*, inst.name as institution_name, inst.type as institution_type
      FROM infrastructures i
      LEFT JOIN institutions inst ON i.institution_id = inst.id
      WHERE i.id = ? AND i.status = ?
    `, [id, 'active']);
    
    if (!infrastructure) {
      return res.status(404).json({
        success: false,
        message: 'Infraestructura no encontrada'
      });
    }
    
    // Obtener historial de mantenimiento
    const maintenanceHistory = await db.all(
      `SELECT * FROM maintenance_records 
       WHERE infrastructure_id = ? 
       ORDER BY scheduled_date DESC`,
      [id]
    );
    
    infrastructure.maintenance_history = maintenanceHistory;
    
    res.json({
      success: true,
      data: infrastructure
    });
  } catch (error) {
    console.error('Error obteniendo infraestructura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la infraestructura'
    });
  }
});

// POST /api/infrastructure - Crear nueva infraestructura
router.post('/',
  [
    body('institution_id').isInt({ min: 1 }).withMessage('ID de institución requerido'),
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('type').trim().notEmpty().withMessage('El tipo es requerido'),
    body('capacity').optional().isInt({ min: 0 }).withMessage('La capacidad debe ser un número positivo'),
    body('area_m2').optional().isFloat({ min: 0 }).withMessage('El área debe ser un número positivo'),
    body('construction_year').optional().isInt({ min: 1800, max: new Date().getFullYear() }).withMessage('Año de construcción inválido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        institution_id,
        name,
        type,
        location,
        capacity,
        area_m2,
        construction_year,
        condition_status = 'good',
        description
      } = req.body;
      
      // Verificar que la institución existe
      const institution = await db.get('SELECT id FROM institutions WHERE id = ? AND status = ?', [institution_id, 'active']);
      if (!institution) {
        return res.status(404).json({
          success: false,
          message: 'Institución no encontrada'
        });
      }
      
      const result = await db.run(`
        INSERT INTO infrastructures (
          institution_id, name, type, location, capacity, area_m2,
          construction_year, condition_status, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        institution_id, name, type, location, capacity, area_m2,
        construction_year, condition_status, description
      ]);
      
      const newInfrastructure = await db.get(`
        SELECT i.*, inst.name as institution_name
        FROM infrastructures i
        LEFT JOIN institutions inst ON i.institution_id = inst.id
        WHERE i.id = ?
      `, [result.id]);
      
      res.status(201).json({
        success: true,
        message: 'Infraestructura creada exitosamente',
        data: newInfrastructure
      });
    } catch (error) {
      console.error('Error creando infraestructura:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la infraestructura'
      });
    }
  }
);

// PUT /api/infrastructure/:id - Actualizar infraestructura
router.put('/:id',
  [
    body('name').trim().notEmpty().withMessage('El nombre es requerido'),
    body('type').trim().notEmpty().withMessage('El tipo es requerido')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        type,
        location,
        capacity,
        area_m2,
        construction_year,
        condition_status,
        description
      } = req.body;
      
      // Verificar que la infraestructura existe
      const existing = await db.get('SELECT id FROM infrastructures WHERE id = ? AND status = ?', [id, 'active']);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Infraestructura no encontrada'
        });
      }
      
      await db.run(`
        UPDATE infrastructures SET
          name = ?, type = ?, location = ?, capacity = ?, area_m2 = ?,
          construction_year = ?, condition_status = ?, description = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        name, type, location, capacity, area_m2,
        construction_year, condition_status, description, id
      ]);
      
      const updatedInfrastructure = await db.get(`
        SELECT i.*, inst.name as institution_name
        FROM infrastructures i
        LEFT JOIN institutions inst ON i.institution_id = inst.id
        WHERE i.id = ?
      `, [id]);
      
      res.json({
        success: true,
        message: 'Infraestructura actualizada exitosamente',
        data: updatedInfrastructure
      });
    } catch (error) {
      console.error('Error actualizando infraestructura:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar la infraestructura'
      });
    }
  }
);

// DELETE /api/infrastructure/:id - Eliminar infraestructura
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await db.get('SELECT id FROM infrastructures WHERE id = ? AND status = ?', [id, 'active']);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Infraestructura no encontrada'
      });
    }
    
    await db.run(
      'UPDATE infrastructures SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['deleted', id]
    );
    
    res.json({
      success: true,
      message: 'Infraestructura eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando infraestructura:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la infraestructura'
    });
  }
});

module.exports = router;

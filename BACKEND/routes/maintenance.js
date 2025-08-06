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

// GET /api/maintenance - Obtener todos los mantenimientos
router.get('/', async (req, res) => {
  try {
    const { 
      institution_id, 
      infrastructure_id, 
      status, 
      type, 
      priority,
      start_date,
      end_date,
      overdue
    } = req.query;
    
    let query = `
      SELECT m.*, 
             i.name as institution_name,
             inf.name as infrastructure_name
      FROM maintenance_records m
      LEFT JOIN institutions i ON m.institution_id = i.id
      LEFT JOIN infrastructures inf ON m.infrastructure_id = inf.id
      WHERE 1=1
    `;
    let params = [];
    
    if (institution_id) {
      query += ' AND m.institution_id = ?';
      params.push(institution_id);
    }
    
    if (infrastructure_id) {
      query += ' AND m.infrastructure_id = ?';
      params.push(infrastructure_id);
    }
    
    if (status) {
      query += ' AND m.status = ?';
      params.push(status);
    }
    
    if (type) {
      query += ' AND m.type = ?';
      params.push(type);
    }
    
    if (priority) {
      query += ' AND m.priority = ?';
      params.push(priority);
    }
    
    if (start_date) {
      query += ' AND m.scheduled_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND m.scheduled_date <= ?';
      params.push(end_date);
    }
    
    if (overdue === 'true') {
      query += ' AND m.scheduled_date < date("now") AND m.status = "scheduled"';
    }
    
    query += ' ORDER BY m.scheduled_date DESC';
    
    const maintenance = await db.all(query, params);
    
    res.json({
      success: true,
      data: maintenance,
      count: maintenance.length
    });
  } catch (error) {
    console.error('Error obteniendo mantenimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los mantenimientos'
    });
  }
});

// GET /api/maintenance/:id - Obtener un mantenimiento específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const maintenance = await db.get(`
      SELECT m.*, 
             i.name as institution_name, i.type as institution_type,
             inf.name as infrastructure_name, inf.type as infrastructure_type
      FROM maintenance_records m
      LEFT JOIN institutions i ON m.institution_id = i.id
      LEFT JOIN infrastructures inf ON m.infrastructure_id = inf.id
      WHERE m.id = ?
    `, [id]);
    
    if (!maintenance) {
      return res.status(404).json({
        success: false,
        message: 'Mantenimiento no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Error obteniendo mantenimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el mantenimiento'
    });
  }
});

// POST /api/maintenance - Crear nuevo mantenimiento
router.post('/',
  [
    body('institution_id').optional().isInt({ min: 1 }).withMessage('ID de institución inválido'),
    body('infrastructure_id').optional().isInt({ min: 1 }).withMessage('ID de infraestructura inválido'),
    body('type').isIn(['preventivo', 'correctivo', 'predictivo', 'emergencia']).withMessage('Tipo de mantenimiento inválido'),
    body('title').trim().notEmpty().withMessage('El título es requerido'),
    body('scheduled_date').isDate().withMessage('Fecha programada inválida'),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Prioridad inválida'),
    body('cost').optional().isFloat({ min: 0 }).withMessage('El costo debe ser un número positivo')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        institution_id,
        infrastructure_id,
        type,
        title,
        description,
        scheduled_date,
        priority = 'medium',
        contractor,
        cost,
        notes
      } = req.body;
      
      // Validar que al menos institución o infraestructura esté especificada
      if (!institution_id && !infrastructure_id) {
        return res.status(400).json({
          success: false,
          message: 'Debe especificar al menos una institución o infraestructura'
        });
      }
      
      // Si se especifica infraestructura, obtener la institución asociada
      let finalInstitutionId = institution_id;
      if (infrastructure_id && !institution_id) {
        const infrastructure = await db.get('SELECT institution_id FROM infrastructures WHERE id = ?', [infrastructure_id]);
        if (infrastructure) {
          finalInstitutionId = infrastructure.institution_id;
        }
      }
      
      // Calcular próxima fecha de mantenimiento basada en el tipo
      let next_due_date = null;
      if (type === 'preventivo') {
        const scheduledDate = new Date(scheduled_date);
        scheduledDate.setMonth(scheduledDate.getMonth() + 6); // 6 meses después
        next_due_date = scheduledDate.toISOString().split('T')[0];
      }
      
      const result = await db.run(`
        INSERT INTO maintenance_records (
          institution_id, infrastructure_id, type, title, description,
          scheduled_date, next_due_date, priority, contractor, cost, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        finalInstitutionId, infrastructure_id, type, title, description,
        scheduled_date, next_due_date, priority, contractor, cost, notes
      ]);
      
      const newMaintenance = await db.get(`
        SELECT m.*, 
               i.name as institution_name,
               inf.name as infrastructure_name
        FROM maintenance_records m
        LEFT JOIN institutions i ON m.institution_id = i.id
        LEFT JOIN infrastructures inf ON m.infrastructure_id = inf.id
        WHERE m.id = ?
      `, [result.id]);
      
      res.status(201).json({
        success: true,
        message: 'Mantenimiento creado exitosamente',
        data: newMaintenance
      });
    } catch (error) {
      console.error('Error creando mantenimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el mantenimiento'
      });
    }
  }
);

// PUT /api/maintenance/:id - Actualizar mantenimiento
router.put('/:id',
  [
    body('type').optional().isIn(['preventivo', 'correctivo', 'predictivo', 'emergencia']),
    body('title').optional().trim().notEmpty(),
    body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
    body('status').optional().isIn(['scheduled', 'in_progress', 'completed', 'cancelled', 'overdue']),
    body('cost').optional().isFloat({ min: 0 })
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Verificar que el mantenimiento existe
      const existing = await db.get('SELECT id FROM maintenance_records WHERE id = ?', [id]);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Mantenimiento no encontrado'
        });
      }
      
      // Si se marca como completado, establecer fecha de completado
      if (updates.status === 'completed' && !updates.completed_date) {
        updates.completed_date = new Date().toISOString().split('T')[0];
      }
      
      // Construir consulta de actualización dinámicamente
      const fields = Object.keys(updates);
      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = Object.values(updates);
      values.push(id);
      
      await db.run(`
        UPDATE maintenance_records SET
          ${setClause},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, values);
      
      const updatedMaintenance = await db.get(`
        SELECT m.*, 
               i.name as institution_name,
               inf.name as infrastructure_name
        FROM maintenance_records m
        LEFT JOIN institutions i ON m.institution_id = i.id
        LEFT JOIN infrastructures inf ON m.infrastructure_id = inf.id
        WHERE m.id = ?
      `, [id]);
      
      res.json({
        success: true,
        message: 'Mantenimiento actualizado exitosamente',
        data: updatedMaintenance
      });
    } catch (error) {
      console.error('Error actualizando mantenimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el mantenimiento'
      });
    }
  }
);

// DELETE /api/maintenance/:id - Eliminar mantenimiento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const existing = await db.get('SELECT id FROM maintenance_records WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Mantenimiento no encontrado'
      });
    }
    
    await db.run('DELETE FROM maintenance_records WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Mantenimiento eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando mantenimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el mantenimiento'
    });
  }
});

// GET /api/maintenance/stats/dashboard - Estadísticas para dashboard
router.get('/stats/dashboard', async (req, res) => {
  try {
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'overdue' OR (status = 'scheduled' AND scheduled_date < date('now')) THEN 1 END) as overdue,
        AVG(cost) as avg_cost,
        SUM(cost) as total_cost
      FROM maintenance_records
    `);
    
    const priorityStats = await db.all(`
      SELECT priority, COUNT(*) as count
      FROM maintenance_records
      WHERE status IN ('scheduled', 'in_progress')
      GROUP BY priority
    `);
    
    const typeStats = await db.all(`
      SELECT type, COUNT(*) as count
      FROM maintenance_records
      GROUP BY type
    `);
    
    const upcoming = await db.all(`
      SELECT m.*, i.name as institution_name
      FROM maintenance_records m
      LEFT JOIN institutions i ON m.institution_id = i.id
      WHERE m.status = 'scheduled' AND m.scheduled_date <= date('now', '+7 days')
      ORDER BY m.scheduled_date ASC
      LIMIT 5
    `);
    
    res.json({
      success: true,
      data: {
        overview: stats,
        by_priority: priorityStats,
        by_type: typeStats,
        upcoming: upcoming
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de mantenimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las estadísticas'
    });
  }
});

// POST /api/maintenance/:id/complete - Marcar mantenimiento como completado
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { notes, actual_cost } = req.body;
    
    const existing = await db.get('SELECT id, type FROM maintenance_records WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Mantenimiento no encontrado'
      });
    }
    
    const completed_date = new Date().toISOString().split('T')[0];
    let next_due_date = null;
    
    // Calcular próximo mantenimiento si es preventivo
    if (existing.type === 'preventivo') {
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 6);
      next_due_date = nextDate.toISOString().split('T')[0];
    }
    
    await db.run(`
      UPDATE maintenance_records SET
        status = 'completed',
        completed_date = ?,
        next_due_date = ?,
        cost = COALESCE(?, cost),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [completed_date, next_due_date, actual_cost, notes, id]);
    
    const updatedMaintenance = await db.get(`
      SELECT m.*, 
             i.name as institution_name,
             inf.name as infrastructure_name
      FROM maintenance_records m
      LEFT JOIN institutions i ON m.institution_id = i.id
      LEFT JOIN infrastructures inf ON m.infrastructure_id = inf.id
      WHERE m.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Mantenimiento marcado como completado',
      data: updatedMaintenance
    });
  } catch (error) {
    console.error('Error completando mantenimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al completar el mantenimiento'
    });
  }
});

module.exports = router;

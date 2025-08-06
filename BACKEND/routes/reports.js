const express = require('express');
const Database = require('../config/database');
const router = express.Router();

const db = new Database();

// GET /api/reports/dashboard - Reporte general del dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Estadísticas generales
    const generalStats = await db.get(`
      SELECT 
        (SELECT COUNT(*) FROM institutions WHERE status = 'active') as total_institutions,
        (SELECT COUNT(*) FROM infrastructures WHERE status = 'active') as total_infrastructures,
        (SELECT COUNT(*) FROM maintenance_records) as total_maintenance,
        (SELECT COUNT(*) FROM maintenance_records WHERE status = 'scheduled') as pending_maintenance,
        (SELECT COUNT(*) FROM maintenance_records WHERE status = 'completed') as completed_maintenance,
        (SELECT COUNT(*) FROM maintenance_records WHERE status = 'scheduled' AND scheduled_date < date('now')) as overdue_maintenance
    `);
    
    // Distribución por tipo de institución
    const institutionTypes = await db.all(`
      SELECT type, COUNT(*) as count,
             SUM(buildings_count) as total_buildings,
             SUM(classrooms_count) as total_classrooms,
             SUM(laboratories_count) as total_laboratories
      FROM institutions 
      WHERE status = 'active'
      GROUP BY type
      ORDER BY count DESC
    `);
    
    // Mantenimientos por mes (últimos 12 meses)
    const maintenanceByMonth = await db.all(`
      SELECT 
        strftime('%Y-%m', scheduled_date) as month,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as pending,
        AVG(cost) as avg_cost
      FROM maintenance_records
      WHERE scheduled_date >= date('now', '-12 months')
      GROUP BY strftime('%Y-%m', scheduled_date)
      ORDER BY month ASC
    `);
    
    // Top 5 instituciones con más mantenimientos
    const topInstitutionsMaintenance = await db.all(`
      SELECT 
        i.name,
        i.type,
        COUNT(m.id) as total_maintenance,
        COUNT(CASE WHEN m.status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN m.status = 'scheduled' THEN 1 END) as pending,
        AVG(m.cost) as avg_cost
      FROM institutions i
      LEFT JOIN maintenance_records m ON i.id = m.institution_id
      WHERE i.status = 'active'
      GROUP BY i.id, i.name, i.type
      ORDER BY total_maintenance DESC
      LIMIT 5
    `);
    
    // Mantenimientos por prioridad
    const maintenanceByPriority = await db.all(`
      SELECT 
        priority,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled
      FROM maintenance_records
      GROUP BY priority
      ORDER BY 
        CASE priority 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END
    `);
    
    // Costos de mantenimiento
    const costAnalysis = await db.get(`
      SELECT 
        COUNT(CASE WHEN cost IS NOT NULL THEN 1 END) as records_with_cost,
        AVG(cost) as avg_cost,
        MIN(cost) as min_cost,
        MAX(cost) as max_cost,
        SUM(cost) as total_cost,
        SUM(CASE WHEN type = 'preventivo' THEN cost ELSE 0 END) as preventive_cost,
        SUM(CASE WHEN type = 'correctivo' THEN cost ELSE 0 END) as corrective_cost
      FROM maintenance_records
      WHERE cost IS NOT NULL AND cost > 0
    `);
    
    res.json({
      success: true,
      data: {
        general_stats: generalStats,
        institution_types: institutionTypes,
        maintenance_by_month: maintenanceByMonth,
        top_institutions: topInstitutionsMaintenance,
        maintenance_by_priority: maintenanceByPriority,
        cost_analysis: costAnalysis
      }
    });
  } catch (error) {
    console.error('Error generando reporte de dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte'
    });
  }
});

// GET /api/reports/maintenance - Reporte detallado de mantenimientos
router.get('/maintenance', async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      institution_id, 
      type, 
      status, 
      priority 
    } = req.query;
    
    let query = `
      SELECT 
        m.*,
        i.name as institution_name,
        i.type as institution_type,
        inf.name as infrastructure_name
      FROM maintenance_records m
      LEFT JOIN institutions i ON m.institution_id = i.id
      LEFT JOIN infrastructures inf ON m.infrastructure_id = inf.id
      WHERE 1=1
    `;
    let params = [];
    
    if (start_date) {
      query += ' AND m.scheduled_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      query += ' AND m.scheduled_date <= ?';
      params.push(end_date);
    }
    
    if (institution_id) {
      query += ' AND m.institution_id = ?';
      params.push(institution_id);
    }
    
    if (type) {
      query += ' AND m.type = ?';
      params.push(type);
    }
    
    if (status) {
      query += ' AND m.status = ?';
      params.push(status);
    }
    
    if (priority) {
      query += ' AND m.priority = ?';
      params.push(priority);
    }
    
    query += ' ORDER BY m.scheduled_date DESC';
    
    const maintenanceRecords = await db.all(query, params);
    
    // Estadísticas del reporte
    const reportStats = await db.get(`
      SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled,
        AVG(cost) as avg_cost,
        SUM(cost) as total_cost
      FROM maintenance_records m
      WHERE 1=1
      ${start_date ? 'AND m.scheduled_date >= ?' : ''}
      ${end_date ? 'AND m.scheduled_date <= ?' : ''}
      ${institution_id ? 'AND m.institution_id = ?' : ''}
      ${type ? 'AND m.type = ?' : ''}
      ${status ? 'AND m.status = ?' : ''}
      ${priority ? 'AND m.priority = ?' : ''}
    `, params);
    
    res.json({
      success: true,
      data: {
        records: maintenanceRecords,
        stats: reportStats,
        filters: {
          start_date,
          end_date,
          institution_id,
          type,
          status,
          priority
        }
      }
    });
  } catch (error) {
    console.error('Error generando reporte de mantenimiento:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte de mantenimiento'
    });
  }
});

// GET /api/reports/institutions - Reporte de instituciones
router.get('/institutions', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = `
      SELECT 
        i.*,
        COUNT(inf.id) as infrastructure_count,
        COUNT(m.id) as maintenance_count,
        COUNT(CASE WHEN m.status = 'scheduled' THEN 1 END) as pending_maintenance,
        COUNT(CASE WHEN m.status = 'completed' THEN 1 END) as completed_maintenance,
        AVG(m.cost) as avg_maintenance_cost,
        SUM(m.cost) as total_maintenance_cost,
        MAX(m.completed_date) as last_maintenance_date
      FROM institutions i
      LEFT JOIN infrastructures inf ON i.id = inf.institution_id AND inf.status = 'active'
      LEFT JOIN maintenance_records m ON i.id = m.institution_id
      WHERE i.status = 'active'
    `;
    let params = [];
    
    if (type) {
      query += ' AND i.type = ?';
      params.push(type);
    }
    
    query += `
      GROUP BY i.id
      ORDER BY i.name ASC
    `;
    
    const institutions = await db.all(query, params);
    
    // Estadísticas generales
    const summary = await db.get(`
      SELECT 
        COUNT(*) as total_institutions,
        SUM(buildings_count) as total_buildings,
        SUM(classrooms_count) as total_classrooms,
        SUM(laboratories_count) as total_laboratories,
        SUM(total_capacity) as total_capacity,
        AVG(buildings_count) as avg_buildings,
        AVG(classrooms_count) as avg_classrooms
      FROM institutions
      WHERE status = 'active'
      ${type ? 'AND type = ?' : ''}
    `, type ? [type] : []);
    
    res.json({
      success: true,
      data: {
        institutions,
        summary,
        filters: { type }
      }
    });
  } catch (error) {
    console.error('Error generando reporte de instituciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte de instituciones'
    });
  }
});

// GET /api/reports/upcoming-maintenance - Mantenimientos próximos
router.get('/upcoming-maintenance', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const upcomingMaintenance = await db.all(`
      SELECT 
        m.*,
        i.name as institution_name,
        i.type as institution_type,
        inf.name as infrastructure_name,
        julianday(m.scheduled_date) - julianday('now') as days_until
      FROM maintenance_records m
      LEFT JOIN institutions i ON m.institution_id = i.id
      LEFT JOIN infrastructures inf ON m.infrastructure_id = inf.id
      WHERE m.status = 'scheduled'
        AND m.scheduled_date <= date('now', '+' || ? || ' days')
        AND m.scheduled_date >= date('now')
      ORDER BY m.scheduled_date ASC
    `, [days]);
    
    // Mantenimientos vencidos
    const overdueMaintenance = await db.all(`
      SELECT 
        m.*,
        i.name as institution_name,
        i.type as institution_type,
        inf.name as infrastructure_name,
        julianday('now') - julianday(m.scheduled_date) as days_overdue
      FROM maintenance_records m
      LEFT JOIN institutions i ON m.institution_id = i.id
      LEFT JOIN infrastructures inf ON m.infrastructure_id = inf.id
      WHERE m.status = 'scheduled'
        AND m.scheduled_date < date('now')
      ORDER BY m.scheduled_date ASC
    `);
    
    const summary = {
      upcoming_count: upcomingMaintenance.length,
      overdue_count: overdueMaintenance.length,
      critical_upcoming: upcomingMaintenance.filter(m => m.priority === 'critical').length,
      high_priority_upcoming: upcomingMaintenance.filter(m => m.priority === 'high').length
    };
    
    res.json({
      success: true,
      data: {
        upcoming: upcomingMaintenance,
        overdue: overdueMaintenance,
        summary
      }
    });
  } catch (error) {
    console.error('Error generando reporte de mantenimientos próximos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte'
    });
  }
});

// GET /api/reports/cost-analysis - Análisis de costos
router.get('/cost-analysis', async (req, res) => {
  try {
    const { start_date, end_date, institution_id } = req.query;
    
    let whereClause = 'WHERE m.cost IS NOT NULL AND m.cost > 0';
    let params = [];
    
    if (start_date) {
      whereClause += ' AND m.scheduled_date >= ?';
      params.push(start_date);
    }
    
    if (end_date) {
      whereClause += ' AND m.scheduled_date <= ?';
      params.push(end_date);
    }
    
    if (institution_id) {
      whereClause += ' AND m.institution_id = ?';
      params.push(institution_id);
    }
    
    // Análisis general de costos
    const costSummary = await db.get(`
      SELECT 
        COUNT(*) as total_records,
        AVG(cost) as avg_cost,
        MIN(cost) as min_cost,
        MAX(cost) as max_cost,
        SUM(cost) as total_cost,
        SUM(CASE WHEN type = 'preventivo' THEN cost ELSE 0 END) as preventive_total,
        SUM(CASE WHEN type = 'correctivo' THEN cost ELSE 0 END) as corrective_total,
        SUM(CASE WHEN type = 'predictivo' THEN cost ELSE 0 END) as predictive_total,
        SUM(CASE WHEN type = 'emergencia' THEN cost ELSE 0 END) as emergency_total
      FROM maintenance_records m
      ${whereClause}
    `, params);
    
    // Costos por institución
    const costsByInstitution = await db.all(`
      SELECT 
        i.name as institution_name,
        i.type as institution_type,
        COUNT(m.id) as maintenance_count,
        AVG(m.cost) as avg_cost,
        SUM(m.cost) as total_cost
      FROM maintenance_records m
      LEFT JOIN institutions i ON m.institution_id = i.id
      ${whereClause}
      GROUP BY i.id, i.name, i.type
      ORDER BY total_cost DESC
    `, params);
    
    // Costos por mes
    const costsByMonth = await db.all(`
      SELECT 
        strftime('%Y-%m', scheduled_date) as month,
        COUNT(*) as maintenance_count,
        AVG(cost) as avg_cost,
        SUM(cost) as total_cost
      FROM maintenance_records m
      ${whereClause}
      GROUP BY strftime('%Y-%m', scheduled_date)
      ORDER BY month ASC
    `, params);
    
    res.json({
      success: true,
      data: {
        summary: costSummary,
        by_institution: costsByInstitution,
        by_month: costsByMonth,
        filters: { start_date, end_date, institution_id }
      }
    });
  } catch (error) {
    console.error('Error generando análisis de costos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el análisis de costos'
    });
  }
});

module.exports = router;

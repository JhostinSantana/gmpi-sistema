const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    this.dbPath = process.env.DB_PATH || path.join(__dirname, '../database/gmpi.db');
    this.db = null;
  }

  async initialize() {
    try {
      // Crear directorio de base de datos si no existe
      const dbDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      // Conectar a la base de datos
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Error conectando a SQLite:', err.message);
          throw err;
        }
        console.log('✅ Conectado a la base de datos SQLite');
      });

      // Habilitar foreign keys
      await this.run('PRAGMA foreign_keys = ON');

      // Crear tablas
      await this.createTables();
      
      // Insertar datos iniciales si es necesario
      await this.seedInitialData();

    } catch (error) {
      console.error('❌ Error inicializando base de datos:', error);
      throw error;
    }
  }

  async createTables() {
    const queries = [
      // Tabla de usuarios (para futuro sistema de autenticación)
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Tabla de instituciones
      `CREATE TABLE IF NOT EXISTS institutions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        acronym VARCHAR(20),
        location TEXT NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        email VARCHAR(100),
        website VARCHAR(255),
        buildings_count INTEGER DEFAULT 0,
        classrooms_count INTEGER DEFAULT 0,
        laboratories_count INTEGER DEFAULT 0,
        total_capacity INTEGER DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )`,

      // Tabla de infraestructuras/facultades
      `CREATE TABLE IF NOT EXISTS infrastructures (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        institution_id INTEGER NOT NULL,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        location TEXT,
        capacity INTEGER,
        area_m2 REAL,
        construction_year INTEGER,
        condition_status VARCHAR(50) DEFAULT 'good',
        description TEXT,
        status VARCHAR(20) DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE
      )`,

      // Tabla de mantenimientos
      `CREATE TABLE IF NOT EXISTS maintenance_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        institution_id INTEGER,
        infrastructure_id INTEGER,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        scheduled_date DATE,
        completed_date DATE,
        next_due_date DATE,
        priority VARCHAR(20) DEFAULT 'medium',
        status VARCHAR(30) DEFAULT 'scheduled',
        cost DECIMAL(10,2),
        contractor VARCHAR(255),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE CASCADE,
        FOREIGN KEY (infrastructure_id) REFERENCES infrastructures(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )`,

      // Tabla de archivos adjuntos
      `CREATE TABLE IF NOT EXISTS attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        related_table VARCHAR(50) NOT NULL,
        related_id INTEGER NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path TEXT NOT NULL,
        mime_type VARCHAR(100),
        file_size INTEGER,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        uploaded_by INTEGER,
        FOREIGN KEY (uploaded_by) REFERENCES users(id)
      )`,

      // Tabla de configuraciones del sistema
      `CREATE TABLE IF NOT EXISTS system_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key_name VARCHAR(100) UNIQUE NOT NULL,
        value TEXT,
        description TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Índices para optimización
      `CREATE INDEX IF NOT EXISTS idx_institutions_type ON institutions(type)`,
      `CREATE INDEX IF NOT EXISTS idx_institutions_status ON institutions(status)`,
      `CREATE INDEX IF NOT EXISTS idx_infrastructures_institution ON infrastructures(institution_id)`,
      `CREATE INDEX IF NOT EXISTS idx_maintenance_institution ON maintenance_records(institution_id)`,
      `CREATE INDEX IF NOT EXISTS idx_maintenance_infrastructure ON maintenance_records(infrastructure_id)`,
      `CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance_records(status)`,
      `CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance_records(scheduled_date)`,
      `CREATE INDEX IF NOT EXISTS idx_attachments_related ON attachments(related_table, related_id)`
    ];

    for (const query of queries) {
      await this.run(query);
    }

    console.log('✅ Tablas de base de datos creadas/verificadas');
  }

  async seedInitialData() {
    try {
      // Verificar si ya hay datos
      const institutionCount = await this.get('SELECT COUNT(*) as count FROM institutions');
      
      if (institutionCount.count === 0) {
        console.log('📚 Insertando datos iniciales...');
        
        const initialInstitutions = [
          {
            name: 'Universidad Laica Eloy Alfaro de Manabí',
            type: 'universidad',
            acronym: 'ULAEM',
            location: 'Manta, Manabí, Ecuador',
            address: 'Ciudadela Universitaria, Vía San Mateo',
            email: 'info@uleam.edu.ec',
            website: 'https://www.uleam.edu.ec',
            buildings_count: 8,
            classrooms_count: 45,
            laboratories_count: 12,
            total_capacity: 1800
          },
          {
            name: 'Colegio Amazonas de Quito',
            type: 'colegio',
            acronym: 'CAQ',
            location: 'Quito, Pichincha, Ecuador',
            address: 'Av. Amazonas y Colón, Quito',
            email: 'info@colegioamazonas.edu.ec',
            buildings_count: 3,
            classrooms_count: 24,
            laboratories_count: 6,
            total_capacity: 960
          },
          {
            name: 'Escuela Primaria Benito Juárez',
            type: 'escuela',
            acronym: 'EPBJ',
            location: 'Guayaquil, Guayas, Ecuador',
            address: 'Av. 9 de Octubre y Malecón, Guayaquil',
            email: 'info@benitojuarez.edu.ec',
            buildings_count: 2,
            classrooms_count: 12,
            laboratories_count: 1,
            total_capacity: 360
          }
        ];

        for (const institution of initialInstitutions) {
          const query = `
            INSERT INTO institutions (
              name, type, acronym, location, address, email, website,
              buildings_count, classrooms_count, laboratories_count, total_capacity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          
          await this.run(query, [
            institution.name, institution.type, institution.acronym,
            institution.location, institution.address, institution.email,
            institution.website, institution.buildings_count,
            institution.classrooms_count, institution.laboratories_count,
            institution.total_capacity
          ]);
        }

        // Insertar mantenimientos de ejemplo
        await this.seedMaintenanceData();

        console.log('✅ Datos iniciales insertados correctamente');
      }
    } catch (error) {
      console.error('❌ Error insertando datos iniciales:', error);
    }
  }

  async seedMaintenanceData() {
    const maintenanceData = [
      {
        institution_id: 1,
        type: 'preventivo',
        title: 'Mantenimiento de sistemas eléctricos',
        description: 'Revisión y mantenimiento de toda la instalación eléctrica',
        scheduled_date: '2025-02-20',
        next_due_date: '2025-08-20',
        priority: 'high',
        status: 'scheduled'
      },
      {
        institution_id: 1,
        type: 'correctivo',
        title: 'Reparación de filtraciones en laboratorio',
        description: 'Reparación de filtraciones detectadas en el techo del laboratorio de química',
        scheduled_date: '2025-01-15',
        completed_date: '2025-01-15',
        status: 'completed',
        cost: 850.00
      },
      {
        institution_id: 2,
        type: 'preventivo',
        title: 'Limpieza y mantenimiento de aires acondicionados',
        description: 'Mantenimiento preventivo de sistemas de climatización',
        scheduled_date: '2025-03-05',
        next_due_date: '2025-09-05',
        priority: 'medium',
        status: 'scheduled'
      }
    ];

    for (const maintenance of maintenanceData) {
      const query = `
        INSERT INTO maintenance_records (
          institution_id, type, title, description, scheduled_date,
          completed_date, next_due_date, priority, status, cost
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      await this.run(query, [
        maintenance.institution_id, maintenance.type, maintenance.title,
        maintenance.description, maintenance.scheduled_date,
        maintenance.completed_date || null, maintenance.next_due_date,
        maintenance.priority, maintenance.status, maintenance.cost || null
      ]);
    }
  }

  // Métodos de utilidad para consultas
  run(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else {
          console.log('🔐 Conexión a base de datos cerrada');
          resolve();
        }
      });
    });
  }
}

module.exports = Database;

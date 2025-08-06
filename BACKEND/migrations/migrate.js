// Script de migración y configuración inicial de GMPI
const Database = require('../config/database');

async function migrate() {
  console.log('🔧 Iniciando migración de base de datos GMPI...');
  
  const db = new Database();
  
  try {
    // Inicializar base de datos
    await db.initialize();
    
    console.log('✅ Migración completada exitosamente');
    console.log('📊 Base de datos configurada con datos iniciales');
    
    // Mostrar estadísticas
    const stats = await db.get(`
      SELECT 
        (SELECT COUNT(*) FROM institutions) as institutions,
        (SELECT COUNT(*) FROM infrastructures) as infrastructures,
        (SELECT COUNT(*) FROM maintenance_records) as maintenance_records,
        (SELECT COUNT(*) FROM users) as users
    `);
    
    console.log('\n📈 Estadísticas de la base de datos:');
    console.log(`   - Instituciones: ${stats.institutions}`);
    console.log(`   - Infraestructuras: ${stats.infrastructures}`);
    console.log(`   - Registros de mantenimiento: ${stats.maintenance_records}`);
    console.log(`   - Usuarios: ${stats.users}`);
    
    // Crear usuario administrador por defecto
    if (stats.users === 0) {
      console.log('\n👤 Creando usuario administrador por defecto...');
      const bcrypt = require('bcryptjs');
      const password_hash = await bcrypt.hash('admin123', 12);
      
      await db.run(`
        INSERT INTO users (username, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `, ['admin', 'admin@gmpi.local', password_hash, 'admin']);
      
      console.log('✅ Usuario administrador creado:');
      console.log('   - Username: admin');
      console.log('   - Password: admin123');
      console.log('   - Email: admin@gmpi.local');
      console.log('   🔐 ¡Cambia la contraseña después del primer login!');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración
if (require.main === module) {
  migrate();
}

module.exports = migrate;

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Database = require('../config/database');
const router = express.Router();

const db = new Database();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// Filtro para tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.UPLOAD_ALLOWED_TYPES ? 
    process.env.UPLOAD_ALLOWED_TYPES.split(',') :
    ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];
    
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024 // 5MB por defecto
  }
});

// POST /api/upload - Subir archivo
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }
    
    const { related_table, related_id, description } = req.body;
    
    if (!related_table || !related_id) {
      // Eliminar archivo si faltan datos requeridos
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: 'related_table y related_id son requeridos'
      });
    }
    
    // Guardar información del archivo en la base de datos
    const result = await db.run(`
      INSERT INTO attachments (
        related_table, related_id, filename, original_name,
        file_path, mime_type, file_size
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      related_table,
      related_id,
      req.file.filename,
      req.file.originalname,
      req.file.path,
      req.file.mimetype,
      req.file.size
    ]);
    
    const attachment = await db.get('SELECT * FROM attachments WHERE id = ?', [result.id]);
    
    res.status(201).json({
      success: true,
      message: 'Archivo subido exitosamente',
      data: {
        id: attachment.id,
        filename: attachment.filename,
        original_name: attachment.original_name,
        mime_type: attachment.mime_type,
        file_size: attachment.file_size,
        url: `/api/upload/files/${attachment.filename}`
      }
    });
  } catch (error) {
    // Eliminar archivo si hay error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Error subiendo archivo:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al subir el archivo'
    });
  }
});

// GET /api/upload/files/:filename - Descargar archivo
router.get('/files/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Buscar archivo en la base de datos
    const attachment = await db.get('SELECT * FROM attachments WHERE filename = ?', [filename]);
    
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }
    
    const filePath = attachment.file_path;
    
    // Verificar que el archivo existe físicamente
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado en el sistema'
      });
    }
    
    // Configurar headers para descarga
    res.setHeader('Content-Disposition', `inline; filename="${attachment.original_name}"`);
    res.setHeader('Content-Type', attachment.mime_type);
    
    // Enviar archivo
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Error descargando archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar el archivo'
    });
  }
});

// GET /api/upload/attachments/:table/:id - Obtener archivos de una entidad
router.get('/attachments/:table/:id', async (req, res) => {
  try {
    const { table, id } = req.params;
    
    const attachments = await db.all(`
      SELECT id, filename, original_name, mime_type, file_size, uploaded_at
      FROM attachments
      WHERE related_table = ? AND related_id = ?
      ORDER BY uploaded_at DESC
    `, [table, id]);
    
    // Agregar URL de descarga a cada archivo
    const attachmentsWithUrls = attachments.map(attachment => ({
      ...attachment,
      url: `/api/upload/files/${attachment.filename}`,
      download_url: `/api/upload/files/${attachment.filename}?download=true`
    }));
    
    res.json({
      success: true,
      data: attachmentsWithUrls,
      count: attachmentsWithUrls.length
    });
  } catch (error) {
    console.error('Error obteniendo archivos adjuntos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los archivos adjuntos'
    });
  }
});

// DELETE /api/upload/attachments/:id - Eliminar archivo
router.delete('/attachments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar archivo
    const attachment = await db.get('SELECT * FROM attachments WHERE id = ?', [id]);
    
    if (!attachment) {
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    }
    
    // Eliminar archivo físico
    if (fs.existsSync(attachment.file_path)) {
      fs.unlinkSync(attachment.file_path);
    }
    
    // Eliminar registro de la base de datos
    await db.run('DELETE FROM attachments WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Archivo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el archivo'
    });
  }
});

// POST /api/upload/multiple - Subir múltiples archivos
router.post('/multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionaron archivos'
      });
    }
    
    const { related_table, related_id } = req.body;
    
    if (!related_table || !related_id) {
      // Eliminar archivos si faltan datos
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
      
      return res.status(400).json({
        success: false,
        message: 'related_table y related_id son requeridos'
      });
    }
    
    const uploadedFiles = [];
    
    for (const file of req.files) {
      const result = await db.run(`
        INSERT INTO attachments (
          related_table, related_id, filename, original_name,
          file_path, mime_type, file_size
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        related_table,
        related_id,
        file.filename,
        file.originalname,
        file.path,
        file.mimetype,
        file.size
      ]);
      
      uploadedFiles.push({
        id: result.id,
        filename: file.filename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        file_size: file.size,
        url: `/api/upload/files/${file.filename}`
      });
    }
    
    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} archivos subidos exitosamente`,
      data: uploadedFiles
    });
  } catch (error) {
    // Eliminar archivos en caso de error
    if (req.files) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    console.error('Error subiendo múltiples archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir los archivos'
    });
  }
});

module.exports = router;

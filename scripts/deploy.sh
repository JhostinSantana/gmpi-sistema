#!/bin/bash

echo "🚀 Script de despliegue GMPI"
echo "================================"

# Crear directorio temporal
mkdir -p temp_deploy
cd temp_deploy

# Clonar/copiar archivos
echo "📁 Copiando archivos..."
cp -r ../FRONTEND ./
cp -r ../BACKEND ./
cp ../vercel.json ./
cp ../package*.json ./ 2>/dev/null || echo "package.json no encontrado en raíz"

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd BACKEND
npm install --production
cd ..

# Limpiar archivos innecesarios
echo "🧹 Limpiando archivos..."
find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.log" -delete 2>/dev/null || true
find . -name ".DS_Store" -delete 2>/dev/null || true

# Crear archivo de configuración de producción
echo "⚙️ Configurando para producción..."
cat > .env.production << EOF
NODE_ENV=production
PORT=3000
DB_TYPE=sqlite
DB_PATH=./database/gmpi.db
JWT_SECRET=tu_jwt_secret_super_seguro_cambiar_en_produccion
JWT_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
UPLOAD_MAX_SIZE=5242880
LOG_LEVEL=info
EOF

echo "✅ Archivos preparados para despliegue"
echo ""
echo "📋 Próximos pasos:"
echo "1. Sube esta carpeta temp_deploy a tu servicio de hosting"
echo "2. Configura las variables de entorno según tu plataforma"
echo "3. Ejecuta 'npm start' en el servidor"
echo ""
echo "🌐 Para Vercel: ejecuta 'vercel --prod' en esta carpeta"
echo "🚀 Para Railway: conecta tu repositorio Git"
echo "📦 Para Render: sube como servicio web"

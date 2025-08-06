@echo off
echo 🚀 Script de despliegue GMPI para Windows
echo ==========================================

REM Crear directorio temporal
if not exist temp_deploy mkdir temp_deploy
cd temp_deploy

REM Copiar archivos
echo 📁 Copiando archivos...
if exist ..\FRONTEND xcopy ..\FRONTEND . /E /I /H /Y > nul
if exist ..\BACKEND xcopy ..\BACKEND . /E /I /H /Y > nul
if exist ..\vercel.json copy ..\vercel.json . > nul
if exist ..\package.json copy ..\package.json . > nul

REM Instalar dependencias del backend
echo 📦 Instalando dependencias del backend...
cd BACKEND
call npm install --production
cd ..

REM Crear archivo de configuración
echo ⚙️ Configurando para producción...
(
echo NODE_ENV=production
echo PORT=3000
echo DB_TYPE=sqlite
echo DB_PATH=./database/gmpi.db
echo JWT_SECRET=tu_jwt_secret_super_seguro_cambiar_en_produccion
echo JWT_EXPIRES_IN=7d
echo BCRYPT_ROUNDS=12
echo RATE_LIMIT_WINDOW=15
echo RATE_LIMIT_MAX=100
echo UPLOAD_MAX_SIZE=5242880
echo LOG_LEVEL=info
) > .env.production

echo ✅ Archivos preparados para despliegue
echo.
echo 📋 Próximos pasos:
echo 1. Sube esta carpeta temp_deploy a tu servicio de hosting
echo 2. Configura las variables de entorno según tu plataforma
echo 3. Ejecuta 'npm start' en el servidor
echo.
echo 🌐 Para Vercel: ejecuta 'vercel --prod' en esta carpeta
echo 🚀 Para Railway: conecta tu repositorio Git
echo 📦 Para Render: sube como servicio web

pause

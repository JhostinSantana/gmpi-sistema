@echo off
title GMPI - Sistema de Gestion de Mantenimiento Preventivo
color 0A

echo.
echo  ========================================================
echo  🏗️  GMPI - SISTEMA DE GESTION DE MANTENIMIENTO PREVENTIVO
echo  ========================================================
echo.
echo  🚀 Inicializando sistema...
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo 📥 Descarga e instala Node.js desde: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js detectado

REM Ir al directorio del backend
cd /d "%~dp0BACKEND"

REM Instalar dependencias si no existen
if not exist node_modules (
    echo 📦 Instalando dependencias del backend...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas correctamente
) else (
    echo ✅ Dependencias ya instaladas
)

REM Crear archivo .env si no existe
if not exist .env (
    echo ⚙️ Creando archivo de configuración...
    (
        echo NODE_ENV=development
        echo PORT=3000
        echo DB_TYPE=sqlite
        echo DB_PATH=./database/gmpi.db
        echo JWT_SECRET=gmpi_jwt_secret_development_cambiar_en_produccion
        echo JWT_EXPIRES_IN=7d
        echo BCRYPT_ROUNDS=12
        echo ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080,http://127.0.0.1:3000
        echo RATE_LIMIT_WINDOW=15
        echo RATE_LIMIT_MAX=100
        echo UPLOAD_MAX_SIZE=5242880
        echo LOG_LEVEL=info
    ) > .env
    echo ✅ Archivo de configuración creado
)

REM Crear directorio de base de datos
if not exist database mkdir database

REM Crear directorio de uploads
if not exist uploads mkdir uploads

echo.
echo ✅ Sistema inicializado correctamente
echo.
echo 📋 Información del sistema:
echo    - Puerto del servidor: 3000
echo    - Base de datos: SQLite (desarrollo)
echo    - Frontend: http://localhost:3000
echo    - API: http://localhost:3000/api
echo.
echo 🌐 Para acceder al sistema:
echo    1. Frontend: http://localhost:3000
echo    2. Infraestructuras: http://localhost:3000/infraestructuras
echo    3. Dashboard: http://localhost:3000/dashboard
echo.

REM Preguntar si desea iniciar el servidor
set /p start="🚀 ¿Desea iniciar el servidor ahora? (s/n): "
if /i "%start%"=="s" (
    echo.
    echo 🔥 Iniciando servidor GMPI...
    echo 📍 Presiona Ctrl+C para detener el servidor
    echo.
    call npm start
) else (
    echo.
    echo 💡 Para iniciar el servidor manualmente:
    echo    cd BACKEND
    echo    npm start
    echo.
)

pause

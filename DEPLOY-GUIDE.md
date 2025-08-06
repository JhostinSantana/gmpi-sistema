# 🚀 GUÍA RÁPIDA DE DESPLIEGUE - GMPI

## ⚡ Despliegue Express (5 minutos)

### 🎯 Opción 1: Vercel (RECOMENDADO - Gratis)

1. **Sube tu código a GitHub:**

```bash
git init
git add .
git commit -m "GMPI System Deploy"
git remote add origin https://github.com/TU-USUARIO/gmpi-sistema.git
git push -u origin main
```

2. **Ve a [vercel.com](https://vercel.com) y conecta tu repositorio**

3. **Configura estas variables de entorno en Vercel:**

```
NODE_ENV=production
JWT_SECRET=cambiar_por_algo_super_seguro_aqui
ALLOWED_ORIGINS=https://tu-proyecto.vercel.app
```

4. **¡Listo!** Tu app estará en `https://tu-proyecto.vercel.app`

---

### 🚂 Opción 2: Railway (Recomendado para producción)

1. **Ve a [railway.app](https://railway.app)**
2. **Conecta tu GitHub**
3. **Agrega PostgreSQL addon**
4. **Configura variables:**

```
NODE_ENV=production
DATABASE_URL=[auto-generado por Railway]
JWT_SECRET=tu_secreto_super_seguro
```

**Costo:** ~$5/mes con base de datos incluida

---

### 💻 Opción 3: Servidor Local/VPS

```bash
# Clonar proyecto
git clone https://github.com/TU-USUARIO/gmpi-sistema.git
cd gmpi-sistema

# Configurar backend
cd BACKEND
npm install
cp .env.example .env
# Editar .env con tus configuraciones

# Iniciar servidor
npm start
```

**Acceder:** `http://tu-servidor:3000`

---

## 🔧 Variables de Entorno Esenciales

```bash
# .env (Backend)
NODE_ENV=production
PORT=3000
JWT_SECRET=cambiar_obligatoriamente_por_algo_seguro
ALLOWED_ORIGINS=https://tu-dominio.com
DB_TYPE=sqlite  # o postgresql para producción
```

---

## 📊 URLs del Sistema Desplegado

- **🏠 Inicio:** `https://tu-dominio.com/`
- **🏗️ Gestión Principal:** `https://tu-dominio.com/infraestructuras`
- **📊 Dashboard:** `https://tu-dominio.com/dashboard`
- **📝 API:** `https://tu-dominio.com/api/`

---

## 🔒 Credenciales por Defecto

**Usuario:** `admin`
**Contraseña:** `admin123`
**Email:** `admin@gmpi.local`

⚠️ **¡CAMBIAR INMEDIATAMENTE EN PRODUCCIÓN!**

---

## 🆘 Resolución de Problemas

### Error: "API not responding"

**Solución:** Verificar variables de entorno `JWT_SECRET` y `ALLOWED_ORIGINS`

### Error: "Database connection failed"

**Solución:** Para SQLite asegurar carpeta `database/` existe, para PostgreSQL verificar `DATABASE_URL`

### Error: "CORS blocked"

**Solución:** Agregar tu dominio a `ALLOWED_ORIGINS`

---

## 📞 Soporte Rápido

1. **Logs en Vercel:** `vercel logs`
2. **Logs en Railway:** `railway logs`
3. **Archivo de configuración:** Verificar `.env`
4. **Base de datos:** Ejecutar `npm run migrate` en backend

---

## ✅ Checklist Final

- [ ] Código subido a Git
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET cambiado
- [ ] Dominio personalizado (opcional)
- [ ] Prueba funcional completa
- [ ] Credenciales de admin cambiadas

---

## 🎉 ¡Sistema Listo!

Tu GMPI está desplegado y funcionando. Accede a tu dominio y comienza a gestionar infraestructuras de forma profesional.

**¿Problemas?** Revisa el `README.md` completo para documentación detallada.

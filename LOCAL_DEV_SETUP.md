# ClinvetIA - Setup Local Development

## 🚀 Inicio Rápido

### Opción 1: Script Automático (Recomendado)

```bash
# 1. Crear backup de tu .env.local actual (el de producción)
mv .env.local .env.local.backup

# 2. Copiar configuración de desarrollo
cp .env.local.dev .env.local

# 3. Iniciar base de datos local con Docker
npm run db:start

# 4. Esperar 10 segundos a que PostgreSQL esté listo

# 5. Aplicar migraciones y crear super admin
npm run db:setup

# 6. Iniciar la aplicación
npm run dev
```

### Opción 2: Comando Único

```bash
npm run dev:local
```

Este comando hace todo automáticamente:
- Copia `.env.local.dev` a `.env.local`
- Inicia PostgreSQL en Docker
- Aplica migraciones
- Crea el superadmin
- Inicia el servidor de desarrollo

---

## 📊 Accesos en Local

### Super Admin
- **URL:** http://localhost:3000/admin/login
- **Usuario:** `superadmin`
- **Contraseña:** `ClinvetIA-SuperAdmin-2026!`

### Adminer (Gestor de BD)
- **URL:** http://localhost:8080
- **Sistema:** PostgreSQL
- **Servidor:** postgres
- **Usuario:** clinvetia
- **Contraseña:** clinvetia_local_dev
- **Base de datos:** clinvetia_dev

---

## 🔧 Comandos Útiles

```bash
# Iniciar solo la base de datos
npm run db:start

# Detener la base de datos
npm run db:stop

# Aplicar migraciones
npx prisma migrate deploy

# Crear super admin (si no existe)
npm run admin:bootstrap

# Ver base de datos
npx prisma studio
```

---

## ⚠️ IMPORTANTE - Seguridad

### NUNCA uses `.env.local` de producción en desarrollo

Tu archivo `.env.local.backup` contiene la conexión a la base de datos de producción. 

**Para volver a producción (solo si realmente lo necesitas):**
```bash
mv .env.local .env.local.dev
cp .env.local.backup .env.local
```

### Base de datos local vs Producción

| Entorno | Base de datos | Reservas |
|---------|--------------|----------|
| **Local** | Docker PostgreSQL (localhost:5432) | Solo las que crees en local |
| **Producción** | Neon Cloud | Las reales de los clientes |

---

## 🐛 Solución de Problemas

### "Error: Can't reach database"
```bash
# Verificar que Docker está corriendo
docker ps

# Si no está corriendo, iniciarlo
npm run db:start

# Esperar 10 segundos y reintentar
```

### "Usuario no encontrado" al hacer login
```bash
# Recrear el super admin
npm run admin:bootstrap
```

### "Failed to parse url"
Asegúrate de tener el archivo `.env.local` con las variables correctas:
```bash
cp .env.local.dev .env.local
```

### Puerto 5432 ocupado
Si tienes otro PostgreSQL corriendo en el puerto 5432:
```bash
# Editar docker-compose.dev.yml y cambiar el puerto
# De: "5432:5432"
# A: "5433:5432"

# Y actualizar DATABASE_URL en .env.local
# De: localhost:5432
# A: localhost:5433
```

---

## 📝 Estructura de Archivos

```
├── docker-compose.dev.yml      # Configuración Docker para desarrollo
├── .env.local.dev              # Variables de entorno para desarrollo
├── .env.local.backup           # Tu archivo original (producción)
├── .env.local                  # Archivo activo (se alterna)
└── scripts/
    └── start-local-dev.sh      # Script de inicio
```

---

## 🎯 Resumen del Flujo

1. **Backup automático** de tu `.env.local` (producción)
2. **Configuración local** con PostgreSQL en Docker
3. **Migraciones aplicadas** automáticamente
4. **Superadmin creado** con credenciales locales
5. **Base de datos aislada** - No toca producción

¡Listo para desarrollar sin miedo a romper nada en producción! 🎉

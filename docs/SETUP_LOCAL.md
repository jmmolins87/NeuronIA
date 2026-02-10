# Setup Local con Docker - ClinvetIA

## 🎯 Objetivo

Configurar un entorno de desarrollo local completo con:
- ✅ Base de datos Postgres en Docker
- ✅ Variables de entorno configuradas
- ✅ Migraciones aplicadas
- ✅ Usuarios admin creados (SUPER_ADMIN + DEMO)
- ✅ Guardrails de seguridad activos

---

## 📋 Pre-requisitos

1. **Node.js 25.5.0** (ver `package.json` engines)
   ```bash
   node --version  # Debe ser v25.5.0
   ```

2. **Docker Desktop** instalado y corriendo
   ```bash
   docker --version
   docker-compose --version
   ```

3. **npm** actualizado
   ```bash
   npm --version  # Debe ser 10.x o superior
   ```

---

## 🚀 Setup Rápido (Automatizado)

### Opción 1: Usar Script Incluido

```bash
# Dar permisos de ejecución (solo la primera vez)
chmod +x scripts/setup-local.sh

# Ejecutar setup completo
./scripts/setup-local.sh
```

El script hará:
1. Copiar `.env.local.dev` → `.env.local`
2. Iniciar Docker Postgres
3. Aplicar migraciones
4. Crear usuario SUPER_ADMIN
5. Crear usuario DEMO (opcional)

### Opción 2: Setup Manual (Paso a Paso)

#### 1. Variables de Entorno

```bash
# Copiar template de env local
cp .env.local.dev .env.local

# Editar .env.local y verificar/ajustar:
nano .env.local
```

**`.env.local` mínimo:**
```bash
NODE_ENV=development
APP_URL=http://localhost:3000

# Base de datos LOCAL (Docker)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinvetia_dev

# Secrets (cambiar en producción)
ADMIN_SESSION_SECRET=local-dev-secret-min-32-characters-long
ADMIN_BOOTSTRAP_PASSWORD=local-dev-password-123

# Admin
ADMIN_BOOTSTRAP_USERNAME=superadmin
ADMIN_COOKIE_NAME=clinvetia_admin

# Email (opcional, deshabilitado por defecto)
EMAIL_ENABLED=false
```

#### 2. Iniciar Base de Datos Docker

```bash
# Iniciar Postgres en Docker
npm run db:start

# Verificar que está corriendo
docker ps | grep postgres
# Debería mostrar: postgres:15-alpine con puerto 5432
```

#### 3. Aplicar Migraciones

```bash
# Aplicar todas las migraciones de Prisma
npm run prisma:migrate:dev

# Verificar que se aplicaron correctamente
npm run prisma:studio
# Abre http://localhost:5555 y verifica las tablas
```

#### 4. Crear Usuario SUPER_ADMIN

```bash
# Script interactivo
npm run admin:bootstrap

# Te pedirá:
# - Username (default: superadmin)
# - Password (default: valor de ADMIN_BOOTSTRAP_PASSWORD)
# - Email (opcional)

# Resultado:
# ✅ Super admin created successfully:
#    Username: superadmin
#    Role: SUPER_ADMIN
#    Mode: REAL (enforced)
```

#### 5. Crear Usuario DEMO (Opcional)

**Opción A: Via Prisma Studio (GUI)**
```bash
npm run prisma:studio
```

En el navegador (http://localhost:5555):
1. Ir a tabla `AdminUser`
2. Click "Add Record"
3. Rellenar:
   - **username**: `demo`
   - **email**: `demo@clinvetia.com` (opcional)
   - **passwordHash**: (ver abajo cómo generar)
   - **role**: `ADMIN`
   - **mode**: `DEMO`
   - **isActive**: `true`
4. Click "Save 1 change"

**Opción B: Via Node.js Script**

Crear `scripts/create-demo-user.ts`:
```typescript
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const passwordHash = bcrypt.hashSync("demo123", 10)
  
  const user = await prisma.adminUser.create({
    data: {
      username: "demo",
      email: "demo@clinvetia.com",
      passwordHash,
      role: "DEMO",
      mode: "DEMO",
      isActive: true,
    },
  })

  console.log("✅ Demo user created:", user.username)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Ejecutar:
```bash
npx tsx scripts/create-demo-user.ts
```

**Generar Password Hash:**
```bash
# Opción 1: Node.js REPL
node
> const bcrypt = require('bcryptjs');
> bcrypt.hashSync('demo123', 10)
'$2a$10$...'  # Copiar este hash

# Opción 2: Script rápido
node -e "console.log(require('bcryptjs').hashSync('demo123', 10))"
```

#### 6. Verificar Setup

```bash
# Iniciar dev server
npm run dev

# Abrir http://localhost:3000/admin/login

# Login como SUPER_ADMIN:
# - Username: superadmin
# - Password: (el que configuraste)

# Verificar:
# ✅ No hay banner DEMO
# ✅ Badge "SUPER ADMIN" visible en header
# ✅ Console no muestra errores de guardrails

# Login como DEMO:
# - Username: demo
# - Password: demo123

# Verificar:
# ✅ Banner amarillo DEMO visible
# ✅ Badge "DEMO" visible en header
# ✅ Botón "Regenerar Datos" visible
# ✅ 300-800 bookings mock visibles
```

---

## 🛡️ Verificar Guardrails

### Test 1: Guardrails Aceptan Local + DB Local

```bash
# .env.local correcto:
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinvetia_dev

# Iniciar app
npm run dev

# Resultado esperado:
# ✅ Environment guardrails: PASSED (safe to run locally)
# ✅ App inicia sin errores
```

### Test 2: Guardrails Bloquean Local + DB Prod (SIMULACIÓN)

**⚠️ ADVERTENCIA: NO hagas esto con DB real de producción**

```bash
# Simular DB prod (para test)
# En .env.local TEMPORALMENTE:
NODE_ENV=development
DATABASE_URL=postgresql://fake@fake-prod.neon.tech:5432/fake_prod

# Intentar iniciar app
npm run dev

# Resultado esperado:
# 🚨 CRITICAL ENVIRONMENT ERRORS:
#   ❌ Local environment is configured with production DATABASE_URL.
#      This is EXTREMELY DANGEROUS and could corrupt production data.
# 
# Environment validation failed. Application startup blocked.
# Error: Environment validation failed...

# ✅ App NO debe iniciar
```

**Revertir cambios:**
```bash
# Restaurar .env.local correcto
cp .env.local.dev .env.local
```

---

## 🔧 Comandos Útiles

```bash
# Docker - Base de datos
npm run db:start          # Iniciar Postgres
npm run db:stop           # Detener Postgres
npm run db:reset          # Reset completo (borra datos)

# Prisma
npm run prisma:studio     # Abrir GUI de DB
npm run prisma:generate   # Regenerar Prisma client
npm run prisma:migrate:dev # Crear y aplicar migración

# Admin
npm run admin:bootstrap   # Crear super admin

# Development
npm run dev              # Iniciar dev server
npm run build            # Build de producción
npm run lint             # Linting
npm run audit            # Audits (i18n + inline styles)

# Shortcuts
npm run dev:local        # Setup + start en un comando
```

---

## 📂 Estructura de Archivos Importantes

```
clinvetia-app/
├── .env.local              # ← TU CONFIG (no commitear)
├── .env.local.dev          # ← Template para copiar
├── docker-compose.dev.yml  # ← Postgres config
├── prisma/
│   ├── schema.prisma       # ← DB schema
│   └── migrations/         # ← Migraciones
├── scripts/
│   ├── setup-local.sh      # ← Script de setup
│   ├── create-super-admin.ts
│   └── switch-env.sh       # ← Cambiar entre local/prod env
└── docs/
    ├── SETUP_LOCAL.md      # ← Este archivo
    ├── admin-demo.md       # ← Guía DEMO mode
    └── admin-demo-testing.md # ← Tests manuales
```

---

## ❓ Troubleshooting

### Error: "Port 5432 already in use"

**Causa:** Otro Postgres está corriendo en el puerto 5432.

**Solución:**
```bash
# Opción 1: Detener el Postgres existente
# Si está en Docker:
docker ps | grep postgres
docker stop <container-id>

# Si está instalado localmente (macOS):
brew services stop postgresql

# Opción 2: Cambiar puerto en docker-compose.dev.yml
# Editar docker-compose.dev.yml:
# ports:
#   - "5433:5432"  # Usar 5433 en lugar de 5432
# Y en .env.local:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5433/clinvetia_dev
```

### Error: "Environment validation failed"

**Causa:** Guardrails detectaron configuración insegura.

**Solución:**
1. Verifica `.env.local`:
   - `NODE_ENV=development` ✅
   - `APP_URL=http://localhost:3000` ✅
   - `DATABASE_URL=postgresql://...@localhost:5432/...` ✅
2. NO uses URLs de producción en local
3. Reinicia el servidor: `npm run dev`

### Error: "prisma:migrate:dev failed"

**Causa:** DB no está corriendo o hay conflicto de migraciones.

**Solución:**
```bash
# 1. Verificar que Docker está corriendo
docker ps | grep postgres

# 2. Si no está, iniciar:
npm run db:start

# 3. Si persiste, reset completo:
npm run db:reset
npm run prisma:migrate:dev
```

### No aparecen datos DEMO

**Causa:** Usuario no está en modo DEMO o DemoStoreProvider no montado.

**Solución:**
1. Verificar en `/api/admin/auth/me`:
   ```json
   { "user": { "mode": "DEMO" } }  // ← Debe ser DEMO
   ```
2. Verificar que `DemoStoreProvider` está en el layout
3. Abrir DevTools Console y buscar errores
4. Intentar regenerar datos manualmente

---

## ✅ Checklist Post-Setup

- [ ] Docker Postgres corriendo (`docker ps`)
- [ ] `.env.local` configurado correctamente
- [ ] Migraciones aplicadas (`npm run prisma:studio` muestra tablas)
- [ ] Usuario SUPER_ADMIN creado
- [ ] Usuario DEMO creado (opcional)
- [ ] App arranca sin errores (`npm run dev`)
- [ ] Login SUPER_ADMIN funciona
- [ ] Login DEMO funciona (si creado)
- [ ] Banner DEMO visible en modo DEMO
- [ ] Badges visible en header
- [ ] Guardrails validan correctamente
- [ ] No hay errores en console del navegador

---

## 🎉 ¡Listo!

Tu entorno local está configurado. Ahora puedes:

1. **Desarrollar** con datos locales (DB Docker)
2. **Probar modo DEMO** sin afectar datos reales
3. **Protegido** por guardrails contra errores

**Siguientes pasos:**
- Lee `docs/admin-demo.md` para entender DEMO vs REAL
- Ejecuta tests manuales en `docs/admin-demo-testing.md`
- ¡Empieza a desarrollar! 🚀

---

**Última actualización:** 2026-02-10  
**Versión:** 1.0.0

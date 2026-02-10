# Admin DEMO Mode - Guía Completa

## 📖 Índice

1. [Introducción](#introducción)
2. [Conceptos Clave](#conceptos-clave)
3. [Configuración Inicial](#configuración-inicial)
4. [Modo DEMO vs REAL](#modo-demo-vs-real)
5. [Protecciones de Seguridad](#protecciones-de-seguridad)
6. [Uso en Producción](#uso-en-producción)
7. [Uso en Desarrollo Local](#uso-en-desarrollo-local)
8. [Regenerar Datos DEMO](#regenerar-datos-demo)
9. [FAQ](#faq)
10. [Troubleshooting](#troubleshooting)

---

## Introducción

El sistema admin de ClinvetIA soporta dos modos de operación:

- **REAL**: Acceso completo a datos reales de la base de datos
- **DEMO**: Datos ficticios generados automáticamente para demostrar el sistema a clientes

Este documento explica cómo usar y configurar cada modo de forma segura.

---

## Conceptos Clave

### Roles de Usuario

- **SUPER_ADMIN**: Administrador principal. **SIEMPRE** en modo REAL.
- **ADMIN**: Administrador estándar. Puede estar en modo REAL o DEMO.

### Modos de Operación

- **REAL**: 
  - Acceso a base de datos real
  - Todas las mutaciones afectan datos reales
  - Requiere autenticación válida
  - Puede crear/editar/cancelar bookings reales
  
- **DEMO**:
  - Datos ficticios generados localmente (cliente)
  - Las mutaciones NO afectan la base de datos
  - Perfecto para demostraciones a clientes
  - 300-800 bookings mock, 500-1500 leads mock, 200-600 ROI calculations mock
  - Datos consistentes (misma seed = mismos datos)

### Enforcement (Aplicación Automática)

El sistema aplica automáticamente estas reglas:

1. **SUPER_ADMIN siempre es REAL**: Si se detecta un SUPER_ADMIN en modo DEMO, se corrige automáticamente a REAL
2. **No se puede elevar DEMO a SUPER_ADMIN**: Para ser SUPER_ADMIN, primero hay que cambiar a modo REAL
3. **Mutaciones bloqueadas en DEMO**: Los endpoints de mutación (cancel, reschedule, edit) rechazan usuarios DEMO

---

## Configuración Inicial

### Variables de Entorno

```bash
# .env.local (desarrollo)
APP_URL=http://localhost:3000
DATABASE_URL=postgresql://user:pass@localhost:5432/clinvetia_dev

ADMIN_SESSION_SECRET=your-secret-key-32-chars-minimum
ADMIN_BOOTSTRAP_PASSWORD=your-secure-password

# Opcional: Restringir login DEMO por origen
ADMIN_DEMO_ALLOWED_ORIGINS=https://demo.clinvetia.com,https://staging.clinvetia.com
```

```bash
# .env.production (producción en Vercel)
APP_URL=https://clinvetia.com
DATABASE_URL=postgresql://user:pass@prod-db.neon.tech:5432/clinvetia_prod

ADMIN_SESSION_SECRET=production-secret-key
ADMIN_BOOTSTRAP_PASSWORD=production-secure-password
ADMIN_DEMO_ALLOWED_ORIGINS=https://clinvetia.com
```

### Crear Usuarios

#### 1. Crear SUPER_ADMIN (Script)

```bash
npm run admin:bootstrap
```

Este script crea el usuario superadmin con:
- Role: SUPER_ADMIN
- Mode: REAL (forzado)
- Password: valor de `ADMIN_BOOTSTRAP_PASSWORD`

#### 2. Crear Usuario DEMO (Manual en DB)

Opción A: Via Prisma Studio

```bash
npm run prisma:studio
```

Crear un nuevo `AdminUser`:
- username: `demo` (o el que prefieras)
- email: `demo@clinvetia.com` (opcional)
- passwordHash: (generar con bcrypt, min 8 chars)
- role: `ADMIN`
- mode: `DEMO`
- isActive: `true`

Opción B: Via SQL

```sql
-- Primero, genera el hash de la contraseña en Node.js:
-- const bcrypt = require('bcryptjs');
-- console.log(bcrypt.hashSync('demo-password', 10));

INSERT INTO "AdminUser" (id, username, "passwordHash", role, mode, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'demo',
  '$2a$10$YOUR_HASHED_PASSWORD_HERE',
  'ADMIN',
  'DEMO',
  true,
  NOW(),
  NOW()
);
```

---

## Modo DEMO vs REAL

### Modo DEMO

#### Características

- ✅ Datos ficticios generados localmente
- ✅ No requiere llamadas a API para lectura
- ✅ Perfecto para demostrar a clientes
- ✅ Filtros, búsqueda y paginación funcionan
- ✅ Acciones de mutación afectan solo el store local
- ✅ Banner amarillo visible en dashboard
- ✅ Botón para regenerar datos

#### Datos Generados

El modo DEMO genera automáticamente:

| Tipo | Cantidad | Detalles |
|------|----------|----------|
| Bookings | 300-800 | 60% pasados, 40% futuros; estados: CONFIRMED, CANCELLED, HELD, EXPIRED |
| Leads | 500-1500 | Diferentes estados: NEW, CONTACTED, QUALIFIED, CONVERTED, LOST |
| ROI Calculations | 200-600 | Con métricas realistas: inversión, ROI%, payback period |

#### Limitaciones

- ❌ No puede crear bookings reales
- ❌ No puede cancelar bookings reales
- ❌ No puede modificar datos reales
- ❌ Cambios NO persisten al refrescar (a menos que uses la misma seed)

### Modo REAL

#### Características

- ✅ Acceso completo a base de datos
- ✅ Todas las mutaciones persisten
- ✅ Puede crear/editar/cancelar bookings
- ✅ Puede gestionar usuarios admin
- ✅ Sin banner DEMO
- ✅ Datos reales de clientes

#### Protecciones

- ✅ Guardrails en desarrollo (ver [Protecciones de Seguridad](#protecciones-de-seguridad))
- ✅ CSRF protection
- ✅ Rate limiting
- ✅ Audit logs

---

## Protecciones de Seguridad

### 1. Enforcement: SUPER_ADMIN → REAL

**¿Qué hace?**
Si un SUPER_ADMIN está accidentalmente en modo DEMO, el sistema lo corrige automáticamente a REAL en:
- Login
- Resolución de sesión
- Cualquier operación crítica

**Logs:**
```
[ENFORCEMENT] CRITICAL: SUPER_ADMIN user "superadmin" (abc123) was in DEMO mode. Auto-correcting to REAL.
```

**Auditoría:**
Se registra en `UserAdminAudit` con acción `MODE_AUTO_CORRECTED`.

### 2. Guardrails: Protección Anti-Producción en Desarrollo

**Problema que resuelve:**
Evita que un desarrollador en local con DATABASE_URL de producción afecte datos reales.

**¿Cómo funciona?**

Al iniciar la aplicación, se ejecuta `lib/admin/guardrails.ts` que verifica:

1. **NODE_ENV !== "production" + APP_URL contiene "clinvetia.com"**
   - ❌ ERROR: Entorno local usando URL de producción
   - 🛑 Aplicación NO arranca

2. **NODE_ENV !== "production" + DATABASE_URL apunta a neon prod**
   - ❌ ERROR: Entorno local usando DB de producción
   - 🛑 Aplicación NO arranca

3. **Mutaciones bloqueadas si se detecta DB prod en local**
   - ❌ Endpoints de mutación retornan 403
   - 🛑 `{ error: "Mutation blocked: Local environment detected with production database" }`

**Ejemplo:**

```bash
# ❌ MAL: En local con DB prod
NODE_ENV=development
DATABASE_URL=postgresql://...@prod-db.neon.tech/clinvetia_prod

# 🚨 Resultado:
# CRITICAL: Local environment is configured with production DATABASE_URL.
# This is EXTREMELY DANGEROUS and could corrupt production data.
# Application startup blocked.

# ✅ BIEN: En local con DB local
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/clinvetia_dev
```

### 3. Validación en Endpoints de Mutación

Todos los endpoints que modifican datos (cancel, reschedule, edit) validan:

```typescript
import { canMutateRealData } from "@/lib/admin/api-helpers"

// En el endpoint:
const mutationCheck = canMutateRealData(session.admin.mode)
if (!mutationCheck.allowed && mutationCheck.response) {
  return mutationCheck.response
}
```

Si el usuario está en modo DEMO:
```json
{
  "ok": false,
  "code": "DEMO_MODE",
  "message": "Cannot perform this action in DEMO mode. Switch to REAL mode to modify actual data."
}
```

---

## Uso en Producción

### Escenario: Demostrar Sistema a Cliente

1. **Crear usuario DEMO** (si no existe)
   ```bash
   # Via prisma studio o SQL (ver "Configuración Inicial")
   ```

2. **Login como DEMO**
   ```bash
   POST https://clinvetia.com/api/admin/auth/login
   {
     "username": "demo",
     "password": "demo-password"
   }
   ```

3. **Dashboard muestra:**
   - Banner amarillo: "🎭 MODO DEMO - Los datos mostrados son ficticios"
   - Botón "Regenerar Datos" visible
   - 300-800 bookings ficticios
   - 500-1500 leads ficticios
   - Filtros, búsqueda y paginación funcionan

4. **El cliente puede:**
   - ✅ Navegar por bookings ficticios
   - ✅ Ver métricas y gráficas
   - ✅ Probar filtros y búsqueda
   - ✅ Cancelar bookings (solo afecta store local)
   - ❌ NO puede afectar datos reales

5. **Regenerar datos si es necesario:**
   - Click en "Regenerar Datos"
   - Opcional: Ingresar seed personalizada para datos consistentes
   - Los datos se regeneran instantáneamente

### Escenario: Operación Real

1. **Login como SUPER_ADMIN o ADMIN (modo REAL)**
   ```bash
   POST https://clinvetia.com/api/admin/auth/login
   {
     "username": "superadmin",
     "password": "your-secure-password"
   }
   ```

2. **Dashboard muestra:**
   - Sin banner DEMO
   - Datos reales de la base de datos
   - Todas las mutaciones afectan datos reales

3. **El admin puede:**
   - ✅ Ver bookings reales
   - ✅ Cancelar bookings reales
   - ✅ Gestionar usuarios
   - ✅ Ver audit logs

---

## Uso en Desarrollo Local

### Setup Recomendado

#### .env.local
```bash
NODE_ENV=development
APP_URL=http://localhost:3000

# Base de datos LOCAL (Docker)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinvetia_dev

ADMIN_SESSION_SECRET=local-dev-secret-32-characters
ADMIN_BOOTSTRAP_PASSWORD=local-dev-password
```

#### docker-compose.dev.yml
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: clinvetia_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Comandos

```bash
# Iniciar DB local
npm run db:start

# Aplicar migraciones
npm run prisma:migrate:dev

# Crear superadmin local
npm run admin:bootstrap

# Iniciar dev server
npm run dev
```

### Protecciones Activas

✅ Si accidentalmente pones `DATABASE_URL` de producción:
```bash
🚨 CRITICAL ENVIRONMENT ERRORS:
  ❌ Local environment is configured with production DATABASE_URL.
     This is EXTREMELY DANGEROUS and could corrupt production data.

Environment validation failed. Application startup blocked.
```

✅ Guardrails verifican en cada mutación que el entorno sea seguro.

---

## Regenerar Datos DEMO

### Desde la UI

1. Login como usuario DEMO
2. En el dashboard, clic en botón "Regenerar Datos"
3. (Opcional) Ingresar seed personalizada
4. Click "Regenerar"
5. Los datos se regeneran instantáneamente en el store local

### Desde el API

```bash
POST /api/admin/demo/regenerate
Headers:
  Cookie: clinvetia_admin=<session-token>
  X-Admin-CSRF: <csrf-token>
Body:
{
  "seed": "my-custom-seed-2024" # Opcional
}

Response:
{
  "ok": true,
  "seed": "my-custom-seed-2024",
  "message": "Use this seed to regenerate demo data on the client"
}
```

**Nota:** La regeneración ocurre en el cliente usando la seed devuelta.

### Seeds Deterministas

Misma seed = mismos datos. Útil para:
- Demos consistentes a diferentes clientes
- Testing de UI con datos predecibles
- Capturas de pantalla/videos con datos fijos

Ejemplo:
```typescript
// Seed por defecto (varía)
generateDemoData() // seed: "demo-1707580800000"

// Seed personalizada (siempre igual)
generateDemoData("clinvetia-demo-v1") // Mismos datos siempre
```

---

## FAQ

### ¿Puedo tener varios usuarios DEMO?

Sí. Puedes crear tantos usuarios DEMO como necesites. Cada uno tendrá su propia sesión y store local.

### ¿Los datos DEMO son privados?

Los datos DEMO se generan localmente en el navegador del usuario. No se almacenan en el servidor. Cada sesión DEMO tiene su propio conjunto de datos.

### ¿Qué pasa si un SUPER_ADMIN intenta cambiar a DEMO?

No es posible. El sistema fuerza automáticamente a SUPER_ADMIN a estar en modo REAL. Si se detecta un SUPER_ADMIN en DEMO, se corrige inmediatamente y se registra en los logs de auditoría.

### ¿Puedo usar DEMO mode en local?

Sí. Puedes crear un usuario DEMO en tu base de datos local y usarlo. Es útil para testear la UI sin afectar datos de desarrollo.

### ¿Cómo sé si estoy en DEMO o REAL?

- **DEMO**: Banner amarillo visible en dashboard
- **REAL**: Sin banner, datos reales

También puedes verificar en la respuesta de `/api/admin/auth/me`:
```json
{
  "ok": true,
  "user": {
    "username": "demo",
    "role": "ADMIN",
    "mode": "DEMO"  // ← Aquí
  }
}
```

### ¿Los filtros y búsqueda funcionan en DEMO?

Sí. Todo funciona exactamente igual que en modo REAL, excepto que los datos son ficticios y las mutaciones no persisten.

---

## Troubleshooting

### Error: "Mutation blocked: Local environment detected with production database"

**Causa:** Estás en local (NODE_ENV=development) con DATABASE_URL apuntando a producción.

**Solución:**
```bash
# Cambia tu .env.local a usar DB local
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinvetia_dev
```

### Error: "This feature is only available in DEMO mode"

**Causa:** Intentas regenerar datos DEMO desde un usuario REAL.

**Solución:** Login como usuario DEMO.

### Error: "Cannot perform this action in DEMO mode"

**Causa:** Intentas cancelar/editar un booking real desde modo DEMO.

**Solución:** 
- Si quieres solo demostrar: Usa el store local (las acciones afectan solo datos ficticios)
- Si quieres modificar datos reales: Cambia a un usuario REAL

### No veo datos en modo DEMO

**Causa:** El store DEMO no se inicializó correctamente.

**Solución:**
1. Verifica que el componente `<DemoStoreProvider>` esté montado
2. Abre DevTools → Console y busca errores
3. Intenta regenerar los datos manualmente

### Login DEMO rechazado: "Invalid credentials"

**Causa:** El login DEMO está restringido por origen (`ADMIN_DEMO_ALLOWED_ORIGINS`).

**Solución:**
1. Verifica que la URL actual esté en `ADMIN_DEMO_ALLOWED_ORIGINS`
2. O elimina la variable para permitir DEMO desde cualquier origen

---

## Resumen

- ✅ SUPER_ADMIN siempre REAL (aplicado automáticamente)
- ✅ Usuario DEMO perfecto para demostraciones
- ✅ Guardrails protegen producción en desarrollo
- ✅ Datos DEMO realistas y consistentes (300-800 bookings, 500-1500 leads)
- ✅ Filtros, búsqueda y paginación funcionan en DEMO
- ✅ Mutaciones en DEMO afectan solo store local
- ✅ Regenerar datos con seeds personalizadas
- ✅ Documentación completa y tests manuales disponibles

---

**Última actualización:** 2026-02-10  
**Versión:** 1.0.0

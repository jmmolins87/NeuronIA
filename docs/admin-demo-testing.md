# Tests Manuales: DEMO vs REAL Mode

## 📋 Índice

1. [Setup de Testing](#setup-de-testing)
2. [Tests de API (Postman)](#tests-de-api-postman)
3. [Tests de UI (Browser)](#tests-de-ui-browser)
4. [Tests de Seguridad](#tests-de-seguridad)
5. [Tests de Guardrails](#tests-de-guardrails)
6. [Checklist de Validación](#checklist-de-validación)

---

## Setup de Testing

### Pre-requisitos

1. **Base de datos local** con Docker:
   ```bash
   npm run db:start
   npm run prisma:migrate:dev
   ```

2. **Usuarios creados**:
   - SUPER_ADMIN: `superadmin` (mode=REAL)
   - ADMIN REAL: `admin-real` (mode=REAL)
   - ADMIN DEMO: `demo` (mode=DEMO)

3. **Herramientas**:
   - Postman (o curl)
   - Navegador con DevTools
   - Prisma Studio (`npm run prisma:studio`)

### Crear Usuarios de Test

```bash
# 1. SUPER_ADMIN
npm run admin:bootstrap
# Username: superadmin
# Password: (usa ADMIN_BOOTSTRAP_PASSWORD de .env.local)

# 2. ADMIN REAL (via Prisma Studio)
npm run prisma:studio
# Crear AdminUser:
# - username: admin-real
# - passwordHash: (bcrypt hash de "admin123")
# - role: ADMIN
# - mode: REAL
# - isActive: true

# 3. DEMO USER (via Prisma Studio)
# Crear AdminUser:
# - username: demo
# - passwordHash: (bcrypt hash de "demo123")
# - role: ADMIN
# - mode: DEMO
# - isActive: true
```

**Generar password hash:**
```javascript
// En Node.js
const bcrypt = require('bcryptjs');
console.log(bcrypt.hashSync('admin123', 10));
console.log(bcrypt.hashSync('demo123', 10));
```

---

## Tests de API (Postman)

### Test 1: Login SUPER_ADMIN → Mode Enforcement

**Objetivo:** Verificar que SUPER_ADMIN siempre obtiene mode=REAL incluso si está en DEMO en DB.

#### Paso 1: Forzar SUPER_ADMIN a DEMO (DB)
```sql
-- En Prisma Studio o SQL:
UPDATE "AdminUser" 
SET mode = 'DEMO' 
WHERE username = 'superadmin';
```

#### Paso 2: Login
```http
POST http://localhost:3000/api/admin/auth/login
Content-Type: application/json

{
  "username": "superadmin",
  "password": "your-password"
}
```

#### Resultado Esperado:
```json
{
  "ok": true,
  "user": {
    "id": "...",
    "username": "superadmin",
    "role": "SUPER_ADMIN",
    "mode": "REAL"  // ← Debe ser REAL (auto-corregido)
  },
  "csrfToken": "..."
}
```

#### Paso 3: Verificar DB
```sql
SELECT username, role, mode FROM "AdminUser" WHERE username = 'superadmin';
```

Debe mostrar:
| username | role | mode |
|----------|------|------|
| superadmin | SUPER_ADMIN | REAL |

#### Paso 4: Verificar Audit Log
```sql
SELECT action, metadata FROM "UserAdminAudit" 
WHERE action = 'MODE_AUTO_CORRECTED' 
ORDER BY "createdAt" DESC LIMIT 1;
```

Debe mostrar registro de corrección automática.

---

### Test 2: Login Usuario DEMO

**Objetivo:** Verificar que usuario DEMO funciona correctamente.

```http
POST http://localhost:3000/api/admin/auth/login
Content-Type: application/json

{
  "username": "demo",
  "password": "demo123"
}
```

#### Resultado Esperado:
```json
{
  "ok": true,
  "user": {
    "username": "demo",
    "role": "ADMIN",
    "mode": "DEMO"  // ← Debe ser DEMO
  },
  "csrfToken": "..."
}
```

---

### Test 3: Login Usuario REAL

**Objetivo:** Verificar que usuario REAL funciona.

```http
POST http://localhost:3000/api/admin/auth/login
Content-Type: application/json

{
  "username": "admin-real",
  "password": "admin123"
}
```

#### Resultado Esperado:
```json
{
  "ok": true,
  "user": {
    "username": "admin-real",
    "role": "ADMIN",
    "mode": "REAL"  // ← Debe ser REAL
  },
  "csrfToken": "..."
}
```

---

### Test 4: Endpoint /me con SUPER_ADMIN

**Objetivo:** Verificar que /me devuelve mode correcto.

```http
GET http://localhost:3000/api/admin/auth/me
Cookie: clinvetia_admin=<session-cookie>
```

#### Resultado Esperado:
```json
{
  "ok": true,
  "user": {
    "username": "superadmin",
    "role": "SUPER_ADMIN",
    "mode": "REAL"  // ← Siempre REAL
  },
  "csrfToken": "..."
}
```

---

### Test 5: Regenerar Datos DEMO (Usuario DEMO)

**Objetivo:** Verificar que usuario DEMO puede regenerar datos.

```http
POST http://localhost:3000/api/admin/demo/regenerate
Cookie: clinvetia_admin=<demo-session-cookie>
X-Admin-CSRF: <csrf-token>
Content-Type: application/json

{
  "seed": "test-seed-2024"
}
```

#### Resultado Esperado:
```json
{
  "ok": true,
  "seed": "test-seed-2024",
  "message": "Use this seed to regenerate demo data on the client"
}
```

---

### Test 6: Regenerar Datos DEMO (Usuario REAL) - DEBE FALLAR

**Objetivo:** Verificar que usuario REAL NO puede regenerar datos DEMO.

```http
POST http://localhost:3000/api/admin/demo/regenerate
Cookie: clinvetia_admin=<real-session-cookie>
X-Admin-CSRF: <csrf-token>
Content-Type: application/json

{}
```

#### Resultado Esperado:
```json
{
  "ok": false,
  "code": "FORBIDDEN",
  "message": "This feature is only available in DEMO mode"
}
```

---

### Test 7: Cancelar Booking (Usuario DEMO) - DEBE FALLAR

**Objetivo:** Verificar que usuario DEMO NO puede cancelar bookings reales.

**Setup:** Crear un booking real en DB.

```http
POST http://localhost:3000/api/admin/bookings/<booking-id>/cancel
Cookie: clinvetia_admin=<demo-session-cookie>
X-Admin-CSRF: <csrf-token>
```

#### Resultado Esperado:
```json
{
  "ok": false,
  "code": "DEMO_MODE",
  "message": "Cannot perform this action in DEMO mode. Switch to REAL mode to modify actual data."
}
```

---

### Test 8: Cancelar Booking (Usuario REAL) - DEBE FUNCIONAR

**Objetivo:** Verificar que usuario REAL SÍ puede cancelar bookings.

```http
POST http://localhost:3000/api/admin/bookings/<booking-id>/cancel
Cookie: clinvetia_admin=<real-session-cookie>
X-Admin-CSRF: <csrf-token>
```

#### Resultado Esperado:
```json
{
  "ok": true,
  "booking": {
    "id": "...",
    "status": "CANCELLED",
    ...
  }
}
```

---

## Tests de UI (Browser)

### Test 1: Dashboard DEMO Mode

#### Pasos:
1. Login como `demo` / `demo123`
2. Navegar a `/admin/dashboard`

#### Verificaciones:
- ✅ Banner amarillo visible: "🎭 MODO DEMO - Los datos mostrados son ficticios"
- ✅ Botón "Regenerar Datos" visible
- ✅ Badge "DEMO" visible en header
- ✅ Lista de bookings muestra datos ficticios
- ✅ Contador de bookings muestra 300-800
- ✅ Abrir DevTools → Console:
  - No debe haber llamadas a `/api/admin/bookings` (los datos vienen del store local)
- ✅ Filtros funcionan (cambiar status, búsqueda)
- ✅ Paginación funciona

---

### Test 2: Dashboard REAL Mode

#### Pasos:
1. Login como `admin-real` / `admin123`
2. Navegar a `/admin/dashboard`

#### Verificaciones:
- ✅ NO hay banner DEMO
- ✅ NO hay botón "Regenerar Datos"
- ✅ NO hay badge "DEMO" en header
- ✅ Lista de bookings muestra datos reales (puede estar vacía)
- ✅ Abrir DevTools → Console:
  - SÍ debe haber llamadas a `/api/admin/bookings` (los datos vienen de API)

---

### Test 3: Regenerar Datos DEMO

#### Pasos:
1. Login como `demo`
2. Navegar a `/admin/dashboard`
3. Click en "Regenerar Datos"
4. (Opcional) Ingresar seed personalizada: `test-ui-seed`
5. Click "Regenerar"

#### Verificaciones:
- ✅ Modal se cierra
- ✅ Lista de bookings se actualiza con nuevos datos
- ✅ Seed actual se muestra en el botón de opciones avanzadas
- ✅ Si usas la misma seed dos veces, obtienes los mismos datos

---

### Test 4: Intentar Cancelar Booking en DEMO

#### Pasos:
1. Login como `demo`
2. Navegar a `/admin/bookings`
3. Seleccionar un booking
4. Click "Cancelar"

#### Verificaciones:
- ✅ El booking se marca como cancelado SOLO en el store local
- ✅ Si refrescas la página, el booking vuelve al estado original (porque se regenera)
- ✅ NO hay llamada a `/api/admin/bookings/<id>/cancel` en DevTools Network

---

### Test 5: Cancelar Booking en REAL

#### Pasos:
1. Login como `admin-real`
2. Crear un booking real (o usar uno existente)
3. Navegar a `/admin/bookings`
4. Seleccionar el booking
5. Click "Cancelar"

#### Verificaciones:
- ✅ El booking se marca como cancelado en DB
- ✅ Si refrescas la página, el booking sigue cancelado
- ✅ SÍ hay llamada a `/api/admin/bookings/<id>/cancel` en DevTools Network
- ✅ Audit log registra la cancelación

---

## Tests de Seguridad

### Test 1: Enforcement en Session Resolution

**Objetivo:** Verificar que el enforcement se aplica al resolver sesión (no solo en login).

#### Pasos:
1. Login como SUPER_ADMIN (obtén session cookie)
2. En DB, cambiar mode a DEMO:
   ```sql
   UPDATE "AdminUser" SET mode = 'DEMO' WHERE username = 'superadmin';
   ```
3. Hacer request a `/api/admin/auth/me` con la session cookie existente

#### Resultado Esperado:
```json
{
  "ok": true,
  "user": {
    "mode": "REAL"  // ← Auto-corregido
  }
}
```

---

### Test 2: CSRF Protection

**Objetivo:** Verificar que CSRF token es requerido.

#### Paso 1: Sin CSRF Token
```http
POST http://localhost:3000/api/admin/bookings/<id>/cancel
Cookie: clinvetia_admin=<session-cookie>
```

#### Resultado Esperado:
```json
{
  "ok": false,
  "code": "CSRF_MISSING",
  "message": "CSRF token required"
}
```

#### Paso 2: Con CSRF Token Inválido
```http
POST http://localhost:3000/api/admin/bookings/<id>/cancel
Cookie: clinvetia_admin=<session-cookie>
X-Admin-CSRF: invalid-token
```

#### Resultado Esperado:
```json
{
  "ok": false,
  "code": "CSRF_INVALID",
  "message": "Invalid CSRF token"
}
```

---

## Tests de Guardrails

### Test 1: Startup con DB Prod en Local

**Objetivo:** Verificar que la app NO arranca si detecta DB prod en local.

#### Pasos:
1. En `.env.local`, cambiar:
   ```bash
   NODE_ENV=development
   DATABASE_URL=postgresql://...@prod-db.neon.tech/clinvetia_prod
   ```
2. Iniciar app:
   ```bash
   npm run dev
   ```

#### Resultado Esperado:
```
🚨 CRITICAL ENVIRONMENT ERRORS:
  ❌ Local environment is configured with production DATABASE_URL.
     This is EXTREMELY DANGEROUS and could corrupt production data.

Environment validation failed. Application startup blocked.
Error: Environment validation failed...
```

App NO debe arrancar.

---

### Test 2: Startup con APP_URL Prod en Local

**Objetivo:** Verificar warning si APP_URL es de producción en local.

#### Pasos:
1. En `.env.local`, cambiar:
   ```bash
   NODE_ENV=development
   APP_URL=https://clinvetia.com
   DATABASE_URL=postgresql://localhost:5432/clinvetia_dev
   ```
2. Iniciar app:
   ```bash
   npm run dev
   ```

#### Resultado Esperado:
```
🚨 CRITICAL ENVIRONMENT ERRORS:
  ❌ Local environment (NODE_ENV=development) is using production APP_URL: https://clinvetia.com

Environment validation failed. Application startup blocked.
```

App NO debe arrancar.

---

### Test 3: Mutación con DB Prod en Local - Bloqueada

**Objetivo:** Verificar que mutaciones se bloquean si se detecta DB prod.

**Nota:** Este test solo funciona si logras bypasear el guardrail de startup (no recomendado).

#### Resultado Esperado:
```json
{
  "ok": false,
  "code": "ENVIRONMENT_BLOCK",
  "message": "Mutation blocked: Local environment detected with production database. This is a safety measure to prevent accidental data corruption."
}
```

---

## Checklist de Validación

### ✅ Enforcement

- [ ] SUPER_ADMIN login → mode=REAL
- [ ] SUPER_ADMIN session resolution → mode=REAL
- [ ] SUPER_ADMIN en DEMO (DB) → auto-corregido a REAL
- [ ] Audit log registra corrección automática

### ✅ DEMO Mode

- [ ] Login DEMO funciona
- [ ] Dashboard muestra banner DEMO
- [ ] Dashboard muestra badge DEMO
- [ ] Botón "Regenerar Datos" visible
- [ ] Datos ficticios (300-800 bookings)
- [ ] Filtros funcionan
- [ ] Búsqueda funciona
- [ ] Paginación funciona
- [ ] No hay llamadas a API para lectura
- [ ] Regenerar datos funciona
- [ ] Seeds deterministas funcionan
- [ ] Mutaciones afectan solo store local

### ✅ REAL Mode

- [ ] Login REAL funciona
- [ ] Dashboard NO muestra banner DEMO
- [ ] Dashboard NO muestra badge DEMO
- [ ] NO hay botón "Regenerar Datos"
- [ ] Datos reales desde DB
- [ ] Llamadas a API para lectura
- [ ] Mutaciones afectan DB
- [ ] Audit logs registran mutaciones

### ✅ Seguridad

- [ ] Usuario DEMO NO puede cancelar bookings reales (403)
- [ ] Usuario DEMO NO puede regenerar desde REAL endpoint (403)
- [ ] Usuario REAL NO puede regenerar datos DEMO (403)
- [ ] CSRF protection funciona
- [ ] Rate limiting funciona

### ✅ Guardrails

- [ ] App NO arranca con DB prod en local
- [ ] App NO arranca con APP_URL prod en local
- [ ] Mutaciones bloqueadas si DB prod detectada en local
- [ ] Logs claros y útiles

### ✅ Audit

- [ ] Mode enforcement registrado
- [ ] Logins registrados (DEMO vs REAL)
- [ ] Mutaciones registradas
- [ ] Failed logins registrados

---

## Resultado Final

✅ **TODOS** los tests deben pasar antes de desplegar a producción.

**Fecha de Testing:** _______________________  
**Testeado por:** _______________________  
**Entorno:** ☐ Local  ☐ Staging  ☐ Producción  
**Estado:** ☐ Pasó  ☐ Falló  

**Notas:**
_______________________________________________
_______________________________________________
_______________________________________________

---

**Última actualización:** 2026-02-10  
**Versión:** 1.0.0

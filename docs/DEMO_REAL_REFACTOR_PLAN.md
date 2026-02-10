# Plan de Refactor: DEMO vs REAL Mode

## 🎯 Objetivo

Separar claramente el modo DEMO (datos mock) del modo REAL (datos de DB), con protecciones para:
- Superadmin siempre en modo REAL (nunca DEMO)
- Guardrails para evitar afectar producción desde local
- UI clara que muestra el modo activo
- Demo data realista y consistente (determinista)

---

## 📋 Checklist Completo

### 1. ✅ Modelo de Datos (Ya existe en Prisma)
- [x] AdminUser tiene `role` (SUPER_ADMIN | ADMIN)
- [x] AdminUser tiene `mode` (REAL | DEMO)
- [x] Constraint: SUPER_ADMIN → mode debe ser REAL

### 2. 🔧 Backend: Data Layer
- [ ] **lib/admin/demo-data.ts** - Generador de datos mock
  - Generador determinista (seeded random)
  - 300-800 bookings mock
  - 500-1500 leads mock
  - 200-600 ROI calculations mock
  - Distribución realista de fechas (últimos 30 días + próximos 14)
  - Estados realistas (HELD, CONFIRMED, CANCELLED, EXPIRED)
  
- [ ] **lib/admin/demo-store.ts** (cliente) - Store de datos DEMO
  - Estado local con zustand o Context
  - Filtros (por estado, fecha, búsqueda)
  - Paginación
  - Acciones: cancel, reschedule, edit (solo afectan al store)
  - Regenerar datos (nueva seed)

### 3. 🛡️ Backend: Enforcement & Guardrails
- [ ] **lib/admin/enforcement.ts** - Forzar SUPER_ADMIN → REAL
  - Función `enforceSuperAdminMode(user)` que corrige mode si es necesario
  - Log cuando se corrige automáticamente
  - Bloquear elevación a SUPER_ADMIN si mode=DEMO
  
- [ ] **lib/admin/guardrails.ts** - Protección anti-producción en dev
  - Check en startup: NODE_ENV !== "production" + APP_URL contiene "clinvetia.com" → ERROR
  - Check en startup: NODE_ENV !== "production" + DATABASE_URL apunta a neon prod → ERROR
  - Middleware/wrapper para mutaciones admin que valida entorno
  
- [ ] **lib/admin-auth-v2.ts** - Actualizar lógica de autenticación
  - En `authenticateAdmin`: llamar `enforceSuperAdminMode` después de obtener user
  - En `getAdminSession`: llamar `enforceSuperAdminMode` al resolver sesión
  - Registrar logs cuando se fuerza mode=REAL

### 4. 🎨 Frontend: UI Components
- [ ] **components/admin/demo-banner.tsx** - Banner visible en modo DEMO
  - Solo visible si `user.mode === "DEMO"`
  - Sticky/fixed en top del dashboard
  - Mensaje: "🎭 MODO DEMO - Los datos mostrados son ficticios"
  
- [ ] **components/admin/demo-controls.tsx** - Controles para usuario DEMO
  - Botón "Regenerar datos demo" (solo si mode=DEMO)
  - Muestra seed actual
  - Permite cambiar seed manualmente
  
- [ ] **components/admin/admin-header.tsx** - Header con badge DEMO
  - Mostrar username + role
  - Badge "DEMO" solo si mode=DEMO
  - Badge "SUPER ADMIN" si role=SUPER_ADMIN

### 5. 🔄 Frontend: Dashboard Integration
- [ ] **app/admin/dashboard/page.tsx** - Dashboard principal
  - Detectar `user.mode` desde contexto
  - Si DEMO → usar DemoStore (no llamar API)
  - Si REAL → llamar API endpoints reales
  
- [ ] **hooks/use-admin-data.ts** - Hook personalizado
  - Decide automáticamente entre DEMO store o API real
  - Mismo interface para ambos modos
  - `const { bookings, leads, isDemo } = useAdminData()`

### 6. 🚫 Backend: API Endpoints
- [ ] **app/api/admin/demo/regenerate/route.ts** - Endpoint para regenerar DEMO data
  - Solo accesible si `user.mode === "DEMO"`
  - Acepta seed opcional
  - Devuelve nueva seed generada
  
- [ ] Middleware/validación en endpoints REAL
  - Endpoints de mutación (cancel, reschedule, edit) validan que user.mode === "REAL"
  - Si mode=DEMO intenta acceder → error 403

### 7. 📚 Documentación
- [ ] **docs/admin-demo.md** - Guía completa
  - Cómo crear usuario DEMO en producción
  - Cómo usar modo DEMO para demostrar a clientes
  - Cómo proteger que local no toque producción
  - Cómo regenerar mocks
  - FAQ

### 8. 🧪 Testing
- [ ] **docs/admin-demo-testing.md** - Tests manuales
  - Paso a paso en Postman (API)
  - Paso a paso en navegador (UI)
  - Casos de prueba:
    - Login como SUPER_ADMIN → verifica mode=REAL
    - Login como DEMO user → verifica datos mock
    - Intentar elevar DEMO a SUPER_ADMIN → rechazado
    - Regenerar datos DEMO
    - Validar guardrails en local

---

## 📁 File Tree - Archivos Nuevos y Modificados

```
clinvetia-app/
├── lib/
│   ├── admin/
│   │   ├── demo-data.ts                    [NUEVO] Generador de datos mock
│   │   ├── demo-store.ts                   [NUEVO] Store cliente para DEMO
│   │   ├── enforcement.ts                  [NUEVO] Forzar SUPER_ADMIN → REAL
│   │   └── guardrails.ts                   [NUEVO] Protección anti-prod
│   └── admin-auth-v2.ts                    [MODIFICAR] Integrar enforcement
│
├── components/
│   └── admin/
│       ├── demo-banner.tsx                 [NUEVO] Banner modo DEMO
│       ├── demo-controls.tsx               [NUEVO] Controles regenerar datos
│       └── admin-header.tsx                [NUEVO] Header con badges
│
├── hooks/
│   └── use-admin-data.ts                   [NUEVO] Hook unificado DEMO/REAL
│
├── app/
│   ├── admin/
│   │   ├── layout.tsx                      [MODIFICAR] Añadir DemoBanner
│   │   └── dashboard/
│   │       └── page.tsx                    [MODIFICAR] Usar useAdminData
│   │
│   └── api/
│       └── admin/
│           ├── demo/
│           │   └── regenerate/
│           │       └── route.ts            [NUEVO] Regenerar DEMO data
│           └── bookings/
│               └── [id]/
│                   ├── cancel/
│                   │   └── route.ts        [MODIFICAR] Validar mode=REAL
│                   └── reschedule/
│                       └── route.ts        [MODIFICAR] Validar mode=REAL
│
├── docs/
│   ├── admin-demo.md                       [NUEVO] Documentación DEMO mode
│   └── admin-demo-testing.md               [NUEVO] Tests manuales
│
└── scripts/
    └── validate-env.ts                     [NUEVO] Script validación entorno
```

---

## ⚠️ Riesgos y Mitigaciones

### Riesgo 1: SUPER_ADMIN accidentalmente en modo DEMO
**Mitigación**: 
- Enforcement automático en login y resolución de sesión
- Log cada vez que se corrige
- Constraint en DB (migration)

### Riesgo 2: Local afecta producción
**Mitigación**:
- Guardrails que detectan DATABASE_URL de producción en entorno no-producción
- Fail-closed: si detecta conflicto, bloquea mutaciones
- Documentación clara sobre .env.local vs .env.production

### Riesgo 3: Usuario DEMO accede a endpoints REAL
**Mitigación**:
- Frontend no llama endpoints si mode=DEMO (solo usa store)
- Backend valida mode en endpoints de mutación
- Retorna 403 si mode no coincide

### Riesgo 4: Datos DEMO no realistas
**Mitigación**:
- Generador determinista con distribuciones realistas
- Opción de regenerar con diferentes seeds
- Casos de uso variados (confirmados, cancelados, expirados, etc.)

### Riesgo 5: Confusión entre DEMO y REAL en UI
**Mitigación**:
- Banner visible persistente en modo DEMO
- Badge claro en header
- Colores/iconos distintivos

---

## 🔄 Flujo de Trabajo

### Flujo 1: Login SUPER_ADMIN
```
1. Usuario ingresa credenciales (username: superadmin, password: ***)
2. Backend valida credenciales → user encontrado
3. Backend ejecuta enforceSuperAdminMode(user)
   - Si user.mode === "DEMO" → actualiza a "REAL" + log
4. Backend crea sesión con mode=REAL
5. Frontend recibe user.role=SUPER_ADMIN, user.mode=REAL
6. Dashboard muestra datos REAL (desde DB)
7. NO muestra banner DEMO
```

### Flujo 2: Login Usuario DEMO
```
1. Usuario ingresa credenciales (username: example, password: ***)
2. Backend valida credenciales → user encontrado
3. user.role=ADMIN, user.mode=DEMO
4. Backend crea sesión con mode=DEMO
5. Frontend recibe user.role=ADMIN, user.mode=DEMO
6. Frontend inicializa DemoStore con seed por defecto
7. Dashboard muestra datos DEMO (desde store local)
8. Muestra banner DEMO + controles regenerar
```

### Flujo 3: Regenerar Datos DEMO
```
1. Usuario DEMO hace clic en "Regenerar datos"
2. Frontend llama POST /api/admin/demo/regenerate
3. Backend valida user.mode=DEMO
4. Backend genera nueva seed → devuelve {seed: "abc123"}
5. Frontend actualiza DemoStore con nueva seed
6. Dashboard se re-renderiza con nuevos datos mock
```

### Flujo 4: Protección en Local
```
1. Developer inicia app en local (NODE_ENV=development)
2. lib/admin/guardrails.ts se ejecuta en startup
3. Verifica:
   - APP_URL contiene "clinvetia.com"? → ERROR (no debería)
   - DATABASE_URL apunta a neon prod? → ERROR (no debería)
4. Si todo OK → continúa
5. Si detecta conflicto → lanza error + detiene app
```

---

## 🎬 Próximos Pasos

1. ✅ Aprobar este plan
2. Implementar código (siguiendo el file tree)
3. Probar localmente
4. Documentar
5. Desplegar a staging
6. Tests en staging
7. Desplegar a producción
8. Crear usuario DEMO en producción
9. Validar con cliente en demo

---

**Fecha**: 2026-02-10  
**Autor**: Staff Full-Stack Engineer  
**Estado**: 🟡 Pendiente Aprobación

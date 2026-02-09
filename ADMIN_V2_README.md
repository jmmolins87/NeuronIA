# Admin V2 Robust - Quick Start Guide

## 🎯 What's Been Implemented

### ✅ Foundation Layer (100% Complete)
- **Database schema** with security fields + new tables (AdminSession, UserAdminAudit)
- **Migration** ready to apply: `prisma/migrations/20260209185154_admin_v2_security/`
- **Core libraries**: rate-limit, CSRF, session-manager, audit, logger
- **Auth V2**: Complete rewrite with lockout, rate limiting, DEMO mode, audit logging
- **4 new API endpoints**: `/api/admin/auth/{login,logout,me}` + `/api/admin/bootstrap`

### 🟡 Partial (APIs need CSRF + audit)
- Booking mutations: cancel, reschedule, edit
- User management: create, update, delete, reset password

### 🔴 Not Started
- UI components (session provider with CSRF, demo banner, user management UI)
- Documentation (admin.md, security architecture, Postman tests)

---

## 🚀 Quick Deploy (5 Steps)

### 1. Apply Database Migration
```bash
npm run prisma:migrate:dev
# Or for production:
npm run prisma:migrate:deploy
```

### 2. Update Environment Variables
Add to `.env`:
```bash
# Required
ADMIN_SESSION_SECRET="YOUR-32-CHARACTER-RANDOM-STRING-HERE"
ADMIN_BOOTSTRAP_PASSWORD="your-secure-password-min-8-chars"

# Optional
SESSION_TTL_DAYS="7"
ADMIN_DEMO_ALLOWED_ORIGINS="https://yoursite.com"

# Bootstrap endpoint (temporary)
ADMIN_BOOTSTRAP_ENABLED="true"  # Set to false after first use!
ADMIN_BOOTSTRAP_SECRET="DIFFERENT-32-CHARACTER-RANDOM-STRING"
```

### 3. Create Superadmin via Bootstrap API
```bash
curl -X POST http://localhost:3000/api/admin/bootstrap \
  -H "Authorization: Bearer YOUR-ADMIN_BOOTSTRAP_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "superadmin": {
      "username": "admin",
      "password": "YourSecurePassword123",
      "email": "admin@yourcompany.com"
    },
    "demoUser": {
      "username": "demo",
      "password": "demo"
    }
  }'
```

### 4. **IMPORTANT:** Disable Bootstrap Endpoint
Set in `.env`:
```bash
ADMIN_BOOTSTRAP_ENABLED="false"
```

### 5. Test Login
```bash
curl -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourSecurePassword123"}'

# Should return:
# {
#   "ok": true,
#   "user": {...},
#   "csrfToken": "..."
# }
```

---

## 🔐 Security Features Now Active

| Feature | Status | Details |
|---------|--------|---------|
| Rate Limiting | ✅ Active | 5 attempts/10min per IP+username |
| Account Lockout | ✅ Active | 10 fails/24h = 30min lock |
| Neutral Errors | ✅ Active | "Invalid credentials" (doesn't reveal user existence) |
| DB Sessions | ✅ Active | No JWT in cookies, sessions stored in DB |
| Sliding Sessions | ✅ Active | Auto-renew if <24h remaining |
| CSRF Tokens | ✅ Ready | Per-session CSRF token (APIs need to check it) |
| DEMO Mode Protection | ✅ Active | Origin-based restrictions for DEMO users |
| Audit Logging | ✅ Active | Login/logout/failed attempts logged |
| Secure Cookies | ✅ Active | httpOnly, secure (prod), SameSite=Lax |

---

## 📋 What's Left to Do

### Phase 1: Booking Mutations (1 hour)
Add CSRF validation + audit logging to:
- `app/api/admin/bookings/[id]/cancel/route.ts`
- `app/api/admin/bookings/[id]/reschedule/route.ts`
- `app/api/admin/bookings/[id]/route.ts` (PUT)

**Pattern:**
```ts
import { requireAdminWithCsrf } from "@/lib/admin/middleware"
import { createBookingAudit } from "@/lib/admin/audit"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAdminWithCsrf(req)
  if (!auth.ok) return auth.error
  
  // ... mutation code ...
  
  await createBookingAudit(prisma, {
    adminId: auth.data.session.adminId,
    bookingId: params.id,
    action: "BOOKING_CANCEL",
    metadata: { reason, ip, userAgent },
  })
  
  return okJson({ booking })
}
```

### Phase 2: User Management (1 hour)
Implement SUPER_ADMIN-only user CRUD with CSRF:
- Create user
- Update user (role, active status)
- Delete user
- Reset password

### Phase 3: UI Updates (2 hours)
- Update `admin-session-provider.tsx` to fetch + use CSRF token
- Create demo banner component
- Create `use-admin-fetch.ts` hook (auto-adds CSRF header)
- Create user management UI (SUPER_ADMIN only)

### Phase 4: Documentation (1 hour)
- Write `docs/admin.md` (comprehensive guide)
- Write `docs/admin-postman-tests.md` (test scenarios)

---

## 🧪 Testing Checklist

### Rate Limiting
```bash
# Try logging in with wrong password 6 times in a row
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/admin/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong"}'
  echo "\n---Attempt $i---\n"
done

# 6th attempt should return:
# {"ok":false,"code":"RATE_LIMITED","message":"Too many login attempts..."}
```

### Account Lockout
```bash
# Fail 10 times (might need to wait for rate limit to reset between batches)
# After 10 failures, account should be locked for 30 minutes
# Even correct password will return error until lock expires
```

### CSRF Protection (once booking APIs are updated)
```bash
# 1. Login and capture csrfToken
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"YourPassword"}')

CSRF_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.csrfToken')

# 2. Try mutation without CSRF header (should fail)
curl -X POST http://localhost:3000/api/admin/bookings/BOOKING_ID/cancel

# 3. Try mutation with CSRF header (should succeed)
curl -X POST http://localhost:3000/api/admin/bookings/BOOKING_ID/cancel \
  -H "X-Admin-CSRF: $CSRF_TOKEN"
```

### Session Expiry & Renewal
```bash
# 1. Login
# 2. Wait until session has < 24h remaining
# 3. Call /api/admin/auth/me
# 4. Check response - expiresAt should be extended
```

---

## 📊 Files Created/Modified

**Created (23 new files):**
- `prisma/migrations/20260209185154_admin_v2_security/migration.sql`
- `lib/admin/` (6 files: constants, logger, rate-limit, csrf, session-manager, audit, middleware)
- `lib/admin-auth-v2.ts`
- `app/api/admin/auth/me/route.ts`
- `app/api/admin/bootstrap/route.ts`
- `ADMIN_V2_IMPLEMENTATION_STATUS.md`
- `ADMIN_V2_README.md` (this file)

**Modified (4 files):**
- `prisma/schema.prisma` (added AdminMode enum, extended AdminUser, added AdminSession + UserAdminAudit tables)
- `lib/env.ts` (added 4 new env vars)
- `.env.example` (documented new vars)
- `app/api/admin/auth/login/route.ts` (V2 with rate limit + lockout)
- `app/api/admin/auth/logout/route.ts` (V2 with session invalidation)

---

## ⚠️ IMPORTANT NOTES

### TypeScript Errors (Expected)
You'll see TS errors in:
- `lib/admin/csrf.ts`
- `lib/admin/session-manager.ts`
- `lib/admin-auth-v2.ts`

**These will resolve after you apply the migration and run:**
```bash
npm run prisma:generate
```

### Gradual Migration
- Old auth (`lib/admin-auth.ts`) is still used by existing UI
- New auth (`lib/admin-auth-v2.ts`) is used by new API endpoints
- UI components will need to be updated to use new auth flow

### Production Deployment
1. ✅ Apply migration
2. ✅ Create superadmin via bootstrap
3. ✅ **Disable bootstrap endpoint** (`ADMIN_BOOTSTRAP_ENABLED=false`)
4. ✅ Use long random strings for secrets (32+ chars)
5. ✅ Monitor `[ADMIN]` logs

---

## 🆘 Support & Next Steps

**See full implementation status:**
- Read `ADMIN_V2_IMPLEMENTATION_STATUS.md` for detailed breakdown

**Quick commands:**
```bash
# Apply migration
npm run prisma:migrate:dev

# Generate types
npm run prisma:generate

# Test build
npm run build

# Start dev server
npm run dev
```

**Any questions?** Check the implementation status doc or review the created files in `lib/admin/` for patterns to follow.

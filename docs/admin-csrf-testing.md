# Admin CSRF Protection - Postman Testing Checklist

## Summary
This checklist verifies that CSRF protection is working correctly across all admin endpoints.

**Expected Results:**
- GET endpoints: Work without CSRF token
- POST/PATCH/PUT/DELETE endpoints: Require X-Admin-CSRF header
- Missing/Invalid CSRF: Returns 403 { ok: false, code: "CSRF_INVALID", message: "Forbidden" }
- Valid CSRF: Returns 200 with action result

---

## Prerequisites

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Ensure You Have a Valid Admin Session
- Login at: `http://localhost:3000/admin/login`
- Or use Bootstrap endpoint to create admin

### 3. Get CSRF Token
```bash
# After login, get your CSRF token
curl -X GET http://localhost:3000/api/admin/auth/me \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>"
```

Expected response:
```json
{
  "ok": true,
  "user": { ... },
  "session": { ... },
  "csrfToken": "ABC123..."  // <-- Save this
}
```

---

## Checklist - Booking Mutations

### 1. POST /api/admin/bookings/{id}/cancel

#### Test A: Without CSRF Token (Should Fail)
```bash
curl -X POST http://localhost:3000/api/admin/bookings/{BOOKING_ID}/cancel \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected:**
```json
{
  "ok": false,
  "code": "CSRF_MISSING" | "CSRF_INVALID",
  "message": "Forbidden"
}
```
**Status:** 403

✅ **PASS / FAIL:** ___

---

#### Test B: With Valid CSRF Token (Should Succeed)
```bash
curl -X POST http://localhost:3000/api/admin/bookings/{BOOKING_ID}/cancel \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>" \
  -H "Content-Type: application/json" \
  -H "X-Admin-CSRF: <YOUR_CSRF_TOKEN>" \
  -d '{}'
```

**Expected:**
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
**Status:** 200

✅ **PASS / FAIL:** ___

---

### 2. POST /api/admin/bookings/{id}/reschedule

#### Test A: Without CSRF Token (Should Fail)
```bash
curl -X POST http://localhost:3000/api/admin/bookings/{BOOKING_ID}/reschedule \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>" \
  -H "Content-Type: application/json" \
  -d '{"newDate": "2026-02-15", "newTime": "14:00", "timezone": "Europe/Madrid", "locale": "es"}'
```

**Expected:** 403, CSRF_INVALID

✅ **PASS / FAIL:** ___

---

#### Test B: With Valid CSRF Token (Should Succeed)
```bash
curl -X POST http://localhost:3000/api/admin/bookings/{BOOKING_ID}/reschedule \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>" \
  -H "Content-Type: application/json" \
  -H "X-Admin-CSRF: <YOUR_CSRF_TOKEN>" \
  -d '{"newDate": "2026-02-15", "newTime": "14:00", "timezone": "Europe/Madrid", "locale": "es"}'
```

**Expected:** 200, { ok: true, from: {...}, to: {...} }

✅ **PASS / FAIL:** ___

---

### 3. PUT /api/admin/bookings/{id}

#### Test A: Without CSRF Token (Should Fail)
```bash
curl -X PUT http://localhost:3000/api/admin/bookings/{BOOKING_ID} \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>" \
  -H "Content-Type: application/json" \
  -d '{"contactName": "Updated Name"}'
```

**Expected:** 403, CSRF_INVALID

✅ **PASS / FAIL:** ___

---

#### Test B: With Valid CSRF Token (Should Succeed)
```bash
curl -X PUT http://localhost:3000/api/admin/bookings/{BOOKING_ID} \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>" \
  -H "Content-Type: application/json" \
  -H "X-Admin-CSRF: <YOUR_CSRF_TOKEN>" \
  -d '{"contactName": "Updated Name"}'
```

**Expected:** 200, { ok: true, booking: {...} }

✅ **PASS / FAIL:** ___

---

## Checklist - User Management (SUPER_ADMIN Only)

### 4. POST /api/admin/users

#### Test A: Without CSRF Token (Should Fail)
```bash
curl -X POST http://localhost:3000/api/admin/users \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPassword123!",
    "email": "test@example.com",
    "role": "ADMIN"
  }'
```

**Expected:** 403, CSRF_INVALID

✅ **PASS / FAIL:** ___

---

#### Test B: With Valid CSRF Token (Should Succeed)
```bash
curl -X POST http://localhost:3000/api/admin/users \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>" \
  -H "Content-Type: application/json" \
  -H "X-Admin-CSRF: <YOUR_CSRF_TOKEN>" \
  -d '{
    "username": "testuser",
    "password": "TestPassword123!",
    "email": "test@example.com",
    "role": "ADMIN"
  }'
```

**Expected:** 200, { ok: true, user: {...} }

✅ **PASS / FAIL:** ___

---

### 5. PUT /api/admin/users/{id}

#### Test A: Without CSRF Token (Should Fail)
```bash
curl -X PUT http://localhost:3000/api/admin/users/{USER_ID} \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>" \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

**Expected:** 403, CSRF_INVALID

✅ **PASS / FAIL:** ___

---

#### Test B: With Valid CSRF Token (Should Succeed)
```bash
curl -X PUT http://localhost:3000/api/admin/users/{USER_ID} \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>" \
  -H "Content-Type: application/json" \
  -H "X-Admin-CSRF: <YOUR_CSRF_TOKEN>" \
  -d '{"isActive": false}'
```

**Expected:** 200, { ok: true, user: {...} }

✅ **PASS / FAIL:** ___

---

### 6. DELETE /api/admin/users/{id}

#### Test A: Without CSRF Token (Should Fail)
```bash
curl -X DELETE http://localhost:3000/api/admin/users/{USER_ID} \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>"
```

**Expected:** 403, CSRF_INVALID

✅ **PASS / FAIL:** ___

---

#### Test B: With Valid CSRF Token (Should Succeed)
```bash
curl -X DELETE http://localhost:3000/api/admin/users/{USER_ID} \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>" \
  -H "X-Admin-CSRF: <YOUR_CSRF_TOKEN>"
```

**Expected:** 200, { ok: true, message: "User deleted successfully" }

✅ **PASS / FAIL:** ___

---

## Checklist - Read Endpoints (Should Work Without CSRF)

### 7. GET /api/admin/bookings (No CSRF Required)
```bash
curl -X GET "http://localhost:3000/api/admin/bookings?page=1&pageSize=10" \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>"
```

**Expected:** 200, { ok: true, items: [...], ... }

✅ **PASS / FAIL:** ___

---

### 8. GET /api/admin/bookings/{id} (No CSRF Required)
```bash
curl -X GET http://localhost:3000/api/admin/bookings/{BOOKING_ID} \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>"
```

**Expected:** 200, { ok: true, booking: {...} }

✅ **PASS / FAIL:** ___

---

### 9. GET /api/admin/users (No CSRF Required)
```bash
curl -X GET "http://localhost:3000/api/admin/users?page=1&limit=10" \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>"
```

**Expected:** 200, { ok: true, users: [...], ... }

✅ **PASS / FAIL:** ___

---

### 10. GET /api/admin/auth/me (No CSRF Required, Returns CSRF Token)
```bash
curl -X GET http://localhost:3000/api/admin/auth/me \
  --cookie "admin_session=<YOUR_SESSION_COOKIE>"
```

**Expected:** 200, { ok: true, user: {...}, csrfToken: "..." }

✅ **PASS / FAIL:** ___

---

## Checklist - DEMO Mode

### 11. Test DEMO Mode Blocks Mutations

#### Prerequisites
- Login with a DEMO mode user
- Get CSRF token for DEMO user

#### Test: DEMO User Cannot Cancel Booking
```bash
curl -X POST http://localhost:3000/api/admin/bookings/{BOOKING_ID}/cancel \
  --cookie "admin_session=<DEMO_SESSION_COOKIE>" \
  -H "Content-Type: application/json" \
  -H "X-Admin-CSRF: <DEMO_CSRF_TOKEN>" \
  -d '{}'
```

**Expected:** Frontend should not even call this endpoint (adminApi helper blocks it)

✅ **PASS / FAIL:** ___

---

## Test Automation Script

Save this as `test-csrf.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:3000"
ADMIN_COOKIE="admin_session=YOUR_COOKIE_HERE"
CSRF_TOKEN="YOUR_CSRF_TOKEN_HERE"
BOOKING_ID="YOUR_BOOKING_ID_HERE"

echo "=== Testing CSRF Protection ==="

# Test 1: Cancel without CSRF (should fail)
echo "Test 1: Cancel without CSRF"
curl -X POST "$BASE_URL/api/admin/bookings/$BOOKING_ID/cancel" \
  --cookie "$ADMIN_COOKIE" \
  -H "Content-Type: application/json" \
  -d '{}'
echo -e "\nExpected: 403 CSRF_INVALID\n"

# Test 2: Cancel with CSRF (should succeed)
echo "Test 2: Cancel with CSRF"
curl -X POST "$BASE_URL/api/admin/bookings/$BOOKING_ID/cancel" \
  --cookie "$ADMIN_COOKIE" \
  -H "Content-Type: application/json" \
  -H "X-Admin-CSRF: $CSRF_TOKEN" \
  -d '{}'
echo -e "\nExpected: 200 OK\n"

# Test 3: GET without CSRF (should succeed)
echo "Test 3: GET without CSRF"
curl -X GET "$BASE_URL/api/admin/bookings?page=1" \
  --cookie "$ADMIN_COOKIE"
echo -e "\nExpected: 200 OK\n"

echo "=== Tests Complete ==="
```

---

## Security Test Cases

### CSRF Token Reuse After Session Renewal
1. Get CSRF token from `/api/admin/me`
2. Use CSRF token to perform action (should work)
3. Wait for session to renew (or force renewal)
4. Try to use same CSRF token again (should still work - CSRF is bound to session, not time)

✅ **PASS / FAIL:** ___

### CSRF Token From Different Session
1. Login with User A, get CSRF token A
2. Login with User B, get session cookie B
3. Try to use CSRF token A with session B (should fail)

✅ **PASS / FAIL:** ___

### Tampered CSRF Token
1. Get valid CSRF token
2. Modify one character
3. Try to use it (should fail)

✅ **PASS / FAIL:** ___

---

## Summary

| Test Category | Total | Passed | Failed |
|--------------|-------|--------|--------|
| Booking Mutations (without CSRF) | 3 | ___ | ___ |
| Booking Mutations (with CSRF) | 3 | ___ | ___ |
| User Mutations (without CSRF) | 3 | ___ | ___ |
| User Mutations (with CSRF) | 3 | ___ | ___ |
| Read Endpoints | 4 | ___ | ___ |
| DEMO Mode | 1 | ___ | ___ |
| **TOTAL** | **17** | **___** | **___** |

### Result
- ✅ All tests passed: CSRF protection is working correctly
- ❌ Some tests failed: Review failed tests and fix issues

**Tested By:** _______________  
**Date:** _______________  
**Notes:** _______________

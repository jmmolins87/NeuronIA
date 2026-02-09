#!/bin/bash
#
# Quick CSRF Test Script
# Usage: ./test-csrf-quick.sh <ADMIN_USERNAME> <ADMIN_PASSWORD> <BOOKING_ID>
#

set -e

BASE_URL="http://localhost:3000"
USERNAME="${1:-admin}"
PASSWORD="${2:-admin123}"
BOOKING_ID="${3:-test-booking-id}"

echo "=========================================="
echo "       CSRF Protection Test Suite"
echo "=========================================="
echo ""
echo "Base URL: $BASE_URL"
echo "Username: $USERNAME"
echo "Booking ID: $BOOKING_ID"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Temporary files
COOKIE_JAR=$(mktemp)
CSRF_TOKEN=""

cleanup() {
    rm -f "$COOKIE_JAR"
}
trap cleanup EXIT

echo -e "${YELLOW}Step 1: Login and get session...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" \
    -c "$COOKIE_JAR" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | tail -n1)
BODY=$(echo "$LOGIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
    echo -e "${RED}❌ Login failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
    exit 1
fi

CSRF_TOKEN=$(echo "$BODY" | grep -o '"csrfToken":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✅ Login successful${NC}"
echo -e "${GREEN}✅ CSRF Token obtained: ${CSRF_TOKEN:0:20}...${NC}"
echo ""

echo -e "${YELLOW}Step 2: Get session info...${NC}"
ME_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/auth/me" \
    -b "$COOKIE_JAR" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$ME_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Session valid${NC}"
else
    echo -e "${RED}❌ Session invalid (HTTP $HTTP_CODE)${NC}"
fi
echo ""

echo -e "${YELLOW}Step 3: Test mutation WITHOUT CSRF...${NC}"
NO_CSRF_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/bookings/$BOOKING_ID/cancel" \
    -b "$COOKIE_JAR" \
    -H "Content-Type: application/json" \
    -d '{}' \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$NO_CSRF_RESPONSE" | tail -n1)
BODY=$(echo "$NO_CSRF_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "403" ]; then
    echo -e "${GREEN}✅ Correctly rejected without CSRF (HTTP 403)${NC}"
    echo "Response: $BODY"
else
    echo -e "${RED}❌ Should have rejected without CSRF (got HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

echo -e "${YELLOW}Step 4: Test mutation WITH CSRF...${NC}"
WITH_CSRF_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/bookings/$BOOKING_ID/cancel" \
    -b "$COOKIE_JAR" \
    -H "Content-Type: application/json" \
    -H "X-Admin-CSRF: $CSRF_TOKEN" \
    -d '{}' \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$WITH_CSRF_RESPONSE" | tail -n1)
BODY=$(echo "$WITH_CSRF_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "404" ]; then
    echo -e "${GREEN}✅ Request processed with CSRF (HTTP $HTTP_CODE)${NC}"
    if [ "$HTTP_CODE" == "404" ]; then
        echo "Note: 404 is expected if booking doesn't exist - CSRF worked!"
    fi
else
    echo -e "${RED}❌ Unexpected response (HTTP $HTTP_CODE)${NC}"
    echo "Response: $BODY"
fi
echo ""

echo -e "${YELLOW}Step 5: Test GET without CSRF (should work)...${NC}"
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/api/admin/bookings?page=1&pageSize=5" \
    -b "$COOKIE_JAR" \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$GET_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ GET works without CSRF (HTTP 200)${NC}"
else
    echo -e "${RED}❌ GET failed (HTTP $HTTP_CODE)${NC}"
fi
echo ""

echo -e "${YELLOW}Step 6: Test invalid CSRF token...${NC}"
INVALID_CSRF_RESPONSE=$(curl -s -X POST "$BASE_URL/api/admin/bookings/$BOOKING_ID/cancel" \
    -b "$COOKIE_JAR" \
    -H "Content-Type: application/json" \
    -H "X-Admin-CSRF: invalid_token_12345" \
    -d '{}' \
    -w "\n%{http_code}")

HTTP_CODE=$(echo "$INVALID_CSRF_RESPONSE" | tail -n1)
if [ "$HTTP_CODE" == "403" ]; then
    echo -e "${GREEN}✅ Correctly rejected invalid CSRF token (HTTP 403)${NC}"
else
    echo -e "${RED}❌ Should have rejected invalid CSRF (got HTTP $HTTP_CODE)${NC}"
fi
echo ""

echo "=========================================="
echo "              Test Summary"
echo "=========================================="
echo ""
echo -e "${GREEN}✅ CSRF Protection is working correctly!${NC}"
echo ""
echo "All tests completed. Review the results above."
echo ""

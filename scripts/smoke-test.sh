#!/bin/bash
# ============================================
# MarketPulse - Smoke Test Script
# ============================================
# Quick smoke tests for post-deployment validation

set -e

ENV="${1:-staging}"

if [ "$ENV" == "production" ]; then
    BASE_URL="https://marketpulse.com"
elif [ "$ENV" == "staging" ]; then
    BASE_URL="https://staging.marketpulse.com"
else
    BASE_URL="http://localhost:3000"
fi

echo "🔥 Running smoke tests against: $BASE_URL"
echo "================================================"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

PASS=0
FAIL=0

test_endpoint() {
    local name=$1
    local endpoint=$2
    local expected_status=$3
    
    echo -n "Testing $name... "
    
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    
    if [ "$STATUS" -eq "$expected_status" ]; then
        echo -e "${GREEN}PASS${NC} (HTTP $STATUS)"
        PASS=$((PASS + 1))
    else
        echo -e "${RED}FAIL${NC} (Expected $expected_status, got $STATUS)"
        FAIL=$((FAIL + 1))
    fi
}

# Run tests
test_endpoint "Health check" "/api/health" 200
test_endpoint "Homepage" "/" 200
test_endpoint "Categories API" "/api/categories" 200
test_endpoint "Posts API" "/api/posts" 200
test_endpoint "Search page" "/search" 200
test_endpoint "Login page" "/login" 200
test_endpoint "Register page" "/register" 200

echo ""
echo "================================================"
echo "Results: ${GREEN}$PASS passed${NC}, ${RED}$FAIL failed${NC}"
echo "================================================"

if [ $FAIL -gt 0 ]; then
    exit 1
else
    exit 0
fi

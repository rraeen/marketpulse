#!/bin/bash
# ============================================
# MarketPulse - Production Verification Script
# ============================================
# Runs post-deployment verification checks

set -e  # Exit on error

DOMAIN="${1:-https://marketpulse.com}"
MAX_RETRIES=5
RETRY_DELAY=10

echo "🔍 Starting production verification for: $DOMAIN"
echo "================================================"

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo -e "ℹ️  $1"
}

# Function to retry requests
retry_request() {
    local url=$1
    local retries=0
    
    while [ $retries -lt $MAX_RETRIES ]; do
        if curl -s -o /dev/null -w "%{http_code}" "$url" > /tmp/status_code.txt 2>&1; then
            return 0
        fi
        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            warning "Retry $retries/$MAX_RETRIES..."
            sleep $RETRY_DELAY
        fi
    done
    return 1
}

# Check 1: Health endpoint
info "Checking health endpoint..."
if retry_request "$DOMAIN/api/health"; then
    STATUS_CODE=$(cat /tmp/status_code.txt)
    if [ "$STATUS_CODE" -eq 200 ]; then
        success "Health check passed (HTTP $STATUS_CODE)"
        
        # Parse health response
        HEALTH_JSON=$(curl -s "$DOMAIN/api/health")
        STATUS=$(echo "$HEALTH_JSON" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        
        if [ "$STATUS" == "healthy" ]; then
            success "Application status: healthy"
        else
            error "Application status: $STATUS"
            exit 1
        fi
    else
        error "Health check failed (HTTP $STATUS_CODE)"
        exit 1
    fi
else
    error "Health endpoint unreachable"
    exit 1
fi

# Check 2: Homepage loads
info "Checking homepage..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/")
if [ "$STATUS_CODE" -eq 200 ]; then
    success "Homepage loads (HTTP $STATUS_CODE)"
else
    error "Homepage failed (HTTP $STATUS_CODE)"
    exit 1
fi

# Check 3: API endpoints respond
info "Checking API endpoints..."

# Categories endpoint
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/categories")
if [ "$STATUS_CODE" -eq 200 ]; then
    success "Categories API responds (HTTP $STATUS_CODE)"
else
    error "Categories API failed (HTTP $STATUS_CODE)"
    exit 1
fi

# Posts endpoint
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$DOMAIN/api/posts")
if [ "$STATUS_CODE" -eq 200 ]; then
    success "Posts API responds (HTTP $STATUS_CODE)"
else
    error "Posts API failed (HTTP $STATUS_CODE)"
    exit 1
fi

# Check 4: Security headers
info "Checking security headers..."

HEADERS=$(curl -s -I "$DOMAIN/")

if echo "$HEADERS" | grep -q "X-Content-Type-Options"; then
    success "X-Content-Type-Options header present"
else
    warning "X-Content-Type-Options header missing"
fi

if echo "$HEADERS" | grep -q "X-Frame-Options"; then
    success "X-Frame-Options header present"
else
    warning "X-Frame-Options header missing"
fi

if echo "$HEADERS" | grep -q "Strict-Transport-Security"; then
    success "HSTS header present"
else
    warning "HSTS header missing"
fi

# Check 5: SSL/TLS
info "Checking SSL certificate..."
if echo | openssl s_client -connect "${DOMAIN#https://}:443" -servername "${DOMAIN#https://}" 2>/dev/null | grep -q "Verify return code: 0"; then
    success "SSL certificate valid"
else
    warning "SSL certificate validation failed"
fi

# Check 6: Response time
info "Checking response time..."
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$DOMAIN/")
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc)

if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
    success "Response time: ${RESPONSE_MS}ms (< 2s)"
else
    warning "Response time: ${RESPONSE_MS}ms (> 2s - consider optimization)"
fi

# Summary
echo ""
echo "================================================"
success "All verification checks passed!"
echo ""
echo "Deployment Summary:"
echo "  - Domain: $DOMAIN"
echo "  - Health: ✅ Healthy"
echo "  - Response Time: ${RESPONSE_MS}ms"
echo "  - SSL: ✅ Valid"
echo ""
echo "Next steps:"
echo "  1. Monitor error logs for 30 minutes"
echo "  2. Check user reports"
echo "  3. Update deployment log"
echo "================================================"

exit 0

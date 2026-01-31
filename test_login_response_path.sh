#!/bin/bash

# ═══════════════════════════════════════════════════════════
# Login Response Path Diagnostic Script
# Tests direct backend vs nginx to find where response is lost
# ═══════════════════════════════════════════════════════════

echo "🔍 DIAGNOSING LOGIN RESPONSE PATH"
echo "══════════════════════════════════════════════════════"
echo ""

# Test credentials
EMAIL="mahadev@gmail.com"
PASSWORD="123456"

# ═══════════════════════════════════════════════════════════
# TEST 1: Direct Backend (Bypass Nginx)
# ═══════════════════════════════════════════════════════════

echo "📌 TEST 1: Direct Backend (localhost:5000)"
echo "─────────────────────────────────────────────────────"
echo ""

START_TIME=$(date +%s)

DIRECT_RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" \
  -X POST 'http://localhost:5000/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  --max-time 10 2>&1)

END_TIME=$(date +%s)
DIRECT_DURATION=$((END_TIME - START_TIME))

# Parse response
DIRECT_BODY=$(echo "$DIRECT_RESPONSE" | head -n -2)
DIRECT_HTTP_CODE=$(echo "$DIRECT_RESPONSE" | tail -n 2 | head -n 1)
DIRECT_TIME=$(echo "$DIRECT_RESPONSE" | tail -n 1)

echo "⏱️  Duration: ${DIRECT_DURATION}s (curl time: ${DIRECT_TIME}s)"
echo "📊 HTTP Status: $DIRECT_HTTP_CODE"
echo ""
echo "📦 Response Body:"
echo "─────────────────────────────────────────────────────"
if [ -n "$DIRECT_BODY" ]; then
    echo "$DIRECT_BODY" | jq . 2>/dev/null || echo "$DIRECT_BODY"
else
    echo "❌ NO RESPONSE RECEIVED"
fi
echo "─────────────────────────────────────────────────────"
echo ""

if [ "$DIRECT_HTTP_CODE" = "200" ]; then
    echo "✅ DIRECT BACKEND: SUCCESS"
    DIRECT_SUCCESS=true
else
    echo "❌ DIRECT BACKEND: FAILED"
    DIRECT_SUCCESS=false
fi

echo ""
echo ""

# ═══════════════════════════════════════════════════════════
# TEST 2: Through Nginx
# ═══════════════════════════════════════════════════════════

echo "📌 TEST 2: Through Nginx (api.autojobzy.com)"
echo "─────────────────────────────────────────────────────"
echo ""

START_TIME=$(date +%s)

NGINX_RESPONSE=$(curl -s -w "\n%{http_code}\n%{time_total}" \
  -X POST 'https://api.autojobzy.com/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  --max-time 10 2>&1)

END_TIME=$(date +%s)
NGINX_DURATION=$((END_TIME - START_TIME))

# Parse response
NGINX_BODY=$(echo "$NGINX_RESPONSE" | head -n -2)
NGINX_HTTP_CODE=$(echo "$NGINX_RESPONSE" | tail -n 2 | head -n 1)
NGINX_TIME=$(echo "$NGINX_RESPONSE" | tail -n 1)

echo "⏱️  Duration: ${NGINX_DURATION}s (curl time: ${NGINX_TIME}s)"
echo "📊 HTTP Status: $NGINX_HTTP_CODE"
echo ""
echo "📦 Response Body:"
echo "─────────────────────────────────────────────────────"
if [ -n "$NGINX_BODY" ]; then
    echo "$NGINX_BODY" | jq . 2>/dev/null || echo "$NGINX_BODY"
else
    echo "❌ NO RESPONSE RECEIVED"
fi
echo "─────────────────────────────────────────────────────"
echo ""

if [ "$NGINX_HTTP_CODE" = "200" ]; then
    echo "✅ THROUGH NGINX: SUCCESS"
    NGINX_SUCCESS=true
else
    echo "❌ THROUGH NGINX: FAILED"
    NGINX_SUCCESS=false
fi

echo ""
echo ""

# ═══════════════════════════════════════════════════════════
# COMPARISON & DIAGNOSIS
# ═══════════════════════════════════════════════════════════

echo "📊 COMPARISON RESULTS"
echo "══════════════════════════════════════════════════════"
echo ""

echo "| Test                  | Status | Time    | HTTP Code |"
echo "|-----------------------|--------|---------|-----------|"
printf "| Direct Backend        | "
if [ "$DIRECT_SUCCESS" = true ]; then
    printf "✅ OK  "
else
    printf "❌ FAIL"
fi
printf " | %6ss | %-9s |\n" "$DIRECT_DURATION" "$DIRECT_HTTP_CODE"

printf "| Through Nginx         | "
if [ "$NGINX_SUCCESS" = true ]; then
    printf "✅ OK  "
else
    printf "❌ FAIL"
fi
printf " | %6ss | %-9s |\n" "$NGINX_DURATION" "$NGINX_HTTP_CODE"

echo ""
echo ""

# ═══════════════════════════════════════════════════════════
# DIAGNOSIS
# ═══════════════════════════════════════════════════════════

echo "🔍 DIAGNOSIS"
echo "══════════════════════════════════════════════════════"
echo ""

if [ "$DIRECT_SUCCESS" = true ] && [ "$NGINX_SUCCESS" = true ]; then
    echo "✅ BOTH WORKING - No issue found!"
    echo "   Backend and Nginx are both responding correctly."
    echo ""

elif [ "$DIRECT_SUCCESS" = true ] && [ "$NGINX_SUCCESS" = false ]; then
    echo "⚠️  NGINX RESPONSE PATH ISSUE"
    echo ""
    echo "Backend is working, but Nginx is not forwarding response."
    echo ""
    echo "🔧 SOLUTION: Fix Nginx Configuration"
    echo ""
    echo "1. Check nginx config:"
    echo "   sudo nginx -T | grep -A 10 'location /api'"
    echo ""
    echo "2. Add/verify these settings in nginx config:"
    echo ""
    echo "   location /api/ {"
    echo "       proxy_pass http://localhost:5000;"
    echo "       proxy_read_timeout 120s;"
    echo "       proxy_connect_timeout 120s;"
    echo "       proxy_send_timeout 120s;        # IMPORTANT!"
    echo "       proxy_buffering off;            # Try disabling"
    echo "       proxy_request_buffering off;    # Try disabling"
    echo "   }"
    echo ""
    echo "3. Test nginx config:"
    echo "   sudo nginx -t"
    echo ""
    echo "4. Reload nginx:"
    echo "   sudo systemctl reload nginx"
    echo ""

elif [ "$DIRECT_SUCCESS" = false ] && [ "$NGINX_SUCCESS" = false ]; then
    echo "❌ BACKEND ISSUE"
    echo ""
    echo "Backend is not responding correctly."
    echo ""
    echo "🔧 SOLUTION: Check Backend"
    echo ""
    echo "1. Check PM2 status:"
    echo "   pm2 status"
    echo "   pm2 logs job-automate-api --lines 50"
    echo ""
    echo "2. Check if login endpoint exists:"
    echo "   grep -n \"post.*login\" server/routes/auth.js"
    echo ""
    echo "3. Restart server:"
    echo "   pm2 restart job-automate-api"
    echo ""

elif [ "$DIRECT_SUCCESS" = false ] && [ "$NGINX_SUCCESS" = true ]; then
    echo "⚠️  UNUSUAL: Nginx works but direct doesn't"
    echo ""
    echo "This is unusual. Nginx should be proxying to backend."
    echo "Nginx might be caching or redirecting elsewhere."
    echo ""
fi

echo ""
echo "══════════════════════════════════════════════════════"

# ═══════════════════════════════════════════════════════════
# ADDITIONAL CHECKS
# ═══════════════════════════════════════════════════════════

echo ""
echo "📋 ADDITIONAL CHECKS"
echo "══════════════════════════════════════════════════════"
echo ""

# Check if backend is listening
echo "🔍 Checking if backend is listening on port 5000..."
if netstat -tuln | grep -q ":5000 "; then
    echo "✅ Backend is listening on port 5000"
else
    echo "❌ Backend is NOT listening on port 5000!"
    echo "   Run: pm2 restart job-automate-api"
fi
echo ""

# Check nginx status
echo "🔍 Checking nginx status..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx is running"
else
    echo "❌ Nginx is NOT running!"
    echo "   Run: sudo systemctl start nginx"
fi
echo ""

# Check recent backend logs
echo "🔍 Recent backend logs (last 10 lines):"
echo "─────────────────────────────────────────────────────"
pm2 logs job-automate-api --lines 10 --nostream 2>/dev/null || echo "Cannot access PM2 logs"
echo "─────────────────────────────────────────────────────"
echo ""

echo "══════════════════════════════════════════════════════"
echo "✅ DIAGNOSTIC COMPLETE"
echo "══════════════════════════════════════════════════════"

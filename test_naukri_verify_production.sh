#!/bin/bash

# ═══════════════════════════════════════════════════════════
# Test Naukri Credentials Verification - Production API
# ═══════════════════════════════════════════════════════════

echo "🧪 Testing Naukri Verification on Production..."
echo ""

# Configuration
API_URL="https://api.autojobzy.com/api/auth/verify-naukri-credentials"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ZDcwZmYxNi1hZTk2LTQ2YzAtYTgyZi0wMTNhZTcwZDNmODMiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2OTg3NTY5NSwiZXhwIjoxNzcyNDY3Njk1fQ.s4p6Wx3rxUfeWN4Il34DAI96CtMPla-oehNZ41Gsi4U"
USERNAME="rohankadam474@gmail.com"
PASSWORD="Rohan@123"

echo "📍 API: $API_URL"
echo "📧 Username: $USERNAME"
echo ""
echo "⏱️  This may take 12-15 seconds..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start timer
START_TIME=$(date +%s)

# Make request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"naukriUsername\":\"$USERNAME\",\"naukriPassword\":\"$PASSWORD\"}")

# End timer
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

# Extract HTTP code and body
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

# Display results
echo "⏱️  Duration: $DURATION seconds"
echo "📊 HTTP Status: $HTTP_CODE"
echo ""
echo "📦 Response:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Pretty print JSON if possible
if command -v jq &> /dev/null; then
    echo "$BODY" | jq .
else
    echo "$BODY"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check result
if [ "$HTTP_CODE" = "200" ]; then
    SUCCESS=$(echo "$BODY" | grep -o '"success"[[:space:]]*:[[:space:]]*true' | wc -l)
    if [ "$SUCCESS" -gt 0 ]; then
        echo "✅ VERIFICATION SUCCESSFUL!"
        echo "💬 Credentials are valid"
    else
        echo "❌ VERIFICATION FAILED"
        echo "💬 Credentials are invalid or error occurred"
    fi
elif [ "$HTTP_CODE" = "504" ]; then
    echo "❌ 504 GATEWAY TIMEOUT"
    echo "💬 Server took too long to respond (nginx timeout)"
    echo ""
    echo "🔧 Fix required:"
    echo "   - Configure nginx timeout to 120 seconds"
    echo "   - Or check if backend server is running"
elif [ "$HTTP_CODE" = "401" ]; then
    echo "❌ 401 UNAUTHORIZED"
    echo "💬 JWT token is invalid or expired"
    echo ""
    echo "🔧 Get new token:"
    echo "   curl -X POST 'https://api.autojobzy.com/api/auth/login' \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"email\":\"YOUR_EMAIL\",\"password\":\"YOUR_PASSWORD\"}'"
elif [ "$HTTP_CODE" = "500" ]; then
    echo "❌ 500 INTERNAL SERVER ERROR"
    echo "💬 Backend error occurred"
else
    echo "⚠️  Unexpected HTTP status: $HTTP_CODE"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

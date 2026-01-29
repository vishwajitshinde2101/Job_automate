#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkMDBlMDIzZS1jY2M3LTRkZjktYjg1Mi1mNWEwYTBjNDkwODUiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2OTY4NDM1MCwiZXhwIjoxNzcyMjc2MzUwfQ.U0VAjZlE9oIb3_0-n2P5wHEfx2CKCxLbSwFL0QIhGXY"

echo "🧪 Testing Naukri Verification via HTTP..."
echo ""
echo "📍 Endpoint: http://localhost:5000/api/auth/verify-naukri-credentials"
echo "📧 Testing with: rohankadam474@gmail.com"
echo ""
echo "⏱️  This will take ~12 seconds..."
echo ""

START_TIME=$(date +%s)

RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:5000/api/auth/verify-naukri-credentials \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"naukriUsername\":\"rohankadam474@gmail.com\",\"naukriPassword\":\"Rohan@123\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "📊 Response Status: $HTTP_CODE"
echo "⏱️  Duration: ${DURATION} seconds"
echo ""
echo "📦 Response Body:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    SUCCESS=$(echo "$BODY" | jq -r '.success' 2>/dev/null)
    if [ "$SUCCESS" = "true" ]; then
        echo "✅ VERIFICATION SUCCESSFUL!"
    else
        echo "❌ VERIFICATION FAILED"
        echo "Message: $(echo "$BODY" | jq -r '.message')"
    fi
else
    echo "❌ HTTP ERROR: Status $HTTP_CODE"
fi

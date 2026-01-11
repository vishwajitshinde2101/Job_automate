#!/bin/bash

echo ""
echo "==================================================================="
echo "Testing Production Login for Super Admin"
echo "==================================================================="
echo ""
echo "🔑 Logging in to PRODUCTION server..."
echo ""

# Login to production
response=$(curl -s 'https://api.autojobzy.com/api/auth/login' \
  -H 'Content-Type: application/json' \
  --data-raw '{"email":"admin@jobzy.com","password":"superadmin"}')

echo "Response from production login:"
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
echo ""

# Extract token
token=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$token" ]; then
    echo "❌ Login failed! No token received."
    echo ""
    echo "Possible reasons:"
    echo "  1. Wrong credentials"
    echo "  2. Production server is down"
    echo "  3. Database connection issue"
    exit 1
fi

echo "✅ Login successful! Token received."
echo ""
echo "🧪 Now testing dashboard-stats endpoint..."
echo ""

# Test dashboard-stats with production token
stats_response=$(curl -s "https://api.autojobzy.com/api/superadmin/dashboard-stats" \
  -H "Authorization: Bearer $token")

echo "Response from dashboard-stats:"
echo "$stats_response" | python3 -m json.tool 2>/dev/null || echo "$stats_response"
echo ""

if echo "$stats_response" | grep -q "error"; then
    echo "❌ Dashboard stats request failed!"
    echo ""
    echo "This means production server has a DIFFERENT JWT_SECRET"
else
    echo "✅ Dashboard stats request successful!"
    echo ""
    echo "🎉 Your production server is working correctly!"
fi

echo ""
echo "==================================================================="
echo ""

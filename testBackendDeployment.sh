#!/bin/bash

echo ""
echo "==================================================================="
echo "Testing Backend Deployment Status"
echo "==================================================================="
echo ""

# Test if backend has new code
echo "1️⃣  Testing Staff Login (should work)..."
echo ""

login_response=$(curl -s 'https://api.autojobzy.com/api/auth/login' \
  -H 'Content-Type: application/json' \
  --data-raw '{"email":"staff@example.com","password":"password"}')

echo "Login Response:"
echo "$login_response" | python3 -m json.tool 2>/dev/null || echo "$login_response"
echo ""

# Extract token
token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$token" ]; then
    echo "❌ Login failed - no token received"
    echo ""
    echo "This could mean:"
    echo "  - Wrong credentials"
    echo "  - Staff user doesn't exist in database"
    echo ""
    exit 1
fi

role=$(echo "$login_response" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
echo "✅ Login successful! Role: $role"
echo ""

# Test dashboard API
echo "2️⃣  Testing Dashboard API (should work if backend updated)..."
echo ""

dashboard_response=$(curl -s "https://api.autojobzy.com/api/institute-admin/dashboard" \
  -H "Authorization: Bearer $token")

echo "Dashboard Response:"
echo "$dashboard_response" | python3 -m json.tool 2>/dev/null || echo "$dashboard_response"
echo ""

if echo "$dashboard_response" | grep -q '"error".*"Institute admin only"'; then
    echo "❌ BACKEND NOT UPDATED!"
    echo ""
    echo "Backend is still running OLD CODE that blocks staff."
    echo ""
    echo "Error message: 'Access denied. Institute admin only.'"
    echo "Expected message: 'Access denied. Institute admin or staff only.'"
    echo ""
    echo "📌 ACTION REQUIRED:"
    echo "   1. Check if production server auto-deployed"
    echo "   2. Or manually deploy/restart backend server"
    echo "   3. Backend code is already pushed to GitHub (commit 906c5dc)"
    echo ""
elif echo "$dashboard_response" | grep -q '"error".*"Institute staff not found"'; then
    echo "⚠️  BACKEND UPDATED but STAFF RECORD MISSING!"
    echo ""
    echo "Backend has new code but staff record not in database."
    echo ""
    echo "📌 ACTION REQUIRED:"
    echo "   Add staff record to institute_staff table"
    echo ""
elif echo "$dashboard_response" | grep -q '"error"'; then
    echo "⚠️  BACKEND UPDATED but OTHER ERROR"
    echo ""
    echo "Check the error message above"
    echo ""
else
    echo "✅ BACKEND UPDATED SUCCESSFULLY!"
    echo ""
    echo "Dashboard API is working correctly for staff role."
    echo "Staff can now access the dashboard!"
    echo ""
fi

echo "==================================================================="
echo ""

#!/bin/bash

API_URL="https://api.autojobzy.com/api"
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkMDBlMDIzZS1jY2M3LTRkZjktYjg1Mi1mNWEwYTBjNDkwODUiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2OTY4NDM1MCwiZXhwIjoxNzcyMjc2MzUwfQ.U0VAjZlE9oIb3_0-n2P5wHEfx2CKCxLbSwFL0QIhGXY"

echo "=========================================="
echo "🧪 TESTING PRODUCTION API"
echo "🌐 API: $API_URL"
echo "=========================================="
echo ""

# =====================================
# TEST 1: NAUKRI VERIFICATION
# =====================================
echo "📌 TEST 1: Naukri Credentials Verification"
echo "=========================================="
echo ""
echo "📧 Testing with: rohankadam474@gmail.com"
echo "⏱️  This may take 12-15 seconds..."
echo ""

START_TIME=$(date +%s)

curl -s "$API_URL/auth/verify-naukri-credentials" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  --data-raw '{"naukriUsername":"rohankadam474@gmail.com","naukriPassword":"Rohan@123"}' \
  > /tmp/prod_verify.json

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "⏱️  Duration: ${DURATION} seconds"
echo ""
echo "📦 Response:"
cat /tmp/prod_verify.json | jq . 2>/dev/null || cat /tmp/prod_verify.json
echo ""

SUCCESS=$(cat /tmp/prod_verify.json | jq -r '.success' 2>/dev/null)
if [ "$SUCCESS" = "true" ]; then
    echo "✅ NAUKRI VERIFICATION SUCCESSFUL!"
else
    echo "❌ NAUKRI VERIFICATION FAILED"
    MESSAGE=$(cat /tmp/prod_verify.json | jq -r '.message' 2>/dev/null)
    echo "💬 Message: $MESSAGE"
fi

echo ""
echo "=========================================="
echo ""
sleep 2

# =====================================
# TEST 2: RESUME UPLOAD
# =====================================
echo "📌 TEST 2: Resume Upload to S3"
echo "=========================================="
echo ""

# Create test resume
cat > /tmp/prod_test_resume.txt << 'EOF'
ROHAN KADAM - PRODUCTION TEST
Senior Software Engineer

EXPERIENCE:
8+ years of experience in software development

SKILLS:
- React, Node.js, TypeScript
- AWS, Docker, Kubernetes
- Python, Django, FastAPI

PROJECTS:
- Built scalable cloud infrastructure
- Implemented microservices architecture
EOF

echo "📤 Uploading resume to production S3..."
echo ""

START_TIME=$(date +%s)

curl -s "$API_URL/job-settings/resume" \
  -H "Authorization: Bearer $TOKEN" \
  -F "resume=@/tmp/prod_test_resume.txt" \
  > /tmp/prod_upload.json

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo "⏱️  Duration: ${DURATION} seconds"
echo ""
echo "📦 Response:"
cat /tmp/prod_upload.json | jq . 2>/dev/null || cat /tmp/prod_upload.json
echo ""

SUCCESS=$(cat /tmp/prod_upload.json | jq -r '.success' 2>/dev/null)
if [ "$SUCCESS" = "true" ]; then
    echo "✅ RESUME UPLOAD SUCCESSFUL!"
    S3_URL=$(cat /tmp/prod_upload.json | jq -r '.resumeUrl')
    EXPERIENCE=$(cat /tmp/prod_upload.json | jq -r '.yearsOfExperience')
    echo "☁️  S3 URL: $S3_URL"
    echo "💼 Experience: $EXPERIENCE"
else
    echo "❌ RESUME UPLOAD FAILED"
    ERROR=$(cat /tmp/prod_upload.json | jq -r '.error' 2>/dev/null)
    echo "💬 Error: $ERROR"
fi

echo ""
echo "=========================================="
echo ""
sleep 2

# =====================================
# TEST 3: RESUME DELETE
# =====================================
echo "📌 TEST 3: Resume Delete from S3"
echo "=========================================="
echo ""
echo "🗑️  Deleting resume..."
echo ""

curl -s -X DELETE "$API_URL/job-settings/resume" \
  -H "Authorization: Bearer $TOKEN" \
  > /tmp/prod_delete.json

echo "📦 Response:"
cat /tmp/prod_delete.json | jq . 2>/dev/null || cat /tmp/prod_delete.json
echo ""

SUCCESS=$(cat /tmp/prod_delete.json | jq -r '.success' 2>/dev/null)
if [ "$SUCCESS" = "true" ]; then
    echo "✅ RESUME DELETE SUCCESSFUL!"
else
    echo "❌ RESUME DELETE FAILED"
    ERROR=$(cat /tmp/prod_delete.json | jq -r '.error' 2>/dev/null)
    echo "💬 Error: $ERROR"
fi

echo ""
echo "=========================================="
echo "🎉 PRODUCTION API TESTING COMPLETE"
echo "=========================================="

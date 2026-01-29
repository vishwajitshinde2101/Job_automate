#!/bin/bash

# ======================== S3 RESUME UPLOAD TEST ========================
# Quick test script for S3 resume upload functionality

echo "🧪 Testing S3 Resume Upload..."
echo ""

# Check if .env has AWS credentials
if ! grep -q "AWS_ACCESS_KEY_ID=AKIA" .env 2>/dev/null; then
    echo "❌ AWS credentials not configured in .env file"
    echo "   Please update .env with your AWS credentials:"
    echo "   AWS_ACCESS_KEY_ID=your_key"
    echo "   AWS_SECRET_ACCESS_KEY=your_secret"
    exit 1
fi

echo "✅ AWS credentials found in .env"

# Start server in background
echo "🚀 Starting server..."
npm run server &
SERVER_PID=$!
sleep 5

# Wait for server to be ready
echo "⏳ Waiting for server to be ready..."
for i in {1..10}; do
    if curl -s https://api.autojobzy.com/api/health > /dev/null 2>&1; then
        echo "✅ Server is ready!"
        break
    fi
    sleep 2
done

echo ""
echo "📝 To test resume upload, you need:"
echo "   1. A valid JWT token (login first)"
echo "   2. A resume file (PDF, DOC, DOCX, or TXT)"
echo ""
echo "Example command:"
echo "   curl -X POST https://api.autojobzy.com/api/job-settings/resume \\"
echo "     -H 'Authorization: Bearer YOUR_TOKEN_HERE' \\"
echo "     -F 'resume=@/path/to/resume.pdf'"
echo ""
echo "Server is running on PID: $SERVER_PID"
echo "Press Ctrl+C to stop the server"

# Keep script running
wait $SERVER_PID

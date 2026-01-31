#!/bin/bash

echo "=========================================="
echo "🔧 PRODUCTION .ENV UPDATE SCRIPT"
echo "=========================================="
echo ""
echo "This script will update AWS credentials in production .env file"
echo ""

# AWS Credentials
AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
AWS_REGION="ap-south-1"
AWS_S3_BUCKET_NAME="autojobzy-resumes"

echo "📍 Step 1: Checking current .env file..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found in current directory!"
    echo "Please run this script from /home/autojobzy/Job_automate"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Backup .env
echo "📍 Step 2: Creating backup of .env..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created"
echo ""

# Check if AWS credentials already exist
echo "📍 Step 3: Checking existing AWS credentials..."
if grep -q "AWS_ACCESS_KEY_ID" .env; then
    echo "⚠️  AWS_ACCESS_KEY_ID already exists - will update"
else
    echo "ℹ️  AWS_ACCESS_KEY_ID not found - will add"
fi
echo ""

# Remove old AWS credentials if they exist
echo "📍 Step 4: Removing old AWS credentials (if any)..."
sed -i.tmp '/AWS_ACCESS_KEY_ID/d' .env
sed -i.tmp '/AWS_SECRET_ACCESS_KEY/d' .env
sed -i.tmp '/AWS_REGION/d' .env
sed -i.tmp '/AWS_S3_BUCKET_NAME/d' .env
rm -f .env.tmp
echo "✅ Old credentials removed"
echo ""

# Add new AWS credentials
echo "📍 Step 5: Adding new AWS credentials..."
cat >> .env << EOF

# AWS S3 Configuration (for resume uploads)
# Updated: $(date)
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
AWS_REGION=$AWS_REGION
AWS_S3_BUCKET_NAME=$AWS_S3_BUCKET_NAME
EOF

echo "✅ New credentials added"
echo ""

# Verify credentials were added
echo "📍 Step 6: Verifying credentials..."
echo ""
echo "Current AWS configuration:"
echo "─────────────────────────────────────"
grep "AWS_" .env | grep -v "^#"
echo "─────────────────────────────────────"
echo ""

# Show what to do next
echo "=========================================="
echo "✅ .ENV FILE UPDATED SUCCESSFULLY!"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Restart PM2:"
echo "   pm2 restart job-automate-api"
echo ""
echo "2. Check logs for errors:"
echo "   pm2 logs job-automate-api --lines 50"
echo ""
echo "3. Test resume upload:"
echo "   curl -X POST 'https://api.autojobzy.com/api/job-settings/resume' \\"
echo "     -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "     -F 'resume=@test_resume.txt'"
echo ""
echo "📌 Backup saved as: .env.backup.$(date +%Y%m%d_%H%M%S)"
echo ""

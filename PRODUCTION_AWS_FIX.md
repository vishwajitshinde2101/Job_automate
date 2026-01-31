# 🔧 Production AWS Credentials Fix

## Problem

```
❌ S3 Upload Error: Resolved credential object is not valid
```

Production server's `.env` file doesn't have valid AWS credentials for S3 uploads.

---

## 🚀 Quick Fix (Copy-Paste Commands)

### Step 1: SSH to Production Server

```bash
ssh ec2-user@13.232.185.74
```

### Step 2: Navigate to Project Directory

```bash
cd /home/autojobzy/Job_automate
```

### Step 3: Backup Current .env File

```bash
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
echo "✅ Backup created"
```

### Step 4: Check Current AWS Credentials

```bash
echo "Current AWS config:"
cat .env | grep AWS
```

### Step 5: Remove Old AWS Credentials (if any)

```bash
sed -i.bak '/^AWS_ACCESS_KEY_ID/d' .env
sed -i.bak '/^AWS_SECRET_ACCESS_KEY/d' .env
sed -i.bak '/^AWS_REGION/d' .env
sed -i.bak '/^AWS_S3_BUCKET_NAME/d' .env
rm -f .env.bak
echo "✅ Old AWS credentials removed"
```

### Step 6: Add New AWS Credentials

**Copy-paste this entire block:**

```bash
cat >> .env << 'EOF'

# AWS S3 Configuration (for resume uploads)
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=autojobzy-resumes
EOF

echo "✅ AWS credentials added"
```

### Step 7: Verify Credentials Were Added

```bash
echo "Verifying AWS credentials:"
cat .env | grep AWS
```

**Expected output:**
```
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=autojobzy-resumes
```

### Step 8: Restart PM2 Server

```bash
pm2 restart job-automate-api
```

### Step 9: Check Logs for Success

```bash
pm2 logs job-automate-api --lines 50
```

**Look for:**
- ✅ "Server running on..."
- ✅ "Database connection established"
- ❌ NO "S3 Upload Error" or "credential" errors

---

## 🧪 Test Resume Upload

### Step 10: Test S3 Upload

**On production server:**

```bash
# Create test resume file
cat > /tmp/test_resume.txt << 'EOF'
ROHAN KADAM
Software Engineer
5+ years of experience in software development
EOF

# Get your JWT token first (from browser or login)
# Then test upload:
TOKEN="YOUR_JWT_TOKEN_HERE"

curl -X POST 'https://api.autojobzy.com/api/job-settings/resume' \
  -H "Authorization: Bearer $TOKEN" \
  -F 'resume=@/tmp/test_resume.txt'
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "resumeUrl": "https://autojobzy-resumes.s3.ap-south-1.amazonaws.com/resumes/USER_ID-TIMESTAMP-RANDOM.txt",
  "resumeText": "ROHAN KADAM\nSoftware Engineer...",
  "yearsOfExperience": "5+",
  "fileName": "test_resume.txt"
}
```

**If you see the S3 URL in response, SUCCESS!** ✅

---

## 🎯 Alternative: One-Command Fix

**Copy-paste this ENTIRE command in one go:**

```bash
cd /home/autojobzy/Job_automate && \
cp .env .env.backup.$(date +%Y%m%d_%H%M%S) && \
sed -i.bak '/^AWS_ACCESS_KEY_ID/d; /^AWS_SECRET_ACCESS_KEY/d; /^AWS_REGION/d; /^AWS_S3_BUCKET_NAME/d' .env && \
cat >> .env << 'EOF'

# AWS S3 Configuration (for resume uploads)
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=autojobzy-resumes
EOF
echo "✅ AWS credentials updated" && \
cat .env | grep AWS && \
pm2 restart job-automate-api && \
echo "✅ Server restarted - check logs with: pm2 logs job-automate-api --lines 50"
```

This single command will:
1. ✅ Backup .env
2. ✅ Remove old AWS credentials
3. ✅ Add new credentials
4. ✅ Show credentials
5. ✅ Restart server

---

## 🔍 Verify S3 Bucket Access (Optional)

**On production server, test AWS credentials directly:**

```bash
# Install AWS CLI if not installed
which aws || (curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && sudo ./aws/install)

# Test credentials
export AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
export AWS_REGION=ap-south-1

# List S3 bucket contents
aws s3 ls s3://autojobzy-resumes/
```

**If successful**, you'll see:
```
PRE resumes/
```
or list of files.

**If credentials are invalid**, you'll see:
```
An error occurred (InvalidAccessKeyId) when calling the ListObjectsV2 operation
```

---

## 📝 What These Credentials Do

**AWS Account**: Your account
**S3 Bucket**: `autojobzy-resumes` (ap-south-1 region)
**Permissions**:
- ✅ Upload files (PutObject)
- ✅ Download files (GetObject)
- ✅ Delete files (DeleteObject)
- ✅ List bucket (ListBucket)

**Security**: Private bucket (files not publicly accessible)

---

## ✅ Success Indicators

After updating credentials and restarting, PM2 logs should show:

```
📄 Resume upload started for user: xyz
📝 Resume text extracted, Years of experience: 5+
Upload progress: 236/236 bytes
✅ File uploaded to S3: https://autojobzy-resumes.s3.ap-south-1.amazonaws.com/resumes/...
✅ Local file deleted: server/uploads/resumes/...
☁️ Resume uploaded to S3
✅ Resume upload completed successfully
```

**No more "Resolved credential object is not valid" errors!** 🎉

---

## 🚨 If Still Getting Errors

### Error: "Access Denied"

AWS credentials are valid but lack permissions. Contact AWS admin to add S3 permissions.

### Error: "Bucket not found"

Bucket name or region is wrong. Verify:
```bash
aws s3 ls s3://autojobzy-resumes --region ap-south-1
```

### Error: "Invalid credentials"

Credentials are expired/revoked. Get new credentials from AWS IAM console.

---

## 📋 Rollback (If Something Goes Wrong)

```bash
# List backups
ls -lah .env.backup*

# Restore from backup
cp .env.backup.20260129_XXXXXX .env

# Restart server
pm2 restart job-automate-api
```

---

## 🎉 Expected Result

After fix, resume upload API will:
1. ✅ Upload file to S3 bucket
2. ✅ Return S3 URL in response
3. ✅ Store S3 URL in database
4. ✅ Delete old file when re-uploading
5. ✅ Clean up local temp files

**तुमचा production server AWS S3 ready होईल!** 🚀

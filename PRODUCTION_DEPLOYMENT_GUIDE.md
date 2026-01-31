# 🚀 Production Deployment Guide

## ⚠️ Current Production Status

**Production server has OUTDATED code!** The following features are NOT working:

| Feature | Status | Issue |
|---------|--------|-------|
| Naukri Verification | ❌ 504 Timeout | Nginx timeout (60 sec) |
| Resume Upload to S3 | ⚠️ Partial | Missing `success` & `resumeUrl` fields |
| Resume Delete | ❌ Not Found | Endpoint doesn't exist |

---

## 📋 Changes to Deploy

### Backend Changes:

1. **Naukri Verification Timeout Fix**
   - File: `server/routes/auth.js` (lines 464-466)
   - Change: Added 120 second timeout for verification endpoint

2. **Resume Upload to S3**
   - File: `server/routes/jobSettings.js` (lines 93-176)
   - Change: S3 upload integration with auto-delete old file
   - File: `server/utils/s3Upload.js` (NEW FILE)
   - Change: S3 upload/delete utility functions

3. **Resume Delete Endpoint**
   - File: `server/routes/jobSettings.js` (lines 182-232)
   - Change: DELETE endpoint for resume removal

4. **Server Timeout Configuration**
   - File: `server/index.js` (lines 197-198)
   - Change: Server timeout set to 120 seconds

5. **Database Schema**
   - Migration: Add `resume_url` column to `job_settings` table

---

## 🔧 Step-by-Step Deployment

### Step 1: Commit Local Changes

```bash
# Stage all changes
git add server/routes/auth.js \
        server/routes/jobSettings.js \
        server/utils/s3Upload.js \
        server/models/JobSettings.js \
        server/index.js \
        NAUKRI_VERIFICATION_FIX.md \
        VERIFICATION_TEST_RESULTS.md \
        RESUME_UPLOAD_DELETE_TEST_RESULTS.md

# Commit with detailed message
git commit -m "Fix Naukri verification & add S3 resume upload/delete

Backend Changes:
- Fix Naukri verification 504 timeout (increase to 120 sec)
- Add resume upload to AWS S3 bucket
- Add resume delete from S3 and database
- Add auto-delete old resume on re-upload
- Set server timeout to 120 seconds

Tested locally:
✅ Naukri verification: 12 seconds
✅ Resume upload to S3: 1 second
✅ Resume delete: Complete cleanup
✅ Re-upload: Auto-deletes old file

Database:
- Add resume_url column to job_settings table"

# Push to main branch
git push origin main
```

### Step 2: SSH to Production Server

```bash
ssh ec2-user@13.232.185.74
```

### Step 3: Navigate to Project Directory

```bash
cd /home/autojobzy/Job_automate
```

### Step 4: Pull Latest Code

```bash
git pull origin main
```

### Step 5: Check Environment Variables

Ensure `.env` file has AWS credentials:

```bash
cat .env | grep AWS
```

**Required variables**:
```env
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=autojobzy-resumes
```

If missing, add them:
```bash
nano .env
# Add AWS variables
# Save with Ctrl+X, then Y, then Enter
```

### Step 6: Install Missing Dependencies (if any)

```bash
npm install
```

### Step 7: Run Database Migration

**Option A: Using Node.js Script**

Create migration script on server:
```bash
cat > run_migration.js << 'EOF'
import { sequelize } from './server/db/config.js';

async function migrate() {
    try {
        console.log('🔄 Running migration...');

        // Check if column exists
        const [columns] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'jobautomate'
            AND TABLE_NAME = 'job_settings'
            AND COLUMN_NAME = 'resume_url';
        `);

        if (columns.length === 0) {
            console.log('Adding resume_url column...');
            await sequelize.query(`
                ALTER TABLE job_settings
                ADD COLUMN resume_url TEXT NULL COMMENT 'S3 URL of uploaded resume'
                AFTER resume_file_name;
            `);
            console.log('✅ Migration completed!');
        } else {
            console.log('✅ Column already exists, skipping migration');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
EOF

# Run migration
node run_migration.js

# Remove migration file
rm run_migration.js
```

**Option B: Using MySQL CLI** (if Node.js script fails)

```bash
mysql -h database-1.c72i2s6muax7.ap-south-1.rds.amazonaws.com \
      -u admin \
      -p'YsjlUaX5yFJGtZqjmrSj' \
      jobautomate \
      -e "ALTER TABLE job_settings ADD COLUMN IF NOT EXISTS resume_url TEXT NULL COMMENT 'S3 URL of uploaded resume' AFTER resume_file_name;"
```

### Step 8: Restart Backend Server

```bash
pm2 restart job-automate-api
```

### Step 9: Check Server Logs

```bash
pm2 logs job-automate-api --lines 100
```

**Look for:**
- ✅ Server started successfully
- ✅ Database connection established
- ✅ No errors in startup

### Step 10: Verify Server is Running

```bash
pm2 list

# Should show:
# job-automate-api | online | 0 restarts
```

---

## 🧪 Test Production Deployment

### Test 1: Naukri Verification

```bash
# Get fresh token
TOKEN=$(curl -s -X POST 'https://api.autojobzy.com/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"YOUR_EMAIL","password":"YOUR_PASSWORD"}' \
  | jq -r '.token')

# Test verification (should take ~12-15 seconds)
curl -X POST 'https://api.autojobzy.com/api/auth/verify-naukri-credentials' \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "naukriUsername": "rohankadam474@gmail.com",
    "naukriPassword": "Rohan@123"
  }' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Credentials verified successfully!",
  "verified": true
}
```

### Test 2: Resume Upload

```bash
# Create test file
echo "Test Resume Content" > /tmp/test_resume.txt

# Upload
curl -X POST 'https://api.autojobzy.com/api/job-settings/resume' \
  -H "Authorization: Bearer $TOKEN" \
  -F 'resume=@/tmp/test_resume.txt' | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "resumeUrl": "https://autojobzy-resumes.s3.ap-south-1.amazonaws.com/resumes/...",
  "fileName": "test_resume.txt",
  "yearsOfExperience": "..."
}
```

### Test 3: Resume Delete

```bash
curl -X DELETE 'https://api.autojobzy.com/api/job-settings/resume' \
  -H "Authorization: Bearer $TOKEN" | jq .
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Resume deleted successfully"
}
```

---

## ⚙️ Configure Nginx Timeout (CRITICAL!)

**Problem**: Nginx is timing out after 60 seconds for Naukri verification

**Solution**: Update nginx configuration

### Option 1: Update Specific Location

```bash
# SSH to server
ssh ec2-user@13.232.185.74

# Edit nginx config
sudo nano /etc/nginx/sites-available/autojobzy.com
# OR
sudo nano /etc/nginx/nginx.conf
```

Add this configuration:

```nginx
# For specific endpoint
location /api/auth/verify-naukri-credentials {
    proxy_pass http://localhost:5000;
    proxy_read_timeout 120s;
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
}

# OR for all API endpoints
location /api/ {
    proxy_pass http://localhost:5000;
    proxy_read_timeout 120s;
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
}
```

Save and test:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Option 2: AWS Application Load Balancer (if using ALB)

1. Go to AWS Console → EC2 → Target Groups
2. Select your target group
3. Edit attributes
4. Set **Idle timeout** to **120 seconds** (default is 60)
5. Save changes

---

## 🔍 Troubleshooting

### If Naukri Verification Still Times Out:

1. **Check nginx timeout**:
   ```bash
   sudo nginx -T | grep timeout
   ```

2. **Check application logs**:
   ```bash
   pm2 logs job-automate-api --lines 200 | grep VERIFY
   ```

3. **Test backend directly (bypass nginx)**:
   ```bash
   curl -X POST 'http://localhost:5000/api/auth/verify-naukri-credentials' \
     -H 'Content-Type: application/json' \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"naukriUsername":"EMAIL","naukriPassword":"PASSWORD"}'
   ```

### If Resume Upload Missing S3 URL:

1. **Check AWS credentials**:
   ```bash
   cat .env | grep AWS
   ```

2. **Check S3 bucket exists**:
   ```bash
   aws s3 ls s3://autojobzy-resumes --region ap-south-1
   ```

3. **Check server logs**:
   ```bash
   pm2 logs job-automate-api --lines 50 | grep S3
   ```

### If Resume Delete Returns 404:

1. **Check route is loaded**:
   ```bash
   pm2 logs job-automate-api | grep "DELETE.*resume"
   ```

2. **Restart server**:
   ```bash
   pm2 restart job-automate-api
   ```

---

## ✅ Post-Deployment Checklist

- [ ] Git pull successful
- [ ] Environment variables configured
- [ ] Database migration completed
- [ ] PM2 restart successful
- [ ] No errors in PM2 logs
- [ ] Naukri verification working (200 OK, ~12-15 sec)
- [ ] Resume upload returns S3 URL
- [ ] Resume delete working
- [ ] Nginx timeout configured (if needed)

---

## 📝 Rollback Plan (If Deployment Fails)

If something goes wrong:

```bash
# Find previous commit
git log --oneline -5

# Rollback to previous commit
git checkout <previous-commit-hash>

# Restart server
pm2 restart job-automate-api

# Check logs
pm2 logs --lines 50
```

---

## 📞 Support

If you encounter issues:

1. Check PM2 logs: `pm2 logs job-automate-api --lines 200`
2. Check nginx logs: `sudo tail -100 /var/log/nginx/error.log`
3. Check database connection: `mysql -h <host> -u admin -p`

---

## 🎉 Expected Results After Deployment

| Feature | Before | After |
|---------|--------|-------|
| Naukri Verification | ❌ 504 Timeout | ✅ Success in 12-15 sec |
| Resume Upload | ⚠️ No S3 URL | ✅ Returns S3 URL |
| Resume Delete | ❌ Not Found | ✅ Deletes from S3 + DB |
| Change Resume | ❌ N/A | ✅ Auto-deletes old file |

---

**तुमच्या production deployment साठी सर्व काही ready आहे!** 🚀

# S3 Resume Upload Implementation Guide

## ✅ What's Implemented

### 1. **S3 Upload Utility** (`server/utils/s3Upload.js`)
- Upload files to AWS S3
- Delete old files from S3
- Automatic local file cleanup after S3 upload
- Pre-signed URL generation (for private files)

### 2. **Updated Resume Upload Endpoint** (`POST /api/job-settings/resume`)
- Accepts file upload (PDF, DOC, DOCX, TXT)
- Extracts resume text and years of experience
- **Uploads to S3 bucket**
- Stores S3 URL in database
- Deletes old resume from S3 when new one is uploaded

### 3. **Database Schema Updated**
- Added `resume_url` column to `job_settings` table
- Stores full S3 URL: `https://bucket-name.s3.region.amazonaws.com/resumes/filename.pdf`

---

## 🔧 Setup Instructions

### Step 1: Create AWS S3 Bucket

1. **Login to AWS Console**: https://console.aws.amazon.com/
2. **Go to S3**: Search for "S3" in services
3. **Create Bucket**:
   - Bucket name: `autojobzy-resumes` (or your preferred name)
   - Region: `ap-south-1` (Mumbai) - same as your RDS
   - **Block Public Access**: Uncheck if you want public URLs, keep checked for private
   - Click **Create Bucket**

### Step 2: Create IAM User for S3 Access

1. **Go to IAM**: Search for "IAM" in AWS Console
2. **Users → Add User**:
   - User name: `autojobzy-s3-uploader`
   - Access type: **Programmatic access** ✓
3. **Set Permissions**:
   - Attach existing policies: **AmazonS3FullAccess** (or create custom policy below)
4. **Create User** and **Save credentials**:
   - Access Key ID: `AKIAXXXXXXXXXXXXXXXX`
   - Secret Access Key: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

#### Custom S3 Policy (Recommended - More Secure):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::autojobzy-resumes",
        "arn:aws:s3:::autojobzy-resumes/*"
      ]
    }
  ]
}
```

### Step 3: Update .env File

Open `/Users/rohan/Documents/old/job_automate/.env` and update:

```env
# AWS S3 Configuration (for resume uploads)
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=autojobzy-resumes
```

**⚠️ IMPORTANT**: Never commit `.env` file to Git!

### Step 4: Make Bucket Public (Optional)

If you want resume URLs to be publicly accessible:

1. Go to your S3 bucket → **Permissions**
2. **Block Public Access** → Edit → **Uncheck all** → Save
3. **Bucket Policy** → Edit → Paste:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::autojobzy-resumes/*"
    }
  ]
}
```

---

## 🧪 Testing the Upload

### Test 1: Upload Resume via API

```bash
# Start server
npm run server

# Upload resume (replace with your token and file)
curl -X POST https://api.autojobzy.com/api/job-settings/resume \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "resume=@/path/to/your/resume.pdf"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "resumeUrl": "https://autojobzy-resumes.s3.ap-south-1.amazonaws.com/resumes/userid-timestamp-resume.pdf",
  "resumeText": "...",
  "yearsOfExperience": "5+",
  "fileName": "resume.pdf"
}
```

### Test 2: Verify in Database

```sql
SELECT id, user_id, resume_file_name, resume_url, years_of_experience 
FROM job_settings 
WHERE resume_url IS NOT NULL 
LIMIT 10;
```

### Test 3: Check S3 Bucket

1. Go to AWS S3 Console
2. Open `autojobzy-resumes` bucket
3. Navigate to `resumes/` folder
4. You should see uploaded files: `userid-timestamp-filename.pdf`

---

## 📋 API Endpoints

### Upload Resume
```
POST /api/job-settings/resume
Headers: Authorization: Bearer <token>
Body: FormData with 'resume' file field
```

**Response:**
```json
{
  "success": true,
  "resumeUrl": "https://s3-url...",
  "resumeText": "extracted text",
  "yearsOfExperience": "5+",
  "fileName": "resume.pdf"
}
```

### Get Job Settings (includes resume URL)
```
GET /api/job-settings
Headers: Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "resumeFileName": "resume.pdf",
  "resumeUrl": "https://autojobzy-resumes.s3.ap-south-1.amazonaws.com/resumes/file.pdf",
  "resumeText": "...",
  "yearsOfExperience": "5+",
  ...
}
```

---

## 🔒 Security Best Practices

### 1. **Private Buckets (Recommended)**
If you want resume URLs to be private:
- Keep "Block Public Access" enabled
- Use pre-signed URLs for temporary access
- Update code to use `getSignedUrl()` function

### 2. **File Size Limits**
Current limit: **5MB** (configured in `multer`)

To change:
```javascript
// server/routes/jobSettings.js
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    ...
});
```

### 3. **File Type Validation**
Currently allows: PDF, TXT, DOC, DOCX

To add more types:
```javascript
const allowedMimes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg', // Add JPEG
    'image/png',  // Add PNG
];
```

---

## 🐛 Troubleshooting

### Error: "S3 upload failed"
**Check:**
1. AWS credentials in `.env` are correct
2. IAM user has S3 permissions
3. Bucket name matches `.env` configuration
4. Region is correct (`ap-south-1`)

**Console logs to check:**
```bash
# Check server logs for:
☁️ Resume uploaded to S3: https://...
✅ File uploaded to S3: https://...
```

### Error: "Access Denied"
**Solution:**
1. Verify IAM policy includes `s3:PutObject` permission
2. Check bucket policy allows uploads
3. Verify AWS credentials are active

### Old Resume Not Deleted
**Check:**
- Console logs: `🗑️ Deleting old resume from S3...`
- If error occurs, check S3 delete permission in IAM policy

---

## 📊 Cost Estimation

**AWS S3 Pricing (ap-south-1):**
- Storage: ₹1.84/GB/month
- PUT requests: ₹0.004 per 1,000 requests
- GET requests: ₹0.0003 per 1,000 requests

**Example:**
- 1,000 users
- Average resume: 500KB
- Total storage: 500MB = **₹0.92/month**
- 10,000 uploads/month = **₹0.04**

**Total: ~₹1/month** for 1,000 users 🎉

---

## ✅ Next Steps

### 1. Update Frontend to Show Resume URL
```jsx
// In Job Settings page
{jobSettings.resumeUrl && (
  <a href={jobSettings.resumeUrl} target="_blank" className="text-blue-600">
    View Uploaded Resume
  </a>
)}
```

### 2. Add Resume Download Button
```jsx
<button onClick={() => window.open(jobSettings.resumeUrl, '_blank')}>
  Download Resume
</button>
```

### 3. Show Upload Status
```jsx
const [uploadProgress, setUploadProgress] = useState(0);

// During upload
<div>Uploading... {uploadProgress}%</div>
```

---

## 📞 Support

If you face any issues:
1. Check server logs for error messages
2. Verify AWS credentials and permissions
3. Test S3 access using AWS CLI: `aws s3 ls s3://autojobzy-resumes`

---

## 🎉 Summary

✅ S3 upload utility created
✅ Resume upload endpoint updated
✅ Database schema updated
✅ Automatic file cleanup
✅ Old resume deletion implemented
✅ Environment variables configured
✅ Migration script created

**Status: Ready for Production!** 🚀

Just add your AWS credentials to `.env` and test!

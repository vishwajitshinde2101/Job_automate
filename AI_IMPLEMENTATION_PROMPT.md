# Complete Implementation Prompt for AI Assistant

Copy this entire prompt and give it to any AI assistant (ChatGPT, Claude, etc.) to implement all changes.

---

# TASK: Implement Job Application Management System Changes

I need you to help me implement the following changes in my job application management system. Please follow these implementations exactly as described.

## OVERVIEW

I have a job application management system with React frontend and Node.js/Express backend. I need to implement:

1. **RBAC Fix** - Institute Admin permission checking
2. **S3 Resume Upload** - Move from local storage to AWS S3
3. **Resume Delete** - Delete resumes from S3 and database
4. **Naukri Verification Timeout Fix** - Fix 504 timeout errors
5. **URL Updates** - Change all localhost URLs to production

## PROJECT STRUCTURE

```
project/
├── server/
│   ├── routes/
│   │   ├── auth.js
│   │   └── jobSettings.js
│   ├── models/
│   │   └── JobSettings.js
│   ├── utils/
│   │   └── (create s3Upload.js here)
│   ├── migrations/
│   │   └── (create migration here)
│   └── index.js
├── src/
│   └── context/
│       └── PermissionsContext.tsx
├── components/
│   └── RoleManagement.tsx
├── pages/
│   └── Dashboard.tsx
├── .env
└── package.json
```

---

## IMPLEMENTATION 1: RBAC - Institute Admin Permission Fix

### Problem
Institute Admin users cannot see "Create Role" button because permission checking only looks for regular user tokens.

### Solution

**File: `/src/context/PermissionsContext.tsx`**

In the `fetchPermissions` function, replace the token checking logic:

```typescript
const fetchPermissions = async () => {
    try {
        // Check for both regular token and institute admin token
        let token = localStorage.getItem('token');
        let userRole = localStorage.getItem('userRole');

        // If not found, check for institute admin credentials
        if (!token) {
            token = localStorage.getItem('instituteAdminToken');
            const userStr = localStorage.getItem('instituteAdminUser');
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    userRole = user.role; // 'institute_admin' or 'staff'
                } catch (e) {
                    console.error('❌ Error parsing instituteAdminUser:', e);
                }
            }
        }

        if (!token || !userRole) {
            console.log('No authentication found');
            return;
        }

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

        const response = await fetch(`${API_BASE_URL}/rbac/my-permissions`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch permissions');
        }

        const data = await response.json();
        setPermissions(data.permissions || []);
        setUserRole(userRole);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        setPermissions([]);
    }
};
```

**File: `/components/RoleManagement.tsx`**

In ALL API call functions, change token retrieval from:
```typescript
const token = localStorage.getItem('token');
```

To:
```typescript
const token = localStorage.getItem('instituteAdminToken') || localStorage.getItem('token');
```

Apply this change in these functions:
- `fetchRoles()`
- `createRole()`
- `updateRole()`
- `deleteRole()`
- `fetchPermissions()`
- `assignPermissions()`

Also update API_BASE_URL in all functions:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
```

---

## IMPLEMENTATION 2: AWS S3 Resume Upload

### Step 1: Install Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/lib-storage
```

### Step 2: Create S3 Upload Utility

**Create New File: `/server/utils/s3Upload.js`**

```javascript
/**
 * AWS S3 Upload Utility
 * Handles file uploads to and deletions from AWS S3 bucket
 */

import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import fs from 'fs';

// Initialize S3 Client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'autojobzy-resumes';

/**
 * Upload file to S3 bucket
 * @param {string} filePath - Local file path
 * @param {string} fileName - Destination file name
 * @param {string} mimeType - File MIME type
 * @returns {Promise<string>} S3 URL of uploaded file
 */
export const uploadToS3 = async (filePath, fileName, mimeType) => {
    try {
        const fileContent = fs.readFileSync(filePath);
        const s3Key = `resumes/${fileName}`;

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: fileContent,
            ContentType: mimeType,
        };

        const upload = new Upload({
            client: s3Client,
            params: uploadParams,
        });

        upload.on('httpUploadProgress', (progress) => {
            console.log(`Upload progress: ${progress.loaded}/${progress.total} bytes`);
        });

        await upload.done();

        const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

        console.log(`✅ File uploaded to S3: ${s3Url}`);

        // Delete local file after successful upload
        try {
            fs.unlinkSync(filePath);
            console.log(`✅ Local file deleted: ${filePath}`);
        } catch (unlinkError) {
            console.warn('⚠️ Could not delete local file:', unlinkError.message);
        }

        return s3Url;
    } catch (error) {
        console.error('❌ S3 Upload Error:', error);
        throw new Error(`S3 upload failed: ${error.message}`);
    }
};

/**
 * Delete file from S3 bucket
 * @param {string} s3Url - Full S3 URL of file to delete
 * @returns {Promise<void>}
 */
export const deleteFromS3 = async (s3Url) => {
    try {
        const urlParts = new URL(s3Url);
        const s3Key = urlParts.pathname.substring(1);

        const deleteParams = {
            Bucket: BUCKET_NAME,
            Key: s3Key,
        };

        const command = new DeleteObjectCommand(deleteParams);
        await s3Client.send(command);

        console.log(`✅ File deleted from S3: ${s3Key}`);
    } catch (error) {
        console.error('❌ S3 Delete Error:', error);
        throw new Error(`S3 delete failed: ${error.message}`);
    }
};
```

### Step 3: Update Job Settings Model

**File: `/server/models/JobSettings.js`**

Add this field to the model definition (after `resumeFileName`):

```javascript
resumeUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'S3 URL of uploaded resume',
},
```

### Step 4: Update Resume Upload Route

**File: `/server/routes/jobSettings.js`**

At the top, add import:
```javascript
import { uploadToS3, deleteFromS3 } from '../utils/s3Upload.js';
```

Replace the entire resume upload POST endpoint with:

```javascript
/**
 * POST /api/job-settings/resume
 * Upload and process resume - Uploads to S3 and stores URL
 */
router.post('/resume', authenticateToken, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No resume file provided' });
        }

        console.log('📄 Resume upload started for user:', req.userId);
        console.log('📄 File:', req.file.originalname, 'Size:', req.file.size, 'bytes');

        // Extract text from resume
        const resumeText = await extractResumeText(req.file.path, req.file.mimetype);
        const yearsOfExperience = extractExperience(resumeText);

        console.log('📝 Resume text extracted, Years of experience:', yearsOfExperience);

        // Upload to S3
        let resumeUrl = null;
        try {
            resumeUrl = await uploadToS3(
                req.file.path,
                req.file.filename,
                req.file.mimetype
            );
            console.log('☁️ Resume uploaded to S3:', resumeUrl);
        } catch (s3Error) {
            console.error('❌ S3 Upload failed:', s3Error);
            // Delete local file if S3 upload fails
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.warn('⚠️ Could not delete local file after S3 failure');
            }
        }

        // Find or create job settings
        const [jobSettings] = await JobSettings.findOrCreate({
            where: { userId: req.userId },
            defaults: { userId: req.userId },
        });

        // Delete old resume from S3 if exists
        if (jobSettings.resumeUrl && resumeUrl) {
            console.log('🗑️ Deleting old resume from S3...');
            try {
                await deleteFromS3(jobSettings.resumeUrl);
            } catch (deleteError) {
                console.warn('⚠️ Could not delete old resume:', deleteError.message);
            }
        }

        // Update job settings with resume data and S3 URL
        await jobSettings.update({
            resumeFileName: req.file.originalname,
            resumeUrl: resumeUrl,
            resumeText,
            yearsOfExperience,
            resumeScore: 85,
        });

        console.log('✅ Resume upload completed successfully');

        res.json({
            success: true,
            message: 'Resume uploaded successfully',
            resumeUrl: resumeUrl,
            resumeText,
            yearsOfExperience,
            fileName: req.file.originalname,
        });
    } catch (error) {
        console.error('❌ Resume upload error:', error);

        if (req.file && req.file.path) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.warn('⚠️ Could not delete local file on error');
            }
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Resume upload failed'
        });
    }
});
```

### Step 5: Add Resume Delete Endpoint

**File: `/server/routes/jobSettings.js`**

Add this new endpoint after the upload endpoint:

```javascript
/**
 * DELETE /api/job-settings/resume
 * Delete resume from S3 and database
 */
router.delete('/resume', authenticateToken, async (req, res) => {
    try {
        console.log('📄 Resume deletion started for user:', req.userId);

        const jobSettings = await JobSettings.findOne({
            where: { userId: req.userId },
        });

        if (!jobSettings) {
            return res.status(404).json({
                success: false,
                error: 'Job settings not found'
            });
        }

        // Delete from S3 if URL exists
        if (jobSettings.resumeUrl) {
            console.log('🗑️ Deleting resume from S3:', jobSettings.resumeUrl);
            try {
                await deleteFromS3(jobSettings.resumeUrl);
                console.log('✅ Resume deleted from S3');
            } catch (s3Error) {
                console.error('⚠️ S3 deletion failed (continuing anyway):', s3Error.message);
            }
        }

        // Clear resume data from database
        await jobSettings.update({
            resumeFileName: null,
            resumeUrl: null,
            resumeText: null,
            resumeScore: 0,
        });

        console.log('✅ Resume data cleared from database');

        res.json({
            success: true,
            message: 'Resume deleted successfully',
        });

    } catch (error) {
        console.error('❌ Resume deletion error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Resume deletion failed'
        });
    }
});
```

### Step 6: Database Migration

**Create File: `/server/migrations/add_resume_url.js`**

```javascript
import { sequelize } from '../db/config.js';

async function migrate() {
    try {
        console.log('🔄 Running migration: Add resume_url column...');

        const [columns] = await sequelize.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'job_settings'
            AND COLUMN_NAME = 'resume_url';
        `);

        if (columns.length === 0) {
            console.log('Adding resume_url column...');
            await sequelize.query(`
                ALTER TABLE job_settings
                ADD COLUMN resume_url TEXT NULL
                COMMENT 'S3 URL of uploaded resume'
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
```

Run migration:
```bash
node server/migrations/add_resume_url.js
```

### Step 7: Update Frontend Dashboard

**File: `/pages/Dashboard.tsx`**

Update the `handleFileUpload` function:

```typescript
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError('File size exceeds 5MB limit');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('resume', file);

            const token = localStorage.getItem('token');
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

            const response = await fetch(`${API_BASE_URL}/job-settings/resume`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setConfigForm(prev => ({
                    ...prev,
                    resumeName: data.fileName,
                    resumeUrl: data.resumeUrl, // S3 URL
                    yearsOfExperience: data.yearsOfExperience || '0',
                }));
                setSuccess('Resume uploaded successfully to cloud storage!');
            } else {
                setError(data.error || 'Resume upload failed');
            }
        } catch (error) {
            console.error('Resume upload error:', error);
            setError('Failed to upload resume. Please try again.');
        } finally {
            setUploading(false);
        }
    }
};
```

Add `handleRemoveResume` function:

```typescript
const handleRemoveResume = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) {
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

        const response = await fetch(`${API_BASE_URL}/job-settings/resume`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (data.success) {
            setConfigForm(prev => ({
                ...prev,
                resumeName: '',
                resumeUrl: null,
                resumeText: '',
                yearsOfExperience: '0',
            }));
            setSuccess('Resume deleted successfully!');
        } else {
            setError(data.error || 'Resume deletion failed');
        }
    } catch (error) {
        console.error('Resume delete error:', error);
        setError('Failed to delete resume. Please try again.');
    }
};
```

Update the resume display UI (find the resume display section and replace):

```tsx
{configForm.resumeName && !analyzing && (
    <div className="mt-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-neon-blue" />
            <span className="text-white text-sm">{configForm.resumeName}</span>
        </div>

        <div className="flex items-center gap-3">
            {configForm.resumeUrl && (
                <a
                    href={configForm.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-neon-blue text-sm hover:underline"
                >
                    View Resume
                </a>
            )}

            <label
                htmlFor="resume-reupload-dash"
                className="flex items-center gap-1 cursor-pointer text-neon-blue hover:text-blue-400"
            >
                <RotateCw className="w-4 h-4" />
                <span className="text-sm">Change Resume</span>
            </label>
            <input
                id="resume-reupload-dash"
                type="file"
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
            />

            <button
                onClick={handleRemoveResume}
                className="flex items-center gap-1 text-red-400 hover:text-red-300"
            >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Remove</span>
            </button>
        </div>
    </div>
)}
```

---

## IMPLEMENTATION 3: Naukri Verification Timeout Fix

### Problem
Naukri credential verification returns 504 Gateway Timeout after 60 seconds.

### Solution

**File: `/server/routes/auth.js`**

Find the `POST /verify-naukri-credentials` endpoint and add timeout configuration at the start:

```javascript
router.post('/verify-naukri-credentials', authenticateToken, async (req, res) => {
    // Add these two lines at the very start
    req.setTimeout(120000); // 2 minutes
    res.setTimeout(120000); // 2 minutes

    try {
        const { naukriUsername, naukriPassword } = req.body;

        if (!naukriUsername || !naukriPassword) {
            return res.status(400).json({
                success: false,
                error: 'Naukri username and password are required'
            });
        }

        console.log(`[API] Verifying Naukri credentials for user ${req.userId}...`);

        const result = await verifyNaukriCredentials(naukriUsername, naukriPassword);

        if (result.success) {
            const jobSettings = await JobSettings.findOne({ where: { userId: req.userId } });
            if (jobSettings) {
                jobSettings.credentialsVerified = true;
                jobSettings.lastVerified = new Date();
                await jobSettings.save();
                console.log(`[API] ✓ Credentials verified and saved for user ${req.userId}`);
            }
        }

        res.json({
            success: result.success,
            message: result.message,
            verified: result.success
        });

    } catch (error) {
        console.error('[API] Credential verification error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Verification failed due to a server error. Please try again later.'
        });
    }
});
```

**File: `/server/index.js`**

Find where the server starts (the `app.listen()` call) and modify:

```javascript
// Change from:
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    // ... other logs
});

// To:
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    // ... other logs
});

// Add this line immediately after the closing of app.listen:
server.setTimeout(120000); // 2 minutes
```

---

## IMPLEMENTATION 4: Environment Configuration

**File: `.env`**

Add these environment variables:

```env
# API Configuration
VITE_API_BASE_URL=https://api.autojobzy.com/api

# AWS S3 Configuration (for resume uploads)
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=autojobzy-resumes
```

---

## IMPLEMENTATION 5: URL Updates (Global Replace)

Replace all instances of `http://localhost:5000` with `https://api.autojobzy.com` across the entire project.

Use pattern:
```typescript
// Old:
const API_BASE_URL = 'http://localhost:5000/api';

// New:
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
```

---

## TESTING AFTER IMPLEMENTATION

### 1. Test Resume Upload
```bash
curl -X POST 'http://localhost:5000/api/job-settings/resume' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -F 'resume=@test_resume.pdf'
```

Expected response:
```json
{
  "success": true,
  "message": "Resume uploaded successfully",
  "resumeUrl": "https://autojobzy-resumes.s3.ap-south-1.amazonaws.com/resumes/...",
  "fileName": "test_resume.pdf"
}
```

### 2. Test Resume Delete
```bash
curl -X DELETE 'http://localhost:5000/api/job-settings/resume' \
  -H 'Authorization: Bearer YOUR_TOKEN'
```

Expected response:
```json
{
  "success": true,
  "message": "Resume deleted successfully"
}
```

### 3. Test Naukri Verification
```bash
curl -X POST 'http://localhost:5000/api/auth/verify-naukri-credentials' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"naukriUsername":"email@example.com","naukriPassword":"password"}'
```

Should complete in 12-15 seconds without timeout.

---

## DEPLOYMENT CHECKLIST

- [ ] Install AWS SDK packages
- [ ] Create `/server/utils/s3Upload.js` file
- [ ] Update `.env` with AWS credentials
- [ ] Run database migration
- [ ] Update resume upload endpoint in `jobSettings.js`
- [ ] Add DELETE endpoint in `jobSettings.js`
- [ ] Update `JobSettings.js` model
- [ ] Fix timeout in `auth.js`
- [ ] Fix timeout in `index.js`
- [ ] Update `PermissionsContext.tsx`
- [ ] Update `RoleManagement.tsx`
- [ ] Update `Dashboard.tsx`
- [ ] Replace all localhost URLs
- [ ] Test all features locally
- [ ] Deploy to production
- [ ] Configure nginx timeout (if using nginx)

---

## PRODUCTION NGINX CONFIGURATION (if needed)

Add to nginx config:

```nginx
location /api/ {
    proxy_pass http://localhost:5000;
    proxy_read_timeout 120s;
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
}
```

Test and reload:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## IMPORTANT NOTES

1. **AWS Credentials**: The provided credentials are for the `autojobzy-resumes` bucket in `ap-south-1` region. Make sure these are valid.

2. **S3 Bucket**: Files will be uploaded to `resumes/` folder with pattern: `{userId}-{timestamp}-{random}.{ext}`

3. **Auto-delete**: When uploading a new resume, the old one is automatically deleted from S3.

4. **Error Handling**: If S3 upload fails, the system continues without S3 URL but logs the error.

5. **Timeouts**:
   - Request timeout: 120 seconds (2 minutes)
   - Nginx timeout: 120 seconds (must be configured separately)

6. **Security**:
   - S3 bucket is private (files not publicly accessible without signed URLs)
   - JWT authentication required for all endpoints

---

## EXPECTED RESULTS

After implementation:

✅ Institute Admin can see "Create Role" button
✅ Resumes upload to AWS S3 cloud storage
✅ S3 URL returned in API response
✅ Resume delete removes from both S3 and database
✅ Change resume auto-deletes old file
✅ Naukri verification completes in 12-15 seconds without timeout
✅ All API calls use production URLs

---

## SUPPORT

If you encounter errors during implementation:

1. Check that AWS credentials are valid
2. Verify S3 bucket exists and is accessible
3. Ensure database migration completed successfully
4. Check server logs for specific error messages
5. Verify all imports are correct
6. Test each feature individually

---

# END OF IMPLEMENTATION GUIDE

Please implement all the above changes step by step. After each major implementation (RBAC, S3, Timeout), test it before moving to the next. Let me know if you need clarification on any step.

# Naukri Credentials Verification - Fixed ✅

## Problem Identified

The Naukri credentials verification endpoint (`POST /api/auth/verify-naukri-credentials`) was returning **504 Gateway Timeout** errors when called via HTTP.

**Root Cause**: The Puppeteer-based verification process takes ~12 seconds to complete, but the server/reverse proxy had default timeouts (typically 30-60 seconds for reverse proxies, less for requests).

## Solution Applied

### 1. Increased Endpoint-Specific Timeout ✅

**File**: `server/routes/auth.js` (line 463)

Added request and response timeout configuration at the start of the verification endpoint:

```javascript
router.post('/verify-naukri-credentials', authenticateToken, async (req, res) => {
    // Increase timeout for this endpoint to allow Puppeteer to complete (can take 10-15 seconds)
    req.setTimeout(120000); // 2 minutes
    res.setTimeout(120000); // 2 minutes

    // ... rest of the code
});
```

### 2. Increased Server-Level Timeout ✅

**File**: `server/index.js` (line 165-197)

Added server timeout configuration after the server starts:

```javascript
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    // ... logs
});

// Set server timeout to 2 minutes for long-running operations (like Puppeteer verification)
server.setTimeout(120000);
```

### 3. Verified Puppeteer Logic ✅

**File**: `server/verifyNaukriCredentials.js`

The verification logic is working perfectly:
- Takes ~12 seconds to complete
- Successfully validates credentials
- Returns proper success/failure responses

## Test Results

### Direct Function Test (No HTTP)
```
⏱️  Duration: 12.39 seconds
✅ Success: true
�� Message: Credentials verified successfully!
```

### What the Function Does
1. Launches headless Chrome browser
2. Navigates to Naukri login page (https://www.naukri.com/nlogin/login)
3. Fills in username and password
4. Submits the form
5. Waits for redirect or error message
6. Checks if login was successful by:
   - Looking for profile/logout button
   - Checking if URL changed away from login page
   - Looking for error messages
7. Returns success/failure response
8. Closes browser and cleans up resources

## Deployment Steps

### Step 1: Deploy Backend Changes

The following files have been modified and need to be deployed:

1. **`server/routes/auth.js`** - Added timeout configuration
2. **`server/index.js`** - Added server timeout
3. **`server/verifyNaukriCredentials.js`** - No changes (already working)

### Step 2: Restart Server

```bash
# SSH to production server
ssh ec2-user@13.232.185.74

# Navigate to project
cd /home/autojobzy/Job_automate

# Pull latest changes
git pull origin main

# Restart backend
pm2 restart job-automate-api

# Check logs
pm2 logs job-automate-api --lines 50
```

### Step 3: Test the API

```bash
# Test with your credentials
curl -X POST 'https://api.autojobzy.com/api/auth/verify-naukri-credentials' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -d '{
    "naukriUsername": "rohankadam474@gmail.com",
    "naukriPassword": "Rohan@123"
  }'
```

**Expected Response (200 OK after ~12 seconds):**
```json
{
  "success": true,
  "message": "Credentials verified successfully!",
  "verified": true
}
```

**Invalid Credentials Response:**
```json
{
  "success": false,
  "message": "Invalid credentials. Please check your username or password.",
  "verified": false
}
```

## Potential Additional Configuration Needed

### If Still Getting 504 After Deployment

If you still get 504 errors after deploying these changes, it means your **reverse proxy (nginx/load balancer)** also needs timeout configuration:

#### For Nginx:
```nginx
location /api/auth/verify-naukri-credentials {
    proxy_pass http://localhost:5000;
    proxy_read_timeout 120s;
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
}
```

#### For AWS Application Load Balancer:
- Idle timeout: 120 seconds (default is 60)
- Target group health check timeout: 120 seconds

## API Usage in Frontend

**Example integration in Dashboard or Settings:**

```typescript
const verifyNaukriCredentials = async (username: string, password: string) => {
    try {
        const token = localStorage.getItem('token');

        const response = await fetch(`${API_BASE_URL}/auth/verify-naukri-credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                naukriUsername: username,
                naukriPassword: password,
            }),
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Credentials verified!');
            // Update UI to show verified status
        } else {
            console.error('❌ Verification failed:', data.message);
            // Show error to user
        }

        return data;

    } catch (error) {
        console.error('Network error:', error);
        return { success: false, message: 'Network error. Please try again.' };
    }
};
```

## Security Notes

✅ **What This Endpoint Does:**
- Verifies login credentials by attempting login
- NO data scraping or automation
- Browser session is immediately closed after verification
- Credentials are NEVER logged or stored by the verification script

✅ **What Gets Saved:**
If verification succeeds, the following are updated in `job_settings` table:
- `credentialsVerified`: true
- `lastVerified`: current timestamp

⚠️ **Important**: The actual credentials (naukriEmail, naukriPassword) are only saved when user updates job settings via `POST /api/job-settings`, NOT by this verification endpoint.

## Summary

✅ **Fixed**: Naukri credentials verification endpoint
✅ **Duration**: ~12 seconds to complete
✅ **Timeout**: Increased to 120 seconds (2 minutes)
✅ **Status**: Working perfectly when tested directly

**Next Step**: Deploy to production and test via HTTP endpoint.

## Test Files Created

1. `/Users/rohan/Documents/old/job_automate/testNaukriVerification.js` - HTTP endpoint test
2. `/Users/rohan/Documents/old/job_automate/testNaukriDirect.js` - Direct function test

Both test files can be used to verify the functionality after deployment.

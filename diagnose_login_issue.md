# Login Endpoint Timeout - Diagnosis & Fix

## Problem
Login endpoint (`POST /api/auth/login`) timing out after 30 seconds with no response.

## Evidence
```bash
curl -X POST 'https://api.autojobzy.com/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"mahadev@gmail.com","password":"123456"}'

# Result: Timeout after 30 seconds, 0 bytes received
```

## Possible Causes

### 1. Database Connection Issue ⚠️
Login endpoint queries database to check user credentials.
- Database might be slow or hanging
- Connection pool exhausted
- Network issues between server and database

### 2. Bcrypt Password Comparison Hanging 🔐
Password hashing comparison can be CPU intensive.
- May be blocking event loop
- Could be using wrong bcrypt rounds

### 3. Missing Timeout on Login Route ⏱️
Unlike Naukri verification, login route may not have timeout configured.

### 4. Infinite Loop or Deadlock 🔄
Some code in login logic might be stuck.

## Quick Checks

### Check 1: Server Running?
```bash
ssh ec2-user@13.232.185.74
pm2 status
pm2 logs job-automate-api --lines 100 | grep -i "login\|error"
```

### Check 2: Database Connection
```bash
# On server
pm2 logs job-automate-api --lines 50 | grep -i "database\|mysql"
```

### Check 3: Recent Logs
```bash
pm2 logs job-automate-api --lines 200
```

## Solutions

### Solution 1: Add Timeout to Login Route

**File**: `server/routes/auth.js`

Find the login route and add timeout:

```javascript
router.post('/login', async (req, res) => {
    // Add timeout configuration
    req.setTimeout(30000); // 30 seconds
    res.setTimeout(30000);

    try {
        const { email, password } = req.body;

        // ... rest of login logic
    } catch (error) {
        // ... error handling
    }
});
```

### Solution 2: Check Database Connection

**File**: `server/db/config.js`

Ensure database has connection timeout:

```javascript
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: 'mysql',
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,  // Maximum time to get connection
        idle: 10000      // Maximum idle time
    },
    dialectOptions: {
        connectTimeout: 10000  // Connection timeout
    }
});
```

### Solution 3: Optimize Password Comparison

**File**: `server/models/User.js`

Ensure bcrypt comparison has reasonable rounds:

```javascript
// When hashing (during signup)
const hashedPassword = await bcrypt.hash(password, 10); // 10 rounds is standard

// When comparing (during login)
const isValid = await bcrypt.compare(plainPassword, hashedPassword);
```

## Immediate Action Required

1. **SSH to server and check logs**
```bash
ssh ec2-user@13.232.185.74
pm2 logs job-automate-api --lines 200
```

2. **Look for login attempts in logs**
```bash
pm2 logs job-automate-api | grep -i "login"
```

3. **Check database connection**
```bash
pm2 logs job-automate-api | grep -i "database\|mysql\|connection"
```

4. **Restart server if needed**
```bash
pm2 restart job-automate-api
pm2 logs --lines 50
```

## Expected Behavior

Login should:
1. Receive request
2. Query database for user (< 1 second)
3. Compare password with bcrypt (< 2 seconds)
4. Generate JWT token (< 1 second)
5. Return response (total < 5 seconds)

## Test After Fix

```bash
curl -X POST 'https://api.autojobzy.com/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"mahadev@gmail.com","password":"123456"}' \
  --max-time 10

# Expected: 200 OK with JWT token in ~1-2 seconds
```

## Production Logs to Check

From the earlier logs, we saw Naukri verification working:
```
[LOGIN] Attempt for email: mahadev@gmail.com
[LOGIN] User found. Comparing password...
[USER MODEL] comparePassword: Comparing for user: mahadev@gmail.com
[USER MODEL] comparePassword: Result: true
[LOGIN] Login successful for: mahadev@gmail.com
```

This means login WAS working before. Something changed.

## Next Steps

1. Check server logs for errors
2. Verify database connectivity
3. Add timeout to login route
4. Restart server if needed
5. Test again

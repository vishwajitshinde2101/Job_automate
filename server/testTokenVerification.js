/**
 * Test JWT Token Verification
 * This script helps diagnose JWT token issues
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// The token from your curl request
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzZmQyYzIyMy1jNTEzLTQxZDgtOTlhOC02NzE5ZWNiZjU0YmMiLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTc2ODE0OTM0MCwiZXhwIjoxNzcwNzQxMzQwfQ.MygMntjG6LPFcr4W_U6PhQOMrztkkSJS0H1pc_xepSA';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';

console.log('\n=== JWT Token Verification Test ===\n');
console.log('JWT_SECRET being used:', JWT_SECRET.substring(0, 20) + '...');
console.log('');

try {
    // Try to verify the token
    const decoded = jwt.verify(testToken, JWT_SECRET);
    console.log('✅ Token is VALID!');
    console.log('');
    console.log('Decoded token:', JSON.stringify(decoded, null, 2));
    console.log('');

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = decoded.exp - now;
    const daysLeft = Math.floor(expiresIn / 86400);

    console.log('Token Status:');
    console.log('  - Issued at:', new Date(decoded.iat * 1000).toISOString());
    console.log('  - Expires at:', new Date(decoded.exp * 1000).toISOString());
    console.log('  - Time remaining:', daysLeft, 'days');

} catch (error) {
    console.log('❌ Token is INVALID!');
    console.log('');
    console.log('Error:', error.message);
    console.log('');

    if (error.name === 'JsonWebTokenError') {
        console.log('🔍 DIAGNOSIS:');
        console.log('  The JWT_SECRET used to create this token is DIFFERENT');
        console.log('  from the JWT_SECRET in your current environment.');
        console.log('');
        console.log('💡 SOLUTION:');
        console.log('  1. Make sure your production server has the correct JWT_SECRET');
        console.log('  2. Restart your production server');
        console.log('  3. Login again to get a new token');
    } else if (error.name === 'TokenExpiredError') {
        console.log('🔍 DIAGNOSIS:');
        console.log('  The token has expired.');
        console.log('');
        console.log('💡 SOLUTION:');
        console.log('  Login again to get a new token');
    }
}

console.log('');
console.log('='.repeat(50));
console.log('');

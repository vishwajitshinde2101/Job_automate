/**
 * Test the new token from localhost
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// New token from localhost
const localhostToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzZmQyYzIyMy1jNTEzLTQxZDgtOTlhOC02NzE5ZWNiZjU0YmMiLCJyb2xlIjoic3VwZXJhZG1pbiIsImlhdCI6MTc2ODE1MjcyNSwiZXhwIjoxNzcwNzQ0NzI1fQ.lWFoaXCYpVP-Fc2jHv8vvtdjeiOSIo-xCEe0PFI8Q4c';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';

console.log('\n=== Testing Localhost Token ===\n');

try {
    const decoded = jwt.verify(localhostToken, JWT_SECRET);
    console.log('✅ Token is VALID with local JWT_SECRET!');
    console.log('\nDecoded:', JSON.stringify(decoded, null, 2));
    console.log('\n✅ This confirms:');
    console.log('  - Localhost is using JWT_SECRET:', JWT_SECRET.substring(0, 30) + '...');
    console.log('  - Production server is using a DIFFERENT JWT_SECRET');
    console.log('\n💡 SOLUTION:');
    console.log('  You need to login directly to production:');
    console.log('  https://api.autojobzy.com/api/auth/login');
    console.log('  (Not localhost!)');
} catch (error) {
    console.log('❌ Token is INVALID');
    console.log('Error:', error.message);
}

console.log('\n' + '='.repeat(60));
console.log('');

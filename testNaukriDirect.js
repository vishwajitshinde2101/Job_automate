/**
 * Direct Test of Naukri Credentials Verification (No HTTP)
 * Tests the Puppeteer function directly to isolate timeout issues
 */

import dotenv from 'dotenv';
import { verifyNaukriCredentials } from './server/verifyNaukriCredentials.js';

dotenv.config();

async function testDirect() {
    console.log('\n🧪 Testing Naukri Verification DIRECTLY (no HTTP)...\n');
    console.log('⏱️  This may take 30-60 seconds...\n');

    const startTime = Date.now();

    try {
        const result = await verifyNaukriCredentials(
            'rohankadam474@gmail.com',
            'Rohan@123'
        );

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log('\n📊 Results:');
        console.log('⏱️  Duration:', duration, 'seconds');
        console.log('✅ Success:', result.success);
        console.log('💬 Message:', result.message);
        console.log();

        if (result.success) {
            console.log('✅ VERIFICATION SUCCESSFUL!');
            console.log('   The credentials are valid.');
        } else {
            console.log('❌ VERIFICATION FAILED');
            console.log('   Reason:', result.message);
        }

    } catch (error) {
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.error('\n❌ Error after', duration, 'seconds:', error.message);
        console.error('Stack:', error.stack);
    }
}

testDirect();

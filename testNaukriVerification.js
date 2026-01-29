/**
 * Test Naukri Credentials Verification API
 */

import dotenv from 'dotenv';
dotenv.config();

const API_URL = process.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJkMDBlMDIzZS1jY2M3LTRkZjktYjg1Mi1mNWEwYTBjNDkwODUiLCJyb2xlIjoidXNlciIsImlhdCI6MTc2OTY4NDM1MCwiZXhwIjoxNzcyMjc2MzUwfQ.U0VAjZlE9oIb3_0-n2P5wHEfx2CKCxLbSwFL0QIhGXY';

async function testVerification() {
    console.log('\n🧪 Testing Naukri Credentials Verification...\n');

    try {
        console.log('📍 API URL:', `${API_URL}/auth/verify-naukri-credentials`);
        console.log('🔑 Using provided token');
        console.log('📧 Username: rohankadam474@gmail.com');
        console.log();

        const response = await fetch(`${API_URL}/auth/verify-naukri-credentials`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                naukriUsername: 'rohankadam474@gmail.com',
                naukriPassword: 'Rohan@123'
            })
        });

        console.log('📊 Response Status:', response.status, response.statusText);
        console.log();

        const data = await response.json();
        console.log('📦 Response Data:', JSON.stringify(data, null, 2));
        console.log();

        if (data.success) {
            console.log('✅ Verification SUCCESSFUL!');
            console.log('✅ Message:', data.message);
        } else {
            console.log('❌ Verification FAILED');
            console.log('❌ Error:', data.error || data.message);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);

        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
            console.log('\n📝 Server might be down or not accessible');
            console.log('   Check if server is running at:', API_URL);
        }
    }
}

testVerification();

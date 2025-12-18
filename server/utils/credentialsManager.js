/**
 * ======================== CREDENTIALS MANAGER ========================
 * Utility to fetch and store Naukri credentials from system keychain.
 * Falls back to environment variables if keychain is unavailable.
 * Production-ready secure credential management.
 */

import keytar from 'keytar';
import dotenv from 'dotenv';

dotenv.config();

const SERVICE_NAME = 'jobautomate-naukri';

/**
 * Get credentials from system keychain or environment variables
 * @returns {Promise<{email: string, password: string}>}
 */
export async function getCredentials() {
    try {
        // First try to get from system keychain (most secure)
        const email = await keytar.getPassword(SERVICE_NAME, 'naukri_email');
        const password = await keytar.getPassword(SERVICE_NAME, 'naukri_password');

        if (email && password) {
            console.log('✅ Credentials loaded from system keychain');
            return { email, password };
        }

        // Fallback to environment variables
        const envEmail = process.env.NAUKRI_EMAIL;
        const envPassword = process.env.NAUKRI_PASSWORD;

        if (envEmail && envPassword) {
            console.log('⚠️  Using credentials from environment variables (less secure)');
            return { email: envEmail, password: envPassword };
        }

        throw new Error('No Naukri credentials found. Please set up credentials first.');
    } catch (error) {
        console.error('❌ Error fetching credentials:', error.message);
        throw error;
    }
}

/**
 * Save credentials to system keychain
 * @param {string} email - Naukri email/username
 * @param {string} password - Naukri password
 */
export async function saveCredentials(email, password) {
    try {
        await keytar.setPassword(SERVICE_NAME, 'naukri_email', email);
        await keytar.setPassword(SERVICE_NAME, 'naukri_password', password);
        console.log('✅ Credentials saved securely to system keychain');
    } catch (error) {
        console.warn('⚠️  Could not save to keychain, ensure credentials are in .env:', error.message);
    }
}

/**
 * Clear saved credentials from keychain
 */
export async function clearCredentials() {
    try {
        await keytar.deletePassword(SERVICE_NAME, 'naukri_email');
        await keytar.deletePassword(SERVICE_NAME, 'naukri_password');
        console.log('✅ Credentials cleared from system keychain');
    } catch (error) {
        console.warn('⚠️  Error clearing credentials:', error.message);
    }
}

/**
 * Check if credentials are available
 */
export async function hasCredentials() {
    try {
        const email = await keytar.getPassword(SERVICE_NAME, 'naukri_email');
        return !!email || !!(process.env.NAUKRI_EMAIL && process.env.NAUKRI_PASSWORD);
    } catch {
        return !!(process.env.NAUKRI_EMAIL && process.env.NAUKRI_PASSWORD);
    }
}

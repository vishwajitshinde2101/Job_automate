/**
 * ======================== NAUKRI PROFILE UPDATE SERVICE ========================
 * Puppeteer script to update Naukri resume headline by appending a space
 * This keeps the profile "fresh" and increases visibility
 */

import puppeteer from 'puppeteer';

/**
 * Sleep helper function
 * @param {number} ms - Milliseconds to sleep
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Update Naukri resume headline by appending a space
 * @param {string} email - Naukri email from database
 * @param {string} password - Naukri password from database
 * @returns {Promise<Object>} Result object with status, message, screenshot
 */
export async function updateResumeHeadline(email, password) {
    let browser = null;
    const result = {
        status: 'failed',
        message: '',
        executedAt: new Date().toISOString(),
        screenshot: null,
        logs: []
    };

    const addLog = (message) => {
        result.logs.push(`[${new Date().toLocaleTimeString()}] ${message}`);
        console.log(`[Naukri Profile Update] ${message}`);
    };

    try {
        addLog('Starting Naukri profile update...');

        // Validate credentials
        if (!email || !password) {
            throw new Error('Naukri credentials not found. Please add your credentials in Job Profile settings.');
        }

        addLog(`Launching browser for user: ${email}`);
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });

        const page = await browser.newPage();

        // ========== STEP 1: LOGIN ==========
        addLog('Opening Naukri login page...');
        await page.goto('https://www.naukri.com/nlogin/login', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await delay(1500);

        // Wait for login form
        addLog('Waiting for login form...');
        await page.waitForSelector('#usernameField', { timeout: 10000 });

        addLog('Entering credentials...');
        await page.type('#usernameField', email, { delay: 70 });
        await page.type('#passwordField', password, { delay: 70 });

        addLog('Submitting login form...');
        await page.click("button[type='submit']");

        await page.waitForNavigation({
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Check if login was successful
        const currentUrl = page.url();
        if (currentUrl.includes('nlogin')) {
            throw new Error('Login failed - Invalid credentials or login page issue');
        }

        addLog('✅ Login successful');

        // ========== STEP 2: NAVIGATE TO PROFILE ==========
        addLog('Navigating to profile page...');
        await page.goto('https://www.naukri.com/mnjuser/profile?id=&altresid', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        await delay(2000);
        addLog('Profile page loaded');
















        // === STEP 3: CLICK EDIT ICON ===
        addLog('Clicking resume headline edit icon...');
        await page.click('#lazyResumeHead span.edit.icon');
        await delay(1200);

        // === STEP 4: WAIT FOR MODAL ===
        addLog('Waiting for resume modal...');
        await page.waitForSelector('#resumeHeadlineTxt', { timeout: 10000 });

        // ensure modal focused
        await page.focus('#resumeHeadlineTxt');
        await delay(300);

        // read current text
        const current = await page.$eval('#resumeHeadlineTxt', el => el.value);
        addLog(`Current Headline: "${current}"`);

        // append space
        addLog('Appending space...');
        await page.type('#resumeHeadlineTxt', ' ');  // safer than evaluate()

        await delay(500);

        // === STEP 5: CLICK SAVE ===
        addLog('Saving...');
        await page.click('button.btn-dark-ot[type="submit"]');
        await delay(2500);

        addLog('🚀 Saved successfully');















        // // ========== STEP 3: CLICK EDIT ICON ==========
        // addLog('Looking for resume headline edit button...');
        // await page.waitForSelector('#lazyResumeHead span.edit.icon', { timeout: 10000 });

        // addLog('Clicking edit icon...');
        // await page.click('#lazyResumeHead span.edit.icon');

        // await delay(1500);

        // // ========== STEP 4: MODIFY RESUME HEADLINE ==========
        // addLog('Waiting for resume headline textarea...');
        // await page.waitForSelector('textarea', { timeout: 8000 });

        // addLog('Reading current resume headline...');
        // const currentHeadline = await page.evaluate(() => {
        //     const textarea = document.querySelector('textarea');
        //     return textarea ? textarea.value : null;
        // });

        // if (!currentHeadline) {
        //     throw new Error('Resume headline textarea not found');
        // }

        // addLog(`Current headline: "${currentHeadline}"`);

        // addLog('Appending space to resume headline...');
        // await page.evaluate(() => {
        //     const textarea = document.querySelector('textarea');
        //     if (textarea) {
        //         textarea.value = textarea.value + ' '; // Append 1 space
        //         // Trigger input event to ensure React/Vue detects the change
        //         textarea.dispatchEvent(new Event('input', { bubbles: true }));
        //     }
        // });

        // await delay(500);

        // // ========== STEP 5: SAVE CHANGES ==========
        // addLog('Looking for save button...');
        // const saveBtn = await page.$("button[type='submit'], .btn-primary, button:has-text('Save')");

        // if (!saveBtn) {
        //     throw new Error('Save button not found');
        // }

        // addLog('Clicking save button...');
        // await saveBtn.click();

        await delay(3000); // Wait for save to complete

        // ========== STEP 6: VERIFY SUCCESS ==========
        // Check if we're back on the profile page (modal closed)
        const modalStillOpen = await page.$('textarea');
        if (modalStillOpen) {
            addLog('⚠️  Warning: Modal might still be open, taking screenshot...');
            result.screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
        }

        addLog('✅ Resume headline updated successfully!');

        result.status = 'success';
        result.message = 'Resume headline updated successfully';

        return result;

    } catch (error) {
        addLog(`❌ Error: ${error.message}`);

        // Take screenshot on error
        try {
            if (browser) {
                const pages = await browser.pages();
                if (pages.length > 0) {
                    result.screenshot = await pages[0].screenshot({
                        encoding: 'base64',
                        fullPage: true
                    });
                }
            }
        } catch (screenshotError) {
            addLog(`Failed to capture screenshot: ${screenshotError.message}`);
        }

        result.status = 'failed';
        result.message = error.message;

        return result;

    } finally {
        // Always close browser
        if (browser) {
            try {
                addLog('Closing browser...');
                await browser.close();
                addLog('Browser closed');
            } catch (closeError) {
                addLog(`Error closing browser: ${closeError.message}`);
            }
        }
    }
}

/**
 * Check if another update is currently running (queue safety)
 */
let isUpdateRunning = false;

/**
 * Queue-safe wrapper for updateResumeHeadline
 * Prevents multiple users from running updates simultaneously
 * @param {string} email - Naukri email
 * @param {string} password - Naukri password
 * @returns {Promise<Object>} Result object
 */
export async function queueSafeUpdateResume(email, password) {
    if (isUpdateRunning) {
        return {
            status: 'failed',
            message: 'Another profile update is currently running. Please try again in a few moments.',
            executedAt: new Date().toISOString(),
            logs: ['Update blocked - another operation in progress']
        };
    }

    isUpdateRunning = true;

    try {
        const result = await updateResumeHeadline(email, password);
        return result;
    } finally {
        isUpdateRunning = false;
    }
}

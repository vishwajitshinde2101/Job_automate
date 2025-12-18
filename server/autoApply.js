
/**
 * ======================== AUTO APPLY MODULE ========================
 * Main automation script for applying to jobs on Naukri.
 * Fetches credentials from database (job_settings table).
 * Handles login, job filtering, form filling, and chatbot interactions.
 *
 * Uses OLD login selectors:
 *   #usernameField
 *   #passwordField
 */

import puppeteer from 'puppeteer';
import { getAnswer } from './aiAnswer.js';
import sequelize from './db/config.js';
import XLSX from 'xlsx';

// State management for automation
let isRunning = false;
let automationLogs = [];
let browser = null;
let jobResults = [];

/**
 * Add log message with timestamp
 * @param {string} message - Log message
 * @param {string} type - Log type: 'info', 'success', 'error', 'warning'
 */
function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const log = { timestamp, message, type };
    automationLogs.push(log);
    // keep console logs simple for debugging
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
    return log;
}

/**
 * Sleep helper function
 * @param {number} ms - Milliseconds to sleep
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch Naukri credentials from job_settings table
 * @param {string} userId - User ID
 * @returns {Promise<{email: string, password: string}>} Credentials from database
 */
async function fetchCredentialsFromDB(userId) {
    try {
        addLog(`Fetching credentials for user: ${userId}`, 'info');

        const [results] = await sequelize.query(
            'SELECT naukri_email, naukri_password FROM job_settings WHERE user_id = ? LIMIT 1',
            { replacements: [userId] }
        );

        if (!results || results.length === 0) {
            throw new Error('No job settings found for this user');
        }

        const result = results[0];

        if (!result.naukri_email || !result.naukri_password) {
            throw new Error('Naukri credentials not found in job_settings table. Please save your credentials first.');
        }

        addLog('Credentials fetched from database successfully', 'success');
        return {
            email: result.naukri_email,
            password: result.naukri_password,
        };
    } catch (error) {
        addLog(`Database credential fetch error: ${error.message}`, 'error');
        throw error;
    }
}

/**
 * Auto-scroll page to load lazy-loaded content
 * @param {puppeteer.Page} page - Puppeteer page instance
 */
async function autoScroll(page) {
    await page.evaluate(() => {
        return new Promise(resolve => {
            let totalHeight = 0;
            const distance = 400;
            const timer = setInterval(() => {
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 300);
        });
    });
}

/**
 * Handle checkbox questions in chatbot
 * @param {puppeteer.Page} page - Puppeteer page instance
 * @returns {Promise<boolean>} Whether checkbox was handled
 */
async function handleCheckBox(page) {
    try {
        const checkboxSelector = ".checkBoxContainer input[type='radio'], .checkBoxContainer input[type='checkbox']";

        const checkboxes = await page.$$(checkboxSelector);
        if (!checkboxes || checkboxes.length === 0) {
            return false;
        }

        addLog(`Found ${checkboxes.length} checkbox options`, 'info');
        await checkboxes[0].click();
        await delay(500);

        return true;
    } catch (err) {
        addLog(`Checkbox handler error: ${err.message}`, 'warning');
        return false;
    }
}

/**
 * Login to Naukri using old selectors (#usernameField, #passwordField)
 * @param {puppeteer.Page} page - Puppeteer page instance
 * @param {string} email - Naukri email
 * @param {string} password - Naukri password
 */
async function loginToNaukri(page, email, password) {
    try {
        addLog('Opening Naukri login page...', 'info');
        await page.goto('https://www.naukri.com/nlogin/login', { waitUntil: 'networkidle2' });
        await delay(3000);

        addLog('Locating login fields (OLD selectors)...', 'info');

        const emailSelector = '#usernameField';
        const passSelector = '#passwordField';
        const submitSelector = "button[type='submit']";

        // Wait for username field
        try {
            await page.waitForSelector(emailSelector, { timeout: 10000 });
        } catch (e) {
            addLog('❌ Could not find username field on login page', 'error');
            return false;
        }

        // Wait for password field
        try {
            await page.waitForSelector(passSelector, { timeout: 8000 });
        } catch (e) {
            addLog('❌ Could not find password field on login page', 'error');
            return false;
        }

        addLog('Entering credentials...', 'info');

        await page.click(emailSelector, { clickCount: 3 }).catch(() => { });
        await page.type(emailSelector, email, { delay: 80 });

        await page.click(passSelector, { clickCount: 3 }).catch(() => { });
        await page.type(passSelector, password, { delay: 80 });

        addLog('Submitting login form...', 'info');
        // try clicking submit; some pages may require pressing Enter
        const submitBtn = await page.$(submitSelector);
        if (submitBtn) {
            await submitBtn.click();
        } else {
            // fallback: press Enter on password field
            await page.keyboard.press('Enter');
        }

        await delay(6000);

        // Basic check: if still on login page -> fail
        const currentUrl = page.url();
        if (currentUrl.includes('nlogin')) {
            addLog('Login failed - still on login page', 'error');
            return false;
        }

        addLog('Login successful!', 'success');
        return true;
    } catch (error) {
        addLog(`Login error: ${error.message}`, 'error');
        return false;
    }
}

/**
 * Handle chatbot questions and provide AI-generated answers
 * @param {puppeteer.Page} jobPage - Puppeteer page instance
 */
async function handleChatbot(jobPage) {
    try {
        await jobPage.waitForSelector('.chatbot_MessageContainer', { timeout: 5000 });

        const answered = new Set();
        const maxPolls = 20;

        for (let j = 0; j < maxPolls; j++) {
            const questions = await jobPage.$$eval('.botItem .botMsg span', spans =>
                spans.map(s => s.innerText.trim()).filter(Boolean)
            );

            for (let q of questions) {
                if (answered.has(q)) continue;
                answered.add(q);

                addLog(`Question: ${q}`, 'info');

                // First try handling checkbox
                const checkboxHandled = await handleCheckBox(jobPage);
                if (checkboxHandled) {
                    addLog('Checkbox question auto-answered', 'success');
                    const nextBtn = await jobPage.$('.sendMsg');
                    if (nextBtn) await nextBtn.click();
                    continue;
                }

                // AI-generated text answer
                const aiAnswer = await getAnswer(q);
                addLog(`AI Answer: ${aiAnswer}`, 'success');

                const inputSelector = ".textArea[contenteditable='true']";

                // ensure input exists
                const exists = await jobPage.$(inputSelector);
                if (!exists) {
                    addLog('Chat input not found, skipping this question', 'warning');
                    continue;
                }

                await jobPage.focus(inputSelector);

                await jobPage.evaluate((sel, answer) => {
                    const el = document.querySelector(sel);
                    if (el) {
                        // Some chat inputs use innerText, some use innerHTML; innerText is usually fine
                        el.innerText = answer;
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }, inputSelector, aiAnswer);

                const sendBtn = await jobPage.$('.sendMsg');
                if (sendBtn) await sendBtn.click();

                await delay(1200);
            }

            await delay(1500);
        }

        addLog('Chatbot answers completed!', 'success');
    } catch (err) {
        addLog(`Error in chatbot auto-answer: ${err.message}`, 'warning');
    }
}

/**
 * Save results to Excel file
 */
function saveToExcel() {
    try {
        const ws = XLSX.utils.json_to_sheet(jobResults);
        const wb = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(wb, ws, 'Naukri Results');
        XLSX.writeFile(wb, 'naukri_results.xlsx');

        addLog('Excel Saved: naukri_results.xlsx', 'success');
    } catch (err) {
        addLog(`Error saving Excel: ${err.message}`, 'error');
    }
}

/**
 * Main automation function
 * @param {Object} options - Configuration options
 * @param {string} options.userId - User ID (required for DB credential lookup)
 * @param {string} options.jobUrl - URL of filtered job listings page
 * @param {number} options.maxPages - Maximum pages to process (default: 10)
 * @param {string} options.naukriEmail - Optional email (overrides DB)
 * @param {string} options.naukriPassword - Optional password (overrides DB)
 */
export async function startAutomation(options = {}) {
    if (isRunning) {
        addLog('Automation already running', 'warning');
        return { success: false, message: 'Already running' };
    }

    isRunning = true;
    automationLogs = [];
    jobResults = [];

    const {
        userId = null,
        jobUrl = null,
        maxPages = 10,
        naukriEmail = null,
        naukriPassword = null,
    } = options;

    try {
        // ========== STEP 1: GET CREDENTIALS ==========
        let email = naukriEmail;
        let password = naukriPassword;

        // If credentials not provided directly, fetch from database
        if ((!email || !password) && userId) {
            addLog('Fetching credentials from database...', 'info');
            const dbCredentials = await fetchCredentialsFromDB(userId);
            email = dbCredentials.email;
            password = dbCredentials.password;
        }

        // Validate credentials
        if (!email || !password) {
            throw new Error('No Naukri credentials found. Please save your credentials in the Config tab first.');
        }

        addLog(`Using Naukri account: ${email}`, 'info');

        // ========== STEP 1.5: GET JOB URL FROM DATABASE ==========
        let finalJobUrl = jobUrl;

        if (!finalJobUrl && userId) {
            finalJobUrl = await fetchFinalUrlFromDB(userId);

            if (finalJobUrl) {
                addLog(`Using DB URL: ${finalJobUrl}`, "success");
            } else {
                addLog(`DB URL missing. Using default.`, "warning");
                finalJobUrl = "https://www.naukri.com/java-full-stack-developer-jobs?k=java+full+stack+developer";
            }
        }



        async function fetchFinalUrlFromDB(userId) {
            try {
                const [rows] = await sequelize.query(
                    `SELECT final_url 
             FROM user_filters 
             WHERE user_id = :userId
             LIMIT 1`,
                    { replacements: { userId } }
                );

                if (!rows || rows.length === 0) {
                    console.log("No row found for userId:", userId);
                    return null;
                }

                const url = rows.final_url || rows[0].final_url;

                if (!url || url.trim() === "") {
                    console.log("final_url is empty for user:", userId);
                    return null;
                }

                return url.trim();
            } catch (err) {
                console.error("DB fetch error:", err);
                return null;
            }
        }



        // Use default URL if still not found
        if (!finalJobUrl) {
            finalJobUrl = 'https://www.naukri.com/java-full-stack-developer-jobs?k=java+full+stack+developer&experience=3&jobAge=1';
            addLog(`Using default job URL: ${finalJobUrl}`, 'warning');
        }

        // ========== STEP 2: LAUNCH BROWSER ==========
        addLog('Launching browser...', 'info');
        browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ['--start-maximized']
        });

        const page = await browser.newPage();

        // ========== STEP 3: LOGIN ==========
        const loginSuccess = await loginToNaukri(page, email, password);
        if (!loginSuccess) {
            throw new Error('Login failed. Please check your credentials and page selectors.');
        }

        // ========== STEP 4: PROCESS JOB PAGES ==========
        // Use the finalJobUrl directly without modification
        let currentPage = 1;
        let totalJobsApplied = 0;

        while (currentPage <= maxPages && isRunning) {
            // For first page, use URL as-is. For subsequent pages, append page parameter
            let pageUrl = finalJobUrl;
            if (currentPage > 1) {
                // Add or update page parameter in URL
                const urlObj = new URL(finalJobUrl);
                urlObj.searchParams.set('pageNo', currentPage.toString());
                pageUrl = urlObj.toString();
            }

            addLog(`Opening Page ${currentPage}/${maxPages}: ${pageUrl}`, 'info');
            await page.goto(pageUrl, { waitUntil: 'networkidle2' });
            await delay(4000);

            await autoScroll(page);
            await delay(1500);

            const jobLinks = await page.$$eval('a.title', links =>
                links.map(a => a.href).filter(x => typeof x === 'string' && x.includes('job-listings'))
            );

            addLog(`Found ${jobLinks.length} jobs on page ${currentPage}`, 'info');

            // Process each job
            for (let i = 0; i < jobLinks.length && isRunning; i++) {
                const link = jobLinks[i];
                addLog(`Opening job ${i + 1}/${jobLinks.length}: ${link}`, 'info');

                const jobPage = await browser.newPage();
                await jobPage.goto(link, { waitUntil: 'networkidle2' });
                await delay(4000);

                let canApply = false;
                let match = null;

                // Check match score
                try {
                    await jobPage.waitForSelector('.styles_MS__details__iS7mj', { timeout: 5000 });

                    match = await jobPage.evaluate(() => ({
                        check: document.querySelectorAll('.ni-icon-check_circle').length,
                        cross: document.querySelectorAll('.ni-icon-crossMatchscore').length
                    }));

                    addLog(`Match Score - Check: ${match.check}, Cross: ${match.cross}`, 'info');

                    if (match.cross === 0 && match.check >= 4) {
                        canApply = true;
                        addLog('Good match - Eligible to apply', 'success');
                    } else {
                        addLog('Poor match - Skipping...', 'warning');
                    }
                } catch {
                    addLog('Match score not found', 'warning');
                }

                // Check apply button type
                const externalApply = await jobPage.$('#company-site-button');
                const applyBtn = await jobPage.$('#apply-button');

                let applyType = 'No Apply Button';
                if (externalApply) applyType = 'External Apply';
                else if (applyBtn) applyType = 'Direct Apply';

                // Save job result
                jobResults.push({
                    datetime: new Date().toLocaleString(),
                    pageNumber: currentPage,
                    jobNumber: `${i + 1}/${jobLinks.length}`,
                    companyUrl: link,
                    matchScore: match ? `Check:${match.check} Cross:${match.cross}` : 'Not Found',
                    matchStatus: canApply ? 'Good Match' : 'Poor Match',
                    applyType: applyType
                });

                // Skip external apply or poor match
                if (externalApply || !applyBtn || !canApply) {
                    await jobPage.close();
                    await delay(1500);
                    continue;
                }

                // Apply process
                addLog('Clicking apply button...', 'info');
                await applyBtn.click();
                await delay(5000);

                // Handle chatbot
                await handleChatbot(jobPage);

                totalJobsApplied++;
                addLog(`Job application submitted! Total applied: ${totalJobsApplied}`, 'success');

                await jobPage.close();
                await delay(2500);
            }

            currentPage++;
        }

        // Save results to Excel
        saveToExcel();

        addLog(`Automation complete! Applied to ${totalJobsApplied} jobs.`, 'success');
        return {
            success: true,
            jobsApplied: totalJobsApplied,
            logs: automationLogs,
        };
    } catch (error) {
        addLog(`Fatal error: ${error.message}`, 'error');
        return {
            success: false,
            error: error.message,
            logs: automationLogs,
        };
    } finally {
        if (browser) {
            try {
                await browser.close();
            } catch (e) {
                // ignore close errors
            }
        }
        isRunning = false;
    }
}

/**
 * Stop the currently running automation
 */
export function stopAutomation() {
    if (!isRunning) {
        addLog('No automation running', 'warning');
        return;
    }

    isRunning = false;
    addLog('Stopping automation...', 'warning');
}

/**
 * Get current logs
 * @returns {Array} Array of log entries
 */
export function getLogs() {
    return automationLogs;
}

/**
 * Clear logs
 */
export function clearLogs() {
    automationLogs = [];
    addLog('Logs cleared', 'info');
}

/**
 * Check if automation is running
 * @returns {boolean} Whether automation is running
 */
export function isAutomationRunning() {
    return isRunning;
}
// autoFilter.js - Automated job filter application for Naukri
import puppeteer from 'puppeteer';
import JobSettings from './models/JobSettings.js';
import UserFilter from './models/UserFilter.js';
import sequelize from './db/config.js';

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

/**
 * Fetch Naukri credentials from the database
 * @param {string} userId - The user's ID
 * @returns {Promise<{email: string, password: string, searchKeywords: string}>}
 */
async function fetchCredentialsFromDB(userId) {
    try {
        await sequelize.authenticate();
        const jobSettings = await JobSettings.findOne({
            where: { userId },
            attributes: ['naukriEmail', 'naukriPassword', 'searchKeywords']
        });

        if (!jobSettings || !jobSettings.naukriEmail || !jobSettings.naukriPassword) {
            throw new Error('Naukri credentials not found in database. Please set them in Job Profile Settings.');
        }

        return {
            email: jobSettings.naukriEmail,
            password: jobSettings.naukriPassword,
            searchKeywords: jobSettings.searchKeywords || 'java developer'
        };
    } catch (error) {
        console.error('Error fetching credentials from database:', error.message);
        throw error;
    }
}

/**
 * Fetch user's saved filter selections from the database
 * Labels are stored directly in the database
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} - User's filter selections (labels)
 */
async function fetchUserFiltersFromDB(userId) {
    try {
        const userFilters = await UserFilter.findOne({
            where: { userId }
        });

        if (!userFilters) {
            console.log('No saved filters found for user.');
            return null;
        }

        // Labels are stored directly in the database
        const filters = {
            salaryRange: userFilters.salaryRange || null,
            wfhType: userFilters.wfhType || null,
            citiesGid: userFilters.citiesGid || null,
            functionalAreaGid: userFilters.functionalAreaGid || null,
            industryTypeGid: userFilters.industryTypeGid || null,
            ugCourseGid: userFilters.ugCourseGid || null,
            pgCourseGid: userFilters.pgCourseGid || null,
            business_size: userFilters.business_size || null,
            employement: userFilters.employement || null,
            glbl_RoleCat: userFilters.glbl_RoleCat || null,
            topGroupId: userFilters.topGroupId || null,
            featuredCompanies: userFilters.featuredCompanies || null,
        };

        return filters;
    } catch (error) {
        console.error('Error fetching user filters from database:', error.message);
        return null;
    }
}

(async () => {
    // Get userId from command line argument or environment variable
    const userId = process.argv[2] || process.env.USER_ID;
    if (!userId) {
        console.error('❌ Error: userId is required. Pass it as an argument or set USER_ID environment variable.');
        process.exit(1);
    }

    // Fetch credentials from database
    console.log('🔑 Fetching Naukri credentials from database...');
    let credentials;
    try {
        credentials = await fetchCredentialsFromDB(userId);
        console.log('✅ Credentials loaded successfully');
    } catch (error) {
        console.error('❌ Failed to fetch credentials:', error.message);
        process.exit(1);
    }

    // Fetch user's saved filters from database
    console.log('🔍 Fetching user filters from database...');
    let userFilters;
    try {
        userFilters = await fetchUserFiltersFromDB(userId);
        if (userFilters) {
            console.log('✅ User filters loaded successfully');
            // Log which filters are set
            const activeFilters = Object.entries(userFilters)
                .filter(([_, value]) => value)
                .map(([key, value]) => `${key}: ${value}`);
            if (activeFilters.length > 0) {
                console.log('📋 Active filters:', activeFilters.join(', '));
            } else {
                console.log('ℹ️ No filters selected');
            }
        } else {
            console.log('ℹ️ No saved filters found');
        }
    } catch (error) {
        console.error('⚠️ Warning: Failed to fetch user filters:', error.message);
        userFilters = null;
    }

    const keyword = credentials.searchKeywords;
    console.log(`🔎 Search keyword: "${keyword}"`);

    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ["--start-maximized"]
    });

    const page = await browser.newPage();

    // 1️⃣ Login
    console.log("\n🌐 Opening Naukri login...");
    await page.goto("https://www.naukri.com/nlogin/login", { waitUntil: "networkidle2" });
    await delay(2500);

    console.log("🔐 Logging in...");
    await page.type("#usernameField", credentials.email, { delay: 80 });
    await page.type("#passwordField", credentials.password, { delay: 80 });
    await page.click("button[type='submit']");
    await delay(7000);

    // 2️⃣ Go to home
    console.log("➡ Redirecting to Naukri home...");
    await page.goto("https://www.naukri.com/", { waitUntil: "networkidle2" });
    await delay(3000);

    // 3️⃣ Type Keyword
    console.log("⌨️ Typing keyword...");
    await page.waitForSelector("input[placeholder='Enter keyword / designation / companies']");
    const keywordInput = await page.$("input[placeholder='Enter keyword / designation / companies']");
    await keywordInput.click({ clickCount: 3 });
    await keywordInput.type(keyword, { delay: 80 });
    await delay(1500);

    // 4️⃣ Click Search
    console.log("🔍 Clicking search...");
    await page.evaluate(() => {
        const searchBtn = document.querySelector("button.nI-gNb-sb__icon-wrapper span:nth-child(2)");
        if (searchBtn) searchBtn.click();
    });
    await delay(5000);

    // 5️⃣ Apply sidebar filters from database
    const filterConfigs = [
        { id: 'wfhType', name: 'Work Type', dbKey: 'wfhType' },
        { id: 'functionalAreaGid', name: 'Department', dbKey: 'functionalAreaGid' },
        { id: 'citiesGid', name: 'Location', dbKey: 'citiesGid' },
        { id: 'salaryRange', name: 'Salary', dbKey: 'salaryRange' },
        { id: 'business_size', name: 'Company Type', dbKey: 'business_size' },
        { id: 'glbl_RoleCat', name: 'Role Category', dbKey: 'glbl_RoleCat' },
        { id: 'ugCourseGid', name: 'UG Education', dbKey: 'ugCourseGid' },
        { id: 'pgCourseGid', name: 'PG Education', dbKey: 'pgCourseGid' },
        { id: 'employement', name: 'Posted By', dbKey: 'employement' },
        { id: 'industryTypeGid', name: 'Industry', dbKey: 'industryTypeGid' },
        { id: 'topGroupId', name: 'Top Companies', dbKey: 'topGroupId' },
        { id: 'featuredCompanies', name: 'Featured Companies', dbKey: 'featuredCompanies' }
    ];

    let appliedCount = 0;
    for (let f of filterConfigs) {
        // Get saved filter label from database
        const savedFilterLabel = userFilters?.[f.dbKey];

        if (savedFilterLabel) {
            // Apply filter automatically from database
            console.log(`\n🔧 Applying ${f.name}: ${savedFilterLabel}`);
            const success = await applyFilterAuto(page, f.id, f.name, savedFilterLabel);
            if (success) appliedCount++;
        }
    }

    // 6️⃣ Print final URL
    console.log("\n===============================");
    console.log(`✅ SEARCH + FILTERS COMPLETE`);
    console.log(`📊 Applied ${appliedCount} filters`);
    console.log("🔗 Final URL:", page.url());
    console.log("===============================\n");

    // Keep browser open for user to see results
    console.log("ℹ️ Browser will remain open. Close it manually when done.");

})();

// --------------------------------------------------------
// AUTO SIDEBAR FILTER - applies filter from database label (supports comma-separated multiple values)
// --------------------------------------------------------
async function applyFilterAuto(page, filterId, displayName, filterLabels) {
    try {
        // Split comma-separated labels into array
        const labels = filterLabels.split(',').map(l => l.trim()).filter(l => l);

        if (labels.length === 0) {
            return false;
        }

        console.log(`   📝 Values to apply (${labels.length}): ${labels.join(' | ')}`);

        let appliedCount = 0;

        // Apply each filter label one by one
        for (const filterLabel of labels) {
            // Wait for filter section (re-query each time as page may refresh)
            try {
                await page.waitForSelector(`div[data-filter-id="${filterId}"]`, { timeout: 5000 });
            } catch (e) {
                console.log(`   ⚠️ Filter section "${filterId}" not visible, skipping ${filterLabel}`);
                continue;
            }

            await delay(500);

            // Try to click the filter option by label
            const clicked = await page.evaluate((filterId, text) => {
                const filterSection = document.querySelector(`div[data-filter-id="${filterId}"]`);
                if (!filterSection) return false;

                const inputs = Array.from(filterSection.querySelectorAll('input'));
                const target = inputs.find(input => {
                    const parent = input.closest('label') || input.parentElement;
                    const labelEl = input.nextElementSibling || parent;
                    const labelText = labelEl?.querySelector('span[title]')?.title ||
                        labelEl?.querySelector('span')?.innerText?.trim() ||
                        labelEl?.innerText?.trim() ||
                        parent?.innerText?.trim() || '';

                    // Match by exact label or partial match
                    const normalizedLabel = labelText.replace(/\(\d+\)/, '').trim();
                    return normalizedLabel === text ||
                        normalizedLabel.startsWith(text) ||
                        normalizedLabel.includes(text) ||
                        labelText.includes(text);
                });

                if (target && !target.checked) {
                    const clickTarget = target.closest('label') || target;
                    clickTarget.click();
                    return true;
                } else if (target && target.checked) {
                    return 'already_checked';
                }
                return false;
            }, filterId, filterLabel);

            if (clicked === true) {
                console.log(`   ✅ Selected: ${filterLabel}`);
                appliedCount++;
                await delay(1500); // Wait for page to process
            } else if (clicked === 'already_checked') {
                console.log(`   ✓ Already selected: ${filterLabel}`);
                appliedCount++;
            } else {
                console.log(`   ⚠️ Not found: "${filterLabel}"`);
            }
        }

        return appliedCount > 0;

    } catch (err) {
        console.log(`❌ ${displayName} filter error: ${err.message}`);
        return false;
    }
}

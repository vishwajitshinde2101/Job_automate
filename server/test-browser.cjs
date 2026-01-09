const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false
        });
        console.log('BROWSER LAUNCHED');
        await browser.close();
    } catch (e) {
        console.error('LAUNCH FAILED:', e.message);
    }
})();

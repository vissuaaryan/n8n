const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('chrome-aws-lambda');

const app = express();
const PORT = process.env.PORT || 3000;

let isRunning = false;

// CRON LIKE TIMER - Har ghante ek bar
setInterval(async () => {
    if (isRunning) return;
    console.log('⏰ Timer tick — Running bot task...');
    await runBot();
}, 60 * 60 * 1000); // Har 60 minute baad

// Immediate run on startup (so you see logs fast)
setTimeout(async () => {
    console.log('🚀 Starting first run...');
    await runBot();
}, 5000);

async function runBot() {
    if (isRunning) return;
    isRunning = true;

    let browser = null;
    try {
        console.log('🔥 Launching stealth Chrome...');

        browser = await puppeteer.launch({
            args: chromium.args.concat([
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-infobars',
                '--window-position=0,0'
            ]),
            executablePath: await chromium.executablePath,
            headless: true,
            timeout: 60_000,
        });

        const page = await browser.newPage();
        await page.setJavaScriptEnabled(true);
        await page.setDefaultNavigationTimeout(35e3);

        // Block images/css to save RAM
        await page.route('**/*', route => {
            const blocked = ['image', 'stylesheet', 'font', 'media'];
            route.request().resourceType() === 'document'
                ? route.continue()
                : blocked.includes(route.request().resourceType())
                    ? route.abort()
                    : route.continue();
        });

        console.log('🧭 Going to site...');

        // ⚠️ CHANGE THIS URL TO YOUR TARGET!
        await page.goto('https://faucetpay.io/register', { waitUntil: 'domcontentloaded' });

        const rand = Math.floor(Math.random() * 99999);
        const email = `user${rand}@sharklasers.com`;

        console.log(`📧 Using email: ${email}`);

        // 💀 UPDATE THESE SELECTORS BASED ON SITE! F12 kar be!
        
       try {
            // Wait before typing
            await new Promise(r => setTimeout(r, 2e3));

           // Fill form
           await page.type('[name="email"]', email);
           await page.type('[name="password"]', 'P@sswOrd!');
           await page.type('[name="password_confirmation"]', 'P@sswOrd!');

           // Click submit button - change selector as needed!
           const btnSelector = 'button[type="submit"]';
           await Promise.all([
               page.click(btnSelector),
               page.waitForNavigation({ timeout: 25e3 }).catch(() => {})
           ]);

           console.log(`🎉 SUCCESS! Account created: ${email}`);
       } catch(err) {
           console.error(`❌ FAILED TO FILL FORM`, err.message);
           
           // Screenshot for debug (optional)
           try {
               await page.screenshot({ path: '/tmp/error.png' });
               console.log("📸 Debug screenshot taken");
           } catch(e){ /* ignore */ }

       }

   } catch(err) {
       console.error("💀 BROWSER LAUNCH FAILED:", err.message);
   } finally {
       if(browser) try { await browser.close(); } catch(e){}
       isRunning = false;
   }
}

app.get('/', (req, res) => {
   res.send(`
<h1>DadGPT Ghost Bot</h1>
<p>Status: Operational 😈</p>
<p><strong>Last run:</strong> Check logs for updates</p>
`);
});

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});

// Start immediately too
runBot();

module.exports = app;

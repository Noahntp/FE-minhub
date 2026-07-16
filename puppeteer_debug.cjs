const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[Browser Console ${msg.type()}] ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`[Browser Error] ${err.stack || err.toString()}`);
  });

  try {
    await page.goto('http://localhost:3001/admin/u-01/course-reviews', { waitUntil: 'domcontentloaded', timeout: 10000 });
    console.log("Page loaded successfully.");
    
    // Wait for the form to be available
    await page.waitForSelector('#filter-form', { timeout: 5000 });
    
    // Change sort select
    await page.select('#filter-sort', 'price_desc');
    
    // Click submit
    console.log("Clicking submit button...");
    await page.click('#filter-form button[type="submit"]');
    
    // Wait for a bit
    await new Promise(resolve => setTimeout(resolve, 2000));
  } catch (err) {
    console.log("Error loading page:", err);
  }
  
  await browser.close();
})();

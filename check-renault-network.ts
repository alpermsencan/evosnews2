import puppeteer from 'puppeteer';

async function main() {
  console.log("Launching Brave to capture network requests...");
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Set up network request logging
  const requestsLog: string[] = [];
  page.on('request', (request) => {
    const url = request.url();
    const resourceType = request.resourceType();
    requestsLog.push(`${request.method()} [${resourceType}] ${url}`);
  });

  page.on('console', (msg) => {
    console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', (err) => {
    console.log(`[Browser PageError] ${err.toString()}`);
  });

  const url = "https://www.renault.com.tr/modeller/megane-e-tech-elektrikli.html";
  console.log("Navigating to:", url);
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    console.log("Page loaded. Waiting 15 seconds to capture dynamic images...");
    await new Promise(r => setTimeout(r, 15000));
  } catch (err) {
    console.error("Navigation error:", err);
  }

  console.log(`\n--- Captured ${requestsLog.length} Requests ---`);
  requestsLog.forEach((req, i) => {
    console.log(`[${i}] ${req}`);
  });

  await browser.close();
}

main().catch(console.error);

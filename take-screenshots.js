const puppeteer = require("puppeteer");
const path = require("path");

const URLS = [
  { name: "araclar", path: "/araclar" },
  { name: "hyundai-inster", path: "/araclar/hyundai-inster" },
  { name: "hyundai-ioniq-5", path: "/araclar/hyundai-ioniq-5" },
  { name: "hyundai-ioniq-5-n", path: "/araclar/hyundai-ioniq-5-n" },
  { name: "kia-ev9", path: "/araclar/kia-ev9" }
];

const TARGET_DIR = "/Users/alper/.gemini/antigravity/brain/d8e6ef01-cf93-48bf-af87-aa69b06457f7";

async function capture(urlObj, isMobile) {
  const width = isMobile ? 390 : 1920;
  const height = isMobile ? 844 : 1080;
  const suffix = isMobile ? "mobile" : "desktop";
  
  console.log(`Launching browser for ${urlObj.name} (${suffix})...`);
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width, height, isMobile, hasTouch: isMobile });
    
    const targetUrl = `http://localhost:3000${urlObj.path}`;
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 120000 });
    
    // Wait an extra 5 seconds for Turbopack compilation & dynamic hydration
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const screenshotName = `${urlObj.name}_${suffix}.png`;
    const screenshotPath = path.join(TARGET_DIR, screenshotName);
    
    console.log(`Saving screenshot to ${screenshotPath}...`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Captured ${screenshotName} successfully!`);
  } catch (err) {
    console.error(`Failed to capture ${urlObj.name} (${suffix}):`, err);
  } finally {
    await browser.close();
  }
}

async function main() {
  for (const item of URLS) {
    await capture(item, false); // Desktop
    await capture(item, true);  // Mobile
  }
  console.log("All screenshots captured successfully!");
}

main().catch(console.error);

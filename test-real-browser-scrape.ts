import puppeteer from 'puppeteer';
import * as fs from 'fs';

async function main() {
  console.log("Launching Brave browser in non-headless mode...");
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: false, // Open a real window to bypass Akamai bot detection!
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  const url = "https://www.renault.com.tr/modeller/megane-e-tech-elektrikli.html";
  console.log("Navigating to:", url);
  
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  console.log("Page loaded. Waiting 10 seconds for content to render...");
  await new Promise(r => setTimeout(r, 10000));
  
  let imgs: {src: string, alt: string}[] = [];
  let bodyText = "";
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`Evaluate attempt ${attempt}...`);
      await page.waitForSelector('body', { timeout: 10000 });
      
      imgs = await page.evaluate(() => {
        const urls: {src: string, alt: string}[] = [];
        document.querySelectorAll('img').forEach(img => {
          const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-original');
          if (src) urls.push({ src, alt: img.alt || '' });
        });
        document.querySelectorAll('source').forEach(srcEl => {
          const srcset = srcEl.getAttribute('srcset') || srcEl.getAttribute('data-srcset');
          if (srcset) {
            const first = srcset.split(',')[0].trim().split(' ')[0];
            if (first) urls.push({ src: first, alt: '' });
          }
        });
        return urls;
      });
      
      bodyText = await page.evaluate(() => document.body.innerText);
      break;
    } catch (err: any) {
      console.warn(`Attempt ${attempt} failed: ${err.message}`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  
  console.log(`Found ${imgs.length} images:`);
  imgs.forEach((img, i) => {
    console.log(`  [${i}] Src: ${img.src} | Alt: ${img.alt}`);
  });

  console.log("Body text length:", bodyText.length);
  console.log("First 300 chars of body text:", bodyText.substring(0, 300));
  
  try {
    await page.screenshot({ path: '/Users/alper/.gemini/antigravity/brain/d8e6ef01-cf93-48bf-af87-aa69b06457f7/scratch/r5-scrape-debug.png' });
    console.log("Saved debug screenshot.");
  } catch (err: any) {
    console.error("Screenshot failed:", err.message);
  }
  
  await browser.close();
}

main().catch(console.error);

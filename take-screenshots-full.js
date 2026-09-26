const puppeteer = require('puppeteer');
const path = require('path');

const targetUrls = [
  { name: 'araclar', url: 'http://localhost:3000/araclar' },
  { name: 'hyundai-inster', url: 'http://localhost:3000/araclar/hyundai-inster' },
  { name: 'hyundai-kona-elektrik', url: 'http://localhost:3000/araclar/hyundai-kona-elektrik' },
  { name: 'hyundai-ioniq-5', url: 'http://localhost:3000/araclar/hyundai-ioniq-5' },
  { name: 'hyundai-ioniq-5-n', url: 'http://localhost:3000/araclar/hyundai-ioniq-5-n' },
  { name: 'hyundai-ioniq-6', url: 'http://localhost:3000/araclar/hyundai-ioniq-6' },
  { name: 'kia-ev9', url: 'http://localhost:3000/araclar/kia-ev9' },
  { name: 'byd-seal', url: 'http://localhost:3000/araclar/byd-seal-excellence-2026' },
  { name: 'togg-t10x', url: 'http://localhost:3000/araclar/togg-t10x-v2-uzun-menzil-2026' },
  { name: 'tesla-model-y', url: 'http://localhost:3000/araclar/tesla-model-y-long-range-2026' }
];

async function capture() {
  for (const pageInfo of targetUrls) {
    // 1. Desktop
    console.log(`Launching browser for ${pageInfo.name} (desktop)...`);
    const browserD = await puppeteer.launch({ headless: true });
    const pageD = await browserD.newPage();
    await pageD.setViewport({ width: 1920, height: 1080 });
    console.log(`Navigating to ${pageInfo.url}...`);
    await pageD.goto(pageInfo.url, { waitUntil: 'networkidle2' });
    // wait for 2 seconds to make sure images load
    await new Promise(r => setTimeout(r, 2000));
    const screenshotPathD = path.join('/Users/alper/.gemini/antigravity/brain/d8e6ef01-cf93-48bf-af87-aa69b06457f7', `${pageInfo.name}_desktop.png`);
    console.log(`Saving screenshot to ${screenshotPathD}...`);
    await pageD.screenshot({ path: screenshotPathD, fullPage: true });
    console.log(`Captured ${pageInfo.name}_desktop.png successfully!`);
    await browserD.close();

    // 2. Mobile
    console.log(`Launching browser for ${pageInfo.name} (mobile)...`);
    const browserM = await puppeteer.launch({ headless: true });
    const pageM = await browserM.newPage();
    await pageM.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
    console.log(`Navigating to ${pageInfo.url}...`);
    await pageM.goto(pageInfo.url, { waitUntil: 'networkidle2' });
    // wait for 2 seconds to make sure images load
    await new Promise(r => setTimeout(r, 2000));
    const screenshotPathM = path.join('/Users/alper/.gemini/antigravity/brain/d8e6ef01-cf93-48bf-af87-aa69b06457f7', `${pageInfo.name}_mobile.png`);
    console.log(`Saving screenshot to ${screenshotPathM}...`);
    await pageM.screenshot({ path: screenshotPathM, fullPage: true });
    console.log(`Captured ${pageInfo.name}_mobile.png successfully!`);
    await browserM.close();
  }
  console.log('All screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});

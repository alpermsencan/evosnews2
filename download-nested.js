const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log('Navigating to Renault binek price list...');
  try {
    await page.goto('https://www.renault.com.tr/renault-fiyat-listeleri/binek-arac-fiyat-listesi.html', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await new Promise(r => setTimeout(r, 6000));
    
    const html = await page.content();
    fs.writeFileSync('/Users/alper/.gemini/antigravity/brain/d8e6ef01-cf93-48bf-af87-aa69b06457f7/scratch/nested-html.html', html);
    console.log('Saved HTML. Length:', html.length);

  } catch (err) {
    console.error('Error during navigation:', err);
  } finally {
    await browser.close();
  }
})();

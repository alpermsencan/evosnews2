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
  
  console.log('Navigating directly to best.renault.com.tr/fiyat-listesi/?kat=Binek ...');
  try {
    await page.goto('https://best.renault.com.tr/fiyat-listesi/?kat=Binek', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await new Promise(r => setTimeout(r, 6000));
    
    const pageTitle = await page.title();
    console.log('Page Title:', pageTitle);
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync('/Users/alper/.gemini/antigravity/brain/d8e6ef01-cf93-48bf-af87-aa69b06457f7/scratch/renault-body-best.txt', bodyText);
    console.log('Saved best body text. Length:', bodyText.length);
    
    const lines = bodyText.split('\n');
    console.log('Lines containing Megane or Renault 5:');
    let matches = 0;
    lines.forEach(line => {
      if (line.includes('Megane') || line.includes('Renault 5') || line.includes('E-Tech') || line.includes('2.386') || line.includes('1.886') || line.includes('2.101')) {
        console.log('  >', line);
        matches++;
      }
    });
    console.log('Matches:', matches);

  } catch (err) {
    console.error('Error during navigation:', err);
  } finally {
    await browser.close();
  }
})();

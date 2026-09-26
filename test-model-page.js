const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  console.log('Navigating to Megane page...');
  try {
    await page.goto('https://www.renault.com.tr/araba-modelleri/megane-e-tech-elektrikli.html', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await new Promise(r => setTimeout(r, 6000));
    
    const pageTitle = await page.title();
    console.log('Page Title:', pageTitle);
    
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log('Body Text length:', bodyText.length);
    console.log('Snippet:', bodyText.substring(0, 1000));
    
    const appHtml = await page.evaluate(() => {
      const app = document.getElementById('app');
      return app ? app.innerHTML : 'no-app';
    });
    console.log('App HTML Snippet:', appHtml.substring(0, 1000));

  } catch (err) {
    console.error('Error during navigation:', err);
  } finally {
    await browser.close();
  }
})();

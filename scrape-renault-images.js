const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeModelImages(modelName, pageUrl) {
  const browser = await puppeteer.launch({
    executablePath: "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  console.log(`Navigating to ${modelName} page: ${pageUrl}...`);
  const imageList = [];
  try {
    await page.goto(pageUrl, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    await new Promise(r => setTimeout(r, 5000));
    
    // Extract all image sources
    const imgUrls = await page.evaluate(() => {
      const urls = [];
      document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.getAttribute('data-src') || img.getAttribute('data-original');
        if (src) {
          urls.push({
            src,
            alt: img.alt || ''
          });
        }
      });
      
      // Also look for background images or other elements
      document.querySelectorAll('*').forEach(el => {
        const bg = window.getComputedStyle(el).backgroundImage;
        if (bg && bg !== 'none') {
          const match = bg.match(/url\("?([^"]+)"?\)/);
          if (match) {
            urls.push({
              src: match[1],
              alt: ''
            });
          }
        }
      });
      return urls;
    });
    
    console.log(`Found ${imgUrls.length} total raw image references.`);
    
    imgUrls.forEach(img => {
      let cleanUrl = img.src;
      // Resolve relative URL
      if (cleanUrl.startsWith('//')) {
        cleanUrl = 'https:' + cleanUrl;
      } else if (cleanUrl.startsWith('/')) {
        cleanUrl = 'https://www.renault.com.tr' + cleanUrl;
      }
      
      if (cleanUrl.includes('cdn.group.renault.com/ren/master/')) {
        imageList.push({
          url: cleanUrl,
          alt: img.alt
        });
      }
    });

  } catch (err) {
    console.error(`Error scraping ${modelName}:`, err);
  } finally {
    await browser.close();
  }
  return imageList;
}

(async () => {
  const meganeImages = await scrapeModelImages('Megane E-Tech', 'https://www.renault.com.tr/araba-modelleri/megane-e-tech-elektrikli.html');
  const r5Images = await scrapeModelImages('Renault 5 E-Tech', 'https://www.renault.com.tr/araba-modelleri/renault-5-e-tech-elektrikli.html');
  
  fs.writeFileSync('/Users/alper/.gemini/antigravity/brain/d8e6ef01-cf93-48bf-af87-aa69b06457f7/scratch/renault-scraped-images.json', JSON.stringify({
    megane: meganeImages,
    r5: r5Images
  }, null, 2));
  
  console.log(`Scrape finished. Megane CDN images: ${meganeImages.length}, Renault 5 CDN images: ${r5Images.length}`);
})();

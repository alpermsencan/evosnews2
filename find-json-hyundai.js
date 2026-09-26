const fs = require("fs");

async function main() {
  const url = "https://www.hyundai.com/tr/tr/satis/fiyat-listesi.html";
  const response = await fetch(url);
  const html = await response.text();

  // Find all scripts that contain IONIQ or KONA
  const scripts = html.match(/<script[\s\S]*?<\/script>/gi) || [];
  console.log(`Searching in ${scripts.length} script tags...`);
  
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i];
    if (s.includes("IONIQ") || s.includes("KONA") || s.includes("INSTER")) {
      console.log(`Script #${i} (length: ${s.length}) contains IONIQ/KONA/INSTER!`);
      // print first 500 chars and last 500 chars of the script
      console.log("Start:", s.slice(0, 400));
      console.log("End:", s.slice(-400));
      console.log("-----------------------------------------");
    }
  }
}

main().catch(console.error);

const fs = require("fs");

async function main() {
  const files = [
    "/etc.clientlibs/hyundai-wwn3/clientlibs/main.01248945d9530fb47c639d23b6e1c47b.js",
    "/etc.clientlibs/hyundai-wwn3/clientlibs-pip25/publish/theme-legacy.09da807c3c21c4fa16fa69b334e6aebb.js",
    "/etc.clientlibs/hyundai-wwn3/clientlibs-pip25/publish/theme/theme-legacy.4b3be4e54314de83e3d0fb772836afdd.js",
  ];

  for (const f of files) {
    const url = "https://www.hyundai.com" + f;
    console.log("Fetching", url);
    const response = await fetch(url);
    const code = await response.text();
    console.log("Downloaded", f, "length:", code.length);

    // search for "/prices" or "prices" or "ModelPriceTable"
    let index = 0;
    while (true) {
      index = code.indexOf("prices", index);
      if (index === -1) break;

      console.log(`Found 'prices' in ${f} at index ${index}:`);
      console.log(code.slice(Math.max(0, index - 150), Math.min(code.length, index + 150)));
      console.log("-----------------------------------------");
      index += 6;
    }
  }
}

main().catch(console.error);

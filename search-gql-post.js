async function main() {
  const url = "https://www.hyundai.com/etc.clientlibs/hyundai-wwn3/clientlibs/react-gatsby.35d278cfadcd47cd0b6783685710df93.js";
  const response = await fetch(url);
  const code = await response.text();

  // Find where "HppPriceListTR" is used
  const idx = code.indexOf("query HppPriceListTR");
  console.log("Analyzing surrounding area of query HppPriceListTR...");

  // Print 2000 chars before
  const start = Math.max(0, idx - 2000);
  console.log(code.slice(start, idx + 500));
}

main().catch(console.error);

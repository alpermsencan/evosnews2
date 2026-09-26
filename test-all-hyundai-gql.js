const models = [
  { name: 'INSTER', modelId: '6X|S5||' },
  { name: 'KONA Elektrik', modelId: '7F|W5||' },
  { name: 'IONIQ 5', modelId: 'GI|W5||' },
  { name: 'IONIQ 5 N', modelId: '9I|W5||' },
  { name: 'Yeni IONIQ 6', modelId: 'AL|*||' },
  { name: 'IONIQ 9', modelId: 'GO|*||' }
];

async function main() {
  const url = "https://org-eu-www.hyundai.com/eu/papi";

  for (const m of models) {
    const body = {
      query: `
        query HppPriceListTR(
          $service: TrimmedString!
          $country: TrimmedString!
          $modelId: TrimmedString!
        ) {
          hppPriceListTR(
            service: $service,
            country: $country,
            modelId: $modelId
          ) {
            plant
            productYear
            modelDescription
            powertrainNm
            trimNm
            fuelTypeNm
            transmissionType
            maxPrice
            maxcampaignPrice
          }
        }
      `,
      variables: {
        country: "tr",
        service: "S03",
        modelId: m.modelId
      }
    };

    console.log(`Fetching prices for ${m.name}...`);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      body: JSON.stringify(body)
    });

    const json = await response.json();
    const items = json?.data?.hppPriceListTR || [];
    console.log(`Found ${items.length} variants:`);
    for (const item of items) {
      console.log(`  - ${item.modelDescription} | ${item.powertrainNm} | ${item.trimNm} | Max: ${item.maxPrice} | Camp: ${item.maxcampaignPrice} | Year: ${item.productYear} | Fuel: ${item.fuelTypeNm}`);
    }
    console.log("-----------------------------------------");
  }
}

main().catch(console.error);

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const images = await prisma.vehicleImage.findMany({
    include: { vehicle: true }
  });

  const bydImages = images.filter(img => img.vehicle.brand === 'BYD');
  console.log(`Total BYD images: ${bydImages.length}`);
  
  // Group by URL to see duplicates
  const urlGroups = {};
  bydImages.forEach(img => {
    urlGroups[img.url] = urlGroups[img.url] || [];
    urlGroups[img.url].push(img);
  });

  console.log('\n--- Duplicated URLs ---');
  let duplicateCount = 0;
  Object.keys(urlGroups).forEach(url => {
    if (urlGroups[url].length > 1) {
      duplicateCount++;
      console.log(`URL: ${url}`);
      urlGroups[url].forEach(img => {
        console.log(`  - ID: ${img.id}, Vehicle: ${img.vehicle.model}, externalId: ${img.externalId}`);
      });
    }
  });
  console.log(`Total duplicated URLs: ${duplicateCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

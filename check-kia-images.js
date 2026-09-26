const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const kiaImages = await prisma.vehicleImage.findMany({
    where: { vehicle: { brand: 'Kia' } },
    include: { vehicle: true }
  });

  console.log(`Total Kia images: ${kiaImages.length}`);
  
  // Find ignored or technical images
  const ignored = kiaImages.filter(img => img.type === 'ignored');
  console.log(`Ignored Kia images (${ignored.length}):`);
  ignored.forEach(img => {
    console.log(`  - ID: ${img.id}, Model: ${img.vehicle.model}, URL: ${img.url}`);
  });

  // Check if any active image has technical terms
  const technicalKeywords = [
    'diagram', 'blueprint', 'brochure', 'broşür', 'şema', 'infografik', 'infographics'
  ];

  const suspicious = kiaImages.filter(img => {
    if (img.type === 'ignored') return false;
    const url = img.url.toLowerCase();
    const srcUrl = img.sourceUrl.toLowerCase();
    return technicalKeywords.some(kw => url.includes(kw) || srcUrl.includes(kw));
  });

  console.log(`\nSuspicious active Kia images (${suspicious.length}):`);
  suspicious.forEach(img => {
    console.log(`  - ID: ${img.id}, Model: ${img.vehicle.model}, URL: ${img.url}`);
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

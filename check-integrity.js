const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.count();
  const variants = await prisma.vehicleVariant.count();
  const priceHistory = await prisma.vehiclePriceHistory.count();
  const totalImages = await prisma.vehicleImage.count();
  
  const ignoredImages = await prisma.vehicleImage.count({
    where: { type: 'ignored' }
  });
  
  const activeImages = await prisma.vehicleImage.count({
    where: { NOT: { type: { in: ['ignored', 'deleted'] } } }
  });

  console.log(`Vehicles: ${vehicles}`);
  console.log(`Variants: ${variants}`);
  console.log(`PriceHistory: ${priceHistory}`);
  console.log(`VehicleImages: ${totalImages}`);
  console.log(`Active Images: ${activeImages}`);
  console.log(`Ignored Images: ${ignoredImages}`);
  
  // Cross model images count: check if any image contains keywords of another model
  const dbImages = await prisma.vehicleImage.findMany({
    include: { vehicle: true }
  });

  let crossModelCount = 0;
  dbImages.forEach(img => {
    const srcUrl = img.sourceUrl.toLowerCase();
    const publicId = img.cloudinaryPublicId.toLowerCase();
    const model = img.vehicle.model.toLowerCase();
    const brand = img.vehicle.brand.toLowerCase();

    if (brand === 'byd' && model.includes('sealion') && srcUrl.includes('/vehicles/seal/') && !srcUrl.includes('sealion')) {
      crossModelCount++;
      console.log(`Cross-model detected: BYD Sealion 7 has Seal image ${img.sourceUrl}`);
    }
    if (brand === 'hyundai' && model.includes('inster') && (srcUrl.includes('ioniq') || srcUrl.includes('kona'))) {
      crossModelCount++;
    }
    if (brand === 'hyundai' && model === 'ioniq 5' && (srcUrl.includes('ioniq-5-n') || srcUrl.includes('ioniq5n') || srcUrl.includes('ioniq-6') || srcUrl.includes('inster') || srcUrl.includes('kona'))) {
      crossModelCount++;
    }
  });

  console.log(`Cross-Model Images Count: ${crossModelCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

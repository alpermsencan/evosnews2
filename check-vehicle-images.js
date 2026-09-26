const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      syncImages: true,
      variants: true
    }
  });

  console.log(`Total Vehicles: ${vehicles.length}`);
  const totalSyncImages = await prisma.vehicleImage.count();
  console.log(`Total VehicleImages: ${totalSyncImages}`);

  const results = vehicles.map(v => {
    return {
      brand: v.brand,
      model: v.model,
      slug: v.slug,
      image: v.image,
      images: v.images,
      syncImagesCount: v.syncImages.length,
      syncImages: v.syncImages.map(img => ({
        url: img.url,
        cloudinaryPublicId: img.cloudinaryPublicId,
        sourceUrl: img.sourceUrl,
        filename: img.url.split('/').pop()
      }))
    };
  });

  console.log('\n--- VEHICLE IMAGES DETAILED DATA ---');
  console.log(JSON.stringify(results, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const images = await prisma.vehicleImage.findMany({
    include: { vehicle: true }
  });

  const counts = {};
  images.forEach(img => {
    const brand = img.vehicle.brand;
    counts[brand] = (counts[brand] || 0) + 1;
  });

  console.log('Images by Brand in DB:', counts);
  console.log('Total images:', images.length);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

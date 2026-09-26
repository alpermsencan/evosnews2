const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sealionVehicle = await prisma.vehicle.findUnique({
    where: { slug: 'byd-sealion-7-2026' }
  });

  if (sealionVehicle) {
    // Delete any motor.jpg image associated with Sealion 7
    const result = await prisma.vehicleImage.deleteMany({
      where: {
        vehicleId: sealionVehicle.id,
        sourceUrl: { contains: 'seal/motor.jpg' }
      }
    });
    console.log(`Deleted ${result.count} duplicate motor image from BYD SEALION 7.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

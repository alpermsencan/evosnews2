const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    include: {
      syncImages: true
    }
  });

  vehicles.forEach(v => {
    if (v.syncImages.length === 0) return;
    console.log(`\n=== ${v.brand} ${v.model} ===`);
    const primaries = v.syncImages.filter(img => img.isPrimary);
    console.log(`  Primaries (${primaries.length}):`);
    primaries.forEach(img => {
      console.log(`    - ${img.url}`);
    });
    console.log(`  All syncImages ordered by createdAt:`);
    v.syncImages.forEach((img, idx) => {
      console.log(`    [${idx}] (isPrimary: ${img.isPrimary}) - ${img.url}`);
    });
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

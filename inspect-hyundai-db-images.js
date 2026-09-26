const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    where: { brand: "Hyundai" },
    include: { syncImages: true }
  });

  console.log(`Found ${vehicles.length} Hyundai vehicles in DB:`);
  for (const v of vehicles) {
    console.log(`\nModel: ${v.model} (ID: ${v.id}, Slug: ${v.slug})`);
    console.log(`  Base Image: ${v.image}`);
    console.log(`  Base Images: ${JSON.stringify(v.images)}`);
    console.log(`  Sync Images (${v.syncImages.length}):`);
    for (const img of v.syncImages) {
      console.log(`    - ID: ${img.id}`);
      console.log(`      url: ${img.url}`);
      console.log(`      sourceUrl: ${img.sourceUrl}`);
      console.log(`      externalId: ${img.externalId}`);
      console.log(`      isPrimary: ${img.isPrimary}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);

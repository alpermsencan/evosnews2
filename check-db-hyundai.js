const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const list = await prisma.vehicle.findMany({});

  console.log(`Found ${list.length} total vehicles in database:`);
  for (const v of list) {
    console.log(`  - ID: ${v.id} | Model: ${v.model} | Brand: ${v.brand} | Price: ${v.price}`);
  }

  await prisma.$disconnect();
}

main().catch(console.error);

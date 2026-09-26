const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany({
    select: { brand: true }
  });
  const brands = [...new Set(vehicles.map(v => v.brand))].sort();
  console.log('Unique brands:', brands);
  
  // also check if there are other brands in database
  const count = await prisma.vehicle.count();
  console.log('Total vehicles count:', count);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

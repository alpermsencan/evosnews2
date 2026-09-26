const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vehicle = await prisma.vehicle.findFirst({
    where: {
      brand: {
        mode: 'insensitive',
        equals: 'renault'
      }
    }
  });
  
  if (vehicle) {
    console.log('Renault 5 E-Tech Record:');
    console.log(`ID: ${vehicle.id}`);
    console.log(`External ID: ${vehicle.externalId}`);
    console.log(`Rating: ${vehicle.rating}`);
    console.log(`Pros:`, vehicle.pros);
    console.log(`Cons:`, vehicle.cons);
    console.log(`Description: ${vehicle.description}`);
  } else {
    console.log('No Renault vehicle found');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

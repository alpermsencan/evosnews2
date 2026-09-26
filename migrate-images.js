const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING DATABASE IMAGE MIGRATION AND CLEANUP ---');

  // Find the exact externalId values in the database for the INSTER images by querying their sourceUrl
  const insterUrls = [
    'https://dmassets.hyundai.com/is/image/hyundaiautoever/Hyundai-INSTER-sn',
    'https://dmassets.hyundai.com/is/image/hyundaiautoever/Hyundai-INSTER-km',
    'https://dmassets.hyundai.com/is/image/hyundaiautoever/Hyundai-INSTER-km-h'
  ];

  const insterDbImages = await prisma.vehicleImage.findMany({
    where: {
      sourceUrl: { in: insterUrls }
    }
  });

  console.log('Found INSTER images in DB:', insterDbImages.map(img => ({ id: img.id, externalId: img.externalId, type: img.type })));

  const insterUpdate = await prisma.vehicleImage.updateMany({
    where: {
      id: { in: insterDbImages.map(img => img.id) }
    },
    data: {
      type: 'ignored'
    }
  });
  console.log(`Updated ${insterUpdate.count} INSTER images to 'ignored'.`);

  // 2. Kia Niro EV blueprint cleanup
  const niroUrl = 'https://www.kia.com/content/dam/kwcms/tr/tr/images/showroom/niro-ev/7d616a3c21719e80ef4d8ba5ade57735756c86a643.png';
  const niroDbImage = await prisma.vehicleImage.findFirst({
    where: { sourceUrl: niroUrl }
  });

  if (niroDbImage) {
    await prisma.vehicleImage.update({
      where: { id: niroDbImage.id },
      data: { type: 'ignored' }
    });
    console.log(`Updated Niro EV blueprint image to 'ignored'.`);
  } else {
    console.log('Niro EV blueprint image not found.');
  }

  // 3. BYD Sealion 7 motor image migration: Move from Sealion 7 to Seal Excellence AWD
  const sealionVehicle = await prisma.vehicle.findUnique({
    where: { slug: 'byd-sealion-7-2026' }
  });
  const sealVehicle = await prisma.vehicle.findUnique({
    where: { slug: 'byd-seal-excellence-2026' }
  });

  if (sealionVehicle && sealVehicle) {
    const motorImage = await prisma.vehicleImage.findFirst({
      where: {
        vehicleId: sealionVehicle.id,
        sourceUrl: 'https://bydauto.mncdn.com/storage/vehicles/seal/motor.jpg'
      }
    });

    if (motorImage) {
      // Check if the same image already exists for the Seal vehicle
      const existingInSeal = await prisma.vehicleImage.findFirst({
        where: {
          vehicleId: sealVehicle.id,
          externalId: motorImage.externalId
        }
      });

      if (existingInSeal) {
        // If it already exists for Seal, delete it from Sealion 7
        await prisma.vehicleImage.delete({
          where: { id: motorImage.id }
        });
        console.log('Deleted duplicate motor image from SEALION 7.');
      } else {
        // If not, move it to Seal
        await prisma.vehicleImage.update({
          where: { id: motorImage.id },
          data: { vehicleId: sealVehicle.id }
        });
        console.log('Moved motor image from SEALION 7 to SEAL.');
      }
    } else {
      console.log('Motor image not found under SEALION 7.');
    }
  } else {
    console.log('Skipped motor image migration: Vehicles not found.');
  }

  // 4. ExternalId prefix migration for Hyundai
  const hyundaiVehicles = await prisma.vehicle.findMany({
    where: { brand: 'Hyundai' },
    include: { syncImages: true }
  });

  let hyundaiMigratedCount = 0;
  for (const v of hyundaiVehicles) {
    for (const img of v.syncImages) {
      if (img.externalId.startsWith('kia-img-')) {
        const newExternalId = img.externalId.replace('kia-img-', 'hyundai-img-');
        
        const existing = await prisma.vehicleImage.findFirst({
          where: {
            vehicleId: v.id,
            externalId: newExternalId
          }
        });

        if (existing) {
          await prisma.vehicleImage.delete({ where: { id: img.id } });
        } else {
          await prisma.vehicleImage.update({
            where: { id: img.id },
            data: { externalId: newExternalId }
          });
        }
        hyundaiMigratedCount++;
      }
    }
  }
  console.log(`Migrated externalId prefixes for ${hyundaiMigratedCount} Hyundai images.`);

  // 5. ExternalId prefix migration for Togg
  const toggVehicles = await prisma.vehicle.findMany({
    where: { brand: 'Togg' },
    include: { syncImages: true }
  });

  let toggMigratedCount = 0;
  for (const v of toggVehicles) {
    for (const img of v.syncImages) {
      if (img.externalId.startsWith('kia-img-')) {
        const newExternalId = img.externalId.replace('kia-img-', 'togg-img-');
        
        const existing = await prisma.vehicleImage.findFirst({
          where: {
            vehicleId: v.id,
            externalId: newExternalId
          }
        });

        if (existing) {
          await prisma.vehicleImage.delete({ where: { id: img.id } });
        } else {
          await prisma.vehicleImage.update({
            where: { id: img.id },
            data: { externalId: newExternalId }
          });
        }
        toggMigratedCount++;
      }
    }
  }
  console.log(`Migrated externalId prefixes for ${toggMigratedCount} Togg images.`);

  console.log('--- DATABASE MIGRATION AND CLEANUP FINISHED ---');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

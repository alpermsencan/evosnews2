import { PrismaClient } from '@prisma/client';
import { fetchRenaultPrices } from './lib/vehicle-sync/sources/renault';
import { slugify } from './lib/vehicle-sync/normalize';

const prisma = new PrismaClient();

async function main() {
  console.log("Starting direct Renault database sync...");
  const syncData = await fetchRenaultPrices();
  
  let created = 0;
  let updated = 0;
  let variantsCreated = 0;
  let imagesCreated = 0;
  
  for (const incoming of syncData) {
    console.log(`Processing vehicle: ${incoming.brand} ${incoming.model}`);
    
    // Find existing vehicle by brand/model
    let vehicle = await prisma.vehicle.findFirst({
      where: {
        brand: { mode: 'insensitive', equals: incoming.brand },
        model: { mode: 'insensitive', equals: incoming.model }
      },
      include: {
        variants: true,
        syncImages: true
      }
    });
    
    if (!vehicle) {
      console.log(`Creating new vehicle: ${incoming.brand} ${incoming.model}`);
      const baseVariant = incoming.variants[0];
      const primaryImg = incoming.scrapedImages?.[0]?.url || "";
      const cleanSlug = `${slugify(incoming.brand)}-${slugify(incoming.model)}-${incoming.year}`;
      
      vehicle = await prisma.vehicle.create({
        data: {
          brand: incoming.brand,
          model: incoming.model,
          slug: cleanSlug,
          year: incoming.year,
          segment: "C-Hatchback",
          bodyType: "Hatchback",
          image: primaryImg,
          images: primaryImg ? [primaryImg] : [],
          marketStatus: "TR_YAYINDA",
          price: baseVariant?.listPrice || 0,
          otvRate: 10,
          rangeKm: baseVariant?.rangeKm || 300,
          batteryKwh: baseVariant?.batteryKwh || 40,
          motorPowerKw: baseVariant?.motorPowerKw || 90,
          motorPowerHp: baseVariant?.motorPowerHp || 120,
          acceleration: 8.0,
          topSpeed: 150,
          consumption: 15.0,
          driveType: baseVariant?.driveType || "FWD",
          isFeatured: false,
          description: `${incoming.brand} ${incoming.model} ${incoming.year} model yılı resmi teknik verileri ve donanım özellikleri.`,
          externalId: incoming.externalId,
          priceSource: incoming.source,
          priceUpdatedAt: new Date(),
        },
        include: {
          variants: true,
          syncImages: true
        }
      });
      created++;
    } else {
      console.log(`Found existing vehicle ID: ${vehicle.id}`);
      // Update externalId if null
      if (!vehicle.externalId) {
        vehicle = await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: { externalId: incoming.externalId },
          include: { variants: true, syncImages: true }
        });
      }
      updated++;
    }
    
    // Process Variants
    const activePrices = [];
    for (const incomingVar of incoming.variants) {
      const existingVar = vehicle.variants.find(
        (v) => v.externalId === incomingVar.externalId || v.name === incomingVar.name
      );
      
      const priceVal = incomingVar.campaignPrice ?? incomingVar.listPrice;
      if (priceVal > 0) activePrices.push(priceVal);
      
      if (!existingVar) {
        console.log(`  > Creating variant: ${incomingVar.name}`);
        await prisma.vehicleVariant.create({
          data: {
            vehicleId: vehicle.id,
            name: incomingVar.name,
            listPrice: incomingVar.listPrice,
            campaignPrice: incomingVar.campaignPrice,
            campaignAmount: incomingVar.campaignAmount,
            batteryKwh: incomingVar.batteryKwh,
            rangeKm: incomingVar.rangeKm,
            motorPowerKw: incomingVar.motorPowerKw,
            motorPowerHp: incomingVar.motorPowerHp,
            source: incomingVar.source,
            sourceUrl: incomingVar.sourceUrl,
            externalId: incomingVar.externalId,
            isActive: true
          }
        });
        variantsCreated++;
      } else {
        // Check if price changed
        const priceChanged = 
          existingVar.listPrice !== incomingVar.listPrice ||
          existingVar.campaignPrice !== incomingVar.campaignPrice;
          
        if (priceChanged) {
          console.log(`  > Price changed for variant ${incomingVar.name}. Creating price history...`);
          await prisma.vehiclePriceHistory.create({
            data: {
              vehicleId: vehicle.id,
              variantId: existingVar.id,
              listPrice: incomingVar.listPrice,
              campaignPrice: incomingVar.campaignPrice,
              campaignAmount: incomingVar.campaignAmount,
              previousPrice: existingVar.listPrice,
              previousCampaignPrice: existingVar.campaignPrice,
              source: incomingVar.source,
              sourceUrl: incomingVar.sourceUrl,
              changedAt: new Date()
            }
          });
          
          await prisma.vehicleVariant.update({
            where: { id: existingVar.id },
            data: {
              listPrice: incomingVar.listPrice,
              campaignPrice: incomingVar.campaignPrice,
              campaignAmount: incomingVar.campaignAmount,
              isActive: true
            }
          });
        }
      }
    }
    
    // Process Images
    if (incoming.scrapedImages) {
      for (const incomingImg of incoming.scrapedImages) {
        const existingImg = vehicle.syncImages.find(
          (img) => img.externalId === incomingImg.externalId || img.url === incomingImg.url
        );
        
        if (!existingImg) {
          console.log(`  > Adding image: ${incomingImg.url} (${incomingImg.type})`);
          await prisma.vehicleImage.create({
            data: {
              vehicleId: vehicle.id,
              url: incomingImg.url,
              type: incomingImg.type,
              alt: incomingImg.alt,
              externalId: incomingImg.externalId,
              source: incoming.source,
              status: "ACTIVE"
            }
          });
          imagesCreated++;
        }
      }
    }
    
    // Update Vehicle base price and primary images
    const minPrice = activePrices.length > 0 ? Math.min(...activePrices) : 0;
    const dbImages = await prisma.vehicleImage.findMany({
      where: { vehicleId: vehicle.id, status: "ACTIVE" }
    });
    
    // Determine cover
    const exteriorImages = dbImages.filter((img) => img.type === "exterior");
    const coverUrl = exteriorImages.length > 0 ? exteriorImages[0].url : (dbImages[0]?.url || vehicle.image);
    const imageUrls = dbImages.map((img) => img.url);
    
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: {
        price: minPrice,
        image: coverUrl,
        images: imageUrls.length > 0 ? imageUrls : (coverUrl ? [coverUrl] : [])
      }
    });
  }
  
  console.log("Direct Renault sync finished!");
  console.log(`Summary: Vehicles Created=${created}, Updated=${updated}, Variants Created=${variantsCreated}, Images Created=${imagesCreated}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

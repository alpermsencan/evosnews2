import { prisma } from "@/lib/prisma";
import { fetchKiaPrices } from "./sources/kia";
import { fetchHyundaiPrices } from "./sources/hyundai";
import { hasPriceChanged } from "./change-detector";
import { createPriceHistory } from "./price-history";
import { normalizeText, slugify } from "./normalize";
import type { VehicleSyncData, SyncResult } from "./types";
import { touchVehicles } from "@/lib/revalidate";
import { uploadImageFromUrl, isCloudinaryReady } from "@/lib/cloudinary";

/**
 * Runs pricing and package/image synchronization for a given brand source.
 */
export async function syncBrandVehicles(sourceName: string): Promise<SyncResult> {
  const startedAt = Date.now();
  let fetched = 0;
  let created = 0;
  let updated = 0;
  let skipped = 0;
  let unchanged = 0;
  let failed = 0;

  // Image sync metrics
  let imagesFound = 0;
  let imagesUploaded = 0;
  let imagesUpdated = 0;
  let imagesUnchanged = 0;
  let imagesSkipped = 0;
  let imageErrors = 0;

  try {
    let syncData: VehicleSyncData[] = [];

    if (sourceName === "kia-official") {
      syncData = await fetchKiaPrices();
    } else if (sourceName === "hyundai-official") {
      syncData = await fetchHyundaiPrices();
    } else {
      throw new Error(`Unsupported brand source: ${sourceName}`);
    }

    fetched = syncData.reduce((acc, curr) => acc + curr.variants.length, 0);

    // Get all vehicles for this brand in database to match against
    const dbVehicles = await prisma.vehicle.findMany({
      where: {
        brand: {
          equals: sourceName.split("-")[0], // e.g. "kia" from "kia-official"
          mode: "insensitive",
        },
      },
      include: {
        variants: true,
        syncImages: true,
      },
    });

    for (const incomingVehicle of syncData) {
      // 1. Vehicle Matching
      let matchedVehicle = dbVehicles.find((v) => v.externalId === incomingVehicle.externalId);

      if (!matchedVehicle) {
        matchedVehicle = dbVehicles.find(
          (v) =>
            v.brand.toLowerCase() === incomingVehicle.brand.toLowerCase() &&
            v.model.toLowerCase() === incomingVehicle.model.toLowerCase()
        );
      }

      if (!matchedVehicle) {
        matchedVehicle = dbVehicles.find(
          (v) =>
            normalizeText(v.model) === normalizeText(incomingVehicle.model)
        );
      }

      if (!matchedVehicle) {
        console.log(`[SYNC][SKIP] vehicle_not_found: ${incomingVehicle.brand} ${incomingVehicle.model}`);
        skipped += incomingVehicle.variants.length;
        if (incomingVehicle.scrapedImages) {
          imagesSkipped += incomingVehicle.scrapedImages.length;
        }
        continue;
      }

      // If matched and externalId is missing on vehicle, let's update it for future stability
      if (!matchedVehicle.externalId) {
        await prisma.vehicle.update({
          where: { id: matchedVehicle.id },
          data: { externalId: incomingVehicle.externalId },
        });
        matchedVehicle.externalId = incomingVehicle.externalId;
      }

      // 2. Process Variants for this Vehicle
      const updatedVariantPrices: number[] = [];

      for (const incomingVariant of incomingVehicle.variants) {
        try {
          const existingVariant = matchedVehicle.variants.find(
            (v) => v.externalId === incomingVariant.externalId || v.name === incomingVariant.name
          );

          if (!existingVariant) {
            // Create new variant
            const newVar = await prisma.vehicleVariant.create({
              data: {
                vehicleId: matchedVehicle.id,
                name: incomingVariant.name,
                listPrice: incomingVariant.listPrice,
                campaignPrice: incomingVariant.campaignPrice,
                campaignAmount: incomingVariant.campaignAmount,
                batteryKwh: incomingVariant.batteryKwh,
                rangeKm: incomingVariant.rangeKm,
                motorPowerKw: incomingVariant.motorPowerKw,
                motorPowerHp: incomingVariant.motorPowerHp,
                source: incomingVariant.source,
                sourceUrl: incomingVariant.sourceUrl,
                externalId: incomingVariant.externalId,
                isActive: true,
              },
            });
            created++;
            const priceVal = newVar.campaignPrice ?? newVar.listPrice;
            if (priceVal > 0) updatedVariantPrices.push(priceVal);
          } else {
            // Check if price changed
            const priceChanged = hasPriceChanged(
              {
                listPrice: existingVariant.listPrice,
                campaignPrice: existingVariant.campaignPrice,
                campaignAmount: existingVariant.campaignAmount,
              },
              {
                listPrice: incomingVariant.listPrice,
                campaignPrice: incomingVariant.campaignPrice,
                campaignAmount: incomingVariant.campaignAmount,
              }
            );

            if (priceChanged) {
              // Create Price History
              await createPriceHistory({
                vehicleId: matchedVehicle.id,
                variantId: existingVariant.id,
                listPrice: incomingVariant.listPrice,
                campaignPrice: incomingVariant.campaignPrice,
                campaignAmount: incomingVariant.campaignAmount,
                previousPrice: existingVariant.listPrice,
                previousCampaignPrice: existingVariant.campaignPrice,
                source: incomingVariant.source,
                sourceUrl: incomingVariant.sourceUrl,
              });

              // Update Variant
              await prisma.vehicleVariant.update({
                where: { id: existingVariant.id },
                data: {
                  listPrice: incomingVariant.listPrice,
                  campaignPrice: incomingVariant.campaignPrice,
                  campaignAmount: incomingVariant.campaignAmount,
                  batteryKwh: incomingVariant.batteryKwh ?? existingVariant.batteryKwh,
                  rangeKm: incomingVariant.rangeKm ?? existingVariant.rangeKm,
                  motorPowerKw: incomingVariant.motorPowerKw ?? existingVariant.motorPowerKw,
                  motorPowerHp: incomingVariant.motorPowerHp ?? existingVariant.motorPowerHp,
                  sourceUrl: incomingVariant.sourceUrl,
                  isActive: true,
                },
              });
              updated++;
              const priceVal = incomingVariant.campaignPrice ?? incomingVariant.listPrice;
              if (priceVal > 0) updatedVariantPrices.push(priceVal);
            } else {
              // No change
              await prisma.vehicleVariant.update({
                where: { id: existingVariant.id },
                data: {
                  isActive: true,
                },
              });
              unchanged++;
              const priceVal = existingVariant.campaignPrice ?? existingVariant.listPrice;
              if (priceVal > 0) updatedVariantPrices.push(priceVal);
            }
          }
        } catch (err) {
          console.error(`[SYNC][ERROR] Variant sync failed: ${incomingVariant.name}`, err);
          failed++;
        }
      }

      // Update base vehicle price
      const validPrices = updatedVariantPrices.filter((p) => p > 0);
      if (validPrices.length > 0) {
        const minPrice = Math.min(...validPrices);
        await prisma.vehicle.update({
          where: { id: matchedVehicle.id },
          data: {
            price: minPrice,
            priceSource: sourceName,
            priceUpdatedAt: new Date(),
          },
        });
      }

      // 3. Process Images for this Vehicle
      if (incomingVehicle.scrapedImages && incomingVehicle.scrapedImages.length > 0) {
        imagesFound += incomingVehicle.scrapedImages.length;

        const syncedImagesUrls: string[] = [];
        let newPrimaryUrl: string | null = null;

        for (let idx = 0; idx < incomingVehicle.scrapedImages.length; idx++) {
          const incomingImg = incomingVehicle.scrapedImages[idx];
          const isPrimaryCandidate = idx === 0; // The first image is the pricing thumbnail (ideal primary candidate)

          try {
            const existingImg = matchedVehicle.syncImages.find(
              (img) => img.externalId === incomingImg.externalId
            );

            if (!existingImg) {
              if (isCloudinaryReady) {
                // Upload to Cloudinary
                const uploadRes = await uploadImageFromUrl(incomingImg.url);

                const createdImg = await prisma.vehicleImage.create({
                  data: {
                    vehicleId: matchedVehicle.id,
                    url: uploadRes.url,
                    cloudinaryPublicId: uploadRes.publicId,
                    type: incomingImg.type,
                    alt: incomingImg.alt,
                    source: "kia-official",
                    sourceUrl: incomingImg.url,
                    externalId: incomingImg.externalId,
                    isPrimary: isPrimaryCandidate,
                  },
                });

                imagesUploaded++;
                syncedImagesUrls.push(createdImg.url);
                if (isPrimaryCandidate) newPrimaryUrl = createdImg.url;
              } else {
                imagesSkipped++;
              }
            } else {
              // Existing image found: check if source URL changed
              if (existingImg.sourceUrl !== incomingImg.url) {
                if (isCloudinaryReady) {
                  // Upload new URL to Cloudinary (leave old one untouched in Cloudinary)
                  const uploadRes = await uploadImageFromUrl(incomingImg.url);

                  const updatedImg = await prisma.vehicleImage.update({
                    where: { id: existingImg.id },
                    data: {
                      url: uploadRes.url,
                      cloudinaryPublicId: uploadRes.publicId,
                      sourceUrl: incomingImg.url,
                      isPrimary: isPrimaryCandidate,
                    },
                  });

                  imagesUpdated++;
                  syncedImagesUrls.push(updatedImg.url);
                  if (isPrimaryCandidate) newPrimaryUrl = updatedImg.url;
                } else {
                  imagesSkipped++;
                }
              } else {
                // Unchanged
                await prisma.vehicleImage.update({
                  where: { id: existingImg.id },
                  data: {
                    isPrimary: isPrimaryCandidate,
                  },
                });

                imagesUnchanged++;
                syncedImagesUrls.push(existingImg.url);
                if (isPrimaryCandidate) newPrimaryUrl = existingImg.url;
              }
            }
          } catch (err) {
            console.error(`[SYNC][ERROR] Image sync failed: ${incomingImg.url}`, err);
            imageErrors++;
          }
        }

        // 4. Safe Primary Image update on Vehicle
        // Check if the current vehicle primary image is a manual/custom image
        // A manual image is one that is NOT empty/placeholder and does NOT match any of our synced URLs.
        const currentPrimaryUrl = matchedVehicle.image;
        const allSyncedUrls = matchedVehicle.syncImages.map((img) => img.url);

        const isCurrentPrimaryPlaceholder =
          !currentPrimaryUrl ||
          currentPrimaryUrl === "/arac-placeholder.svg" ||
          currentPrimaryUrl.trim() === "";

        const isCurrentPrimarySynced = allSyncedUrls.includes(currentPrimaryUrl);

        const canUpdatePrimary = isCurrentPrimaryPlaceholder || isCurrentPrimarySynced;

        // Build list of unique extra images (combining manual and synced ones)
        const currentImages = matchedVehicle.images || [];
        const manualImages = currentImages.filter((img) => !allSyncedUrls.includes(img));
        const updatedImages = [...new Set([...manualImages, ...syncedImagesUrls])];

        const updateData: { image?: string; images: string[] } = {
          images: updatedImages,
        };

        if (canUpdatePrimary && newPrimaryUrl) {
          updateData.image = newPrimaryUrl;
        }

        await prisma.vehicle.update({
          where: { id: matchedVehicle.id },
          data: updateData,
        });
      }
    }

    // Touch cache to invalidate static pages
    touchVehicles();

    return {
      source: sourceName,
      status: "ok",
      fetched,
      created,
      updated,
      skipped,
      unchanged,
      failed,
      imagesFound,
      imagesUploaded,
      imagesUpdated,
      imagesUnchanged,
      imagesSkipped,
      imageErrors,
      durationMs: Date.now() - startedAt,
    };
  } catch (error) {
    console.error(`[SYNC][ERROR] Brand sync crashed: ${sourceName}`, error);
    return {
      source: sourceName,
      status: "error",
      fetched,
      created,
      updated,
      skipped,
      unchanged: 0,
      failed,
      imagesFound,
      imagesUploaded,
      imagesUpdated,
      imagesUnchanged,
      imagesSkipped,
      imageErrors,
      durationMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : "Brand sync crashed",
    };
  }
}

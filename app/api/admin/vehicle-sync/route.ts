import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/admin-auth";
import { syncBrandVehicles } from "@/lib/vehicle-sync";

export const dynamic = "force-dynamic";

async function isAuthorized(req: NextRequest) {
  const adminCookie = req.cookies.get(ADMIN_COOKIE)?.value;
  return isAdminCookie(adminCookie);
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return fail("Yetkisiz erişim", 401);
  }

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(5, Math.min(50, parseInt(searchParams.get("limit") || "20", 10)));
  const skip = (page - 1) * limit;

  try {
    const brands = ["Kia", "Hyundai", "Togg", "BYD", "Tesla"];
    const sources = ["kia-official", "hyundai-official", "togg-official", "byd-official", "tesla-official"];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalVehicles,
      totalVariants,
      totalImages,
      totalCloudinaryImages,
      lastSuccessfulSync,
      lastErrorSync,
      todaySyncsCount,
      syncLogs,
      totalSyncLogs,
      priceHistories,
      brandLogs,
      variantsByBrand,
      imagesByBrand,
    ] = await Promise.all([
      // Total vehicles
      prisma.vehicle.count({
        where: { brand: { in: brands, mode: "insensitive" } },
      }),
      // Total variants
      prisma.vehicleVariant.count({
        where: { source: { in: sources } },
      }),
      // Total images
      prisma.vehicleImage.count({
        where: { source: { in: sources } },
      }),
      // Total cloudinary images
      prisma.vehicleImage.count({
        where: {
          source: { in: sources },
          cloudinaryPublicId: { not: "" },
        },
      }),
      // Last successful sync
      prisma.vehicleSyncLog.findFirst({
        where: { status: "SUCCESS" },
        orderBy: { startedAt: "desc" },
      }),
      // Last failed sync
      prisma.vehicleSyncLog.findFirst({
        where: { status: "FAILED" },
        orderBy: { startedAt: "desc" },
      }),
      // Today successful syncs count
      prisma.vehicleSyncLog.count({
        where: {
          status: "SUCCESS",
          startedAt: { gte: todayStart },
        },
      }),
      // Paginated logs
      prisma.vehicleSyncLog.findMany({
        orderBy: { startedAt: "desc" },
        skip,
        take: limit,
      }),
      // Total logs count for pagination
      prisma.vehicleSyncLog.count(),
      // Recent price history changes
      prisma.vehiclePriceHistory.findMany({
        orderBy: { recordedAt: "desc" },
        take: 20,
        include: {
          variant: {
            select: {
              name: true,
              batteryKwh: true,
              rangeKm: true,
            },
          },
        },
      }),
      // Latest log per source
      Promise.all(
        sources.map((s) =>
          prisma.vehicleSyncLog.findFirst({
            where: { source: s },
            orderBy: { startedAt: "desc" },
          })
        )
      ),
      // Variants count per brand
      Promise.all(
        brands.map((b) =>
          prisma.vehicleVariant.count({
            where: { vehicle: { brand: { equals: b, mode: "insensitive" } } },
          })
        )
      ),
      // Images count per brand
      Promise.all(
        brands.map((b) =>
          prisma.vehicleImage.count({
            where: { vehicle: { brand: { equals: b, mode: "insensitive" } } },
          })
        )
      ),
    ]);

    // Attach vehicle details to priceHistories
    const vehicleIds = [...new Set(priceHistories.map((h) => h.vehicleId))];
    const vehicles = await prisma.vehicle.findMany({
      where: { id: { in: vehicleIds } },
      select: { id: true, brand: true, model: true, slug: true },
    });
    const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

    const enrichedPriceHistories = priceHistories.map((h) => ({
      id: h.id,
      vehicleId: h.vehicleId,
      variantId: h.variantId,
      vehicleBrand: vehicleMap.get(h.vehicleId)?.brand ?? "—",
      vehicleModel: vehicleMap.get(h.vehicleId)?.model ?? "—",
      variantName: h.variant?.name ?? "—",
      listPrice: h.listPrice,
      previousPrice: h.previousPrice,
      priceDiff: h.previousPrice ? h.listPrice - h.previousPrice : 0,
      campaignPrice: h.campaignPrice,
      previousCampaignPrice: h.previousCampaignPrice,
      campaignDiff:
        h.campaignPrice && h.previousCampaignPrice
          ? h.campaignPrice - h.previousCampaignPrice
          : null,
      source: h.source,
      sourceUrl: h.sourceUrl,
      recordedAt: h.recordedAt,
    }));

    const brandStatuses = brands.map((brandName, idx) => {
      const source = sources[idx];
      const lastLog = brandLogs[idx];
      const variantCount = variantsByBrand[idx];
      const imageCount = imagesByBrand[idx];

      return {
        brand: brandName,
        source,
        variantCount,
        imageCount,
        lastSync: lastLog
          ? {
              status: lastLog.status,
              triggerType: lastLog.triggerType,
              startedAt: lastLog.startedAt,
              completedAt: lastLog.completedAt,
              durationMs: lastLog.durationMs,
              fetched: lastLog.fetched,
              created: lastLog.created,
              updated: lastLog.updated,
              unchanged: lastLog.unchanged,
              imagesFound: lastLog.imagesFound,
              imagesUploaded: lastLog.imagesUploaded,
              imagesUnchanged: lastLog.imagesUnchanged,
              imageErrors: lastLog.imageErrors,
              errorMessage: lastLog.errorMessage,
            }
          : null,
      };
    });

    return ok({
      summary: {
        totalBrands: brands.length,
        activeBrands: brands.length,
        totalVehicles,
        totalVariants,
        totalImages,
        totalCloudinaryImages,
        lastSuccessfulSync: lastSuccessfulSync?.startedAt ?? null,
        lastErrorSync: lastErrorSync
          ? {
              source: lastErrorSync.source,
              errorMessage: lastErrorSync.errorMessage,
              startedAt: lastErrorSync.startedAt,
            }
          : null,
        todaySyncsCount,
      },
      brandStatuses,
      priceHistories: enrichedPriceHistories,
      syncLogs,
      pagination: {
        page,
        limit,
        total: totalSyncLogs,
        totalPages: Math.ceil(totalSyncLogs / limit),
      },
    });
  } catch (err) {
    console.error("[API][ADMIN][VEHICLE_SYNC] Failed to fetch sync dashboard data:", err);
    return fail(err instanceof Error ? err.message : "Dashboard verileri alınamadı", 500);
  }
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return fail("Yetkisiz erişim", 401);
  }

  try {
    const body = await req.json();
    const brand = String(body.brand || "").toLowerCase().trim();

    const allowedSources: Record<string, string> = {
      kia: "kia-official",
      hyundai: "hyundai-official",
      togg: "togg-official",
      byd: "byd-official",
      tesla: "tesla-official",
    };

    const sourceName = allowedSources[brand];
    if (!sourceName) {
      return fail(`Desteklenmeyen marka: ${brand}. Geçerli markalar: kia, hyundai, togg, byd, tesla`, 400);
    }

    const result = await syncBrandVehicles(sourceName, "MANUAL");
    return ok({
      brand,
      source: sourceName,
      result,
    });
  } catch (err) {
    console.error("[API][ADMIN][VEHICLE_SYNC] Manual sync trigger failed:", err);
    return fail(err instanceof Error ? err.message : "Manuel senkronizasyon başarısız", 500);
  }
}

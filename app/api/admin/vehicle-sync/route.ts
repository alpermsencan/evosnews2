import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, isAdminCookie, isAdminRequest } from "@/lib/admin-auth";
import { SESSION_COOKIE, verifySession } from "@/lib/session";
import { syncBrandVehicles } from "@/lib/vehicle-sync";

export const dynamic = "force-dynamic";

async function isAuthorized(req: NextRequest) {
  try {
    if (await isAdminRequest(req)) return true;
    const adminCookie = req.cookies.get(ADMIN_COOKIE)?.value;
    if (await isAdminCookie(adminCookie)) return true;

    const sessionCookie = req.cookies.get(SESSION_COOKIE)?.value;
    if (sessionCookie) {
      const session = await verifySession(sessionCookie);
      if (session && ["ADMIN", "admin", "YONETICI", "yonetici"].includes(session.role)) {
        return true;
      }
    }
    // Geliştirme ortamında admin erişimine tolerans tanı
    if (process.env.NODE_ENV !== "production") {
      return true;
    }
  } catch (e) {
    console.error("[API][ADMIN][VEHICLE_SYNC] Auth check error:", e);
  }
  return false;
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
    const brands = ["Kia", "Hyundai", "Togg", "BYD", "Tesla", "Renault"];
    const sources = ["kia-official", "hyundai-official", "togg-official", "byd-official", "tesla-official", "renault-official"];

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
        where: { brand: { in: brands } },
      }).catch(() => 0),
      // Total variants
      prisma.vehicleVariant.count({
        where: { source: { in: sources } },
      }).catch(() => 0),
      // Total images
      prisma.vehicleImage.count({
        where: { source: { in: sources } },
      }).catch(() => 0),
      // Total cloudinary images
      prisma.vehicleImage.count({
        where: {
          source: { in: sources },
          cloudinaryPublicId: { not: "" },
        },
      }).catch(() => 0),
      // Last successful sync
      prisma.vehicleSyncLog.findFirst({
        where: { status: "SUCCESS" },
        orderBy: { startedAt: "desc" },
      }).catch(() => null),
      // Last failed sync
      prisma.vehicleSyncLog.findFirst({
        where: { status: "FAILED" },
        orderBy: { startedAt: "desc" },
      }).catch(() => null),
      // Today successful syncs count
      prisma.vehicleSyncLog.count({
        where: {
          status: "SUCCESS",
          startedAt: { gte: todayStart },
        },
      }).catch(() => 0),
      // Paginated logs
      prisma.vehicleSyncLog.findMany({
        orderBy: { startedAt: "desc" },
        skip,
        take: limit,
      }).catch(() => []),
      // Total logs count for pagination
      prisma.vehicleSyncLog.count().catch(() => 0),
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
      }).catch(() => []),
      // Latest log per source
      Promise.all(
        sources.map((s) =>
          prisma.vehicleSyncLog.findFirst({
            where: { source: s },
            orderBy: { startedAt: "desc" },
          }).catch(() => null)
        )
      ),
      // Variants count per brand
      Promise.all(
        brands.map((b) =>
          prisma.vehicleVariant.count({
            where: { source: `${b.toLowerCase()}-official` },
          }).catch(() => 0)
        )
      ),
      // Images count per brand
      Promise.all(
        brands.map((b) =>
          prisma.vehicleImage.count({
            where: { source: `${b.toLowerCase()}-official` },
          }).catch(() => 0)
        )
      ),
    ]);

    // Attach vehicle details to priceHistories
    const rawVehicleIds = [...new Set((priceHistories || []).map((h) => h.vehicleId))];
    const validVehicleIds = rawVehicleIds.filter((id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id));
    const vehicles = validVehicleIds.length > 0
      ? await prisma.vehicle.findMany({
          where: { id: { in: validVehicleIds } },
          select: { id: true, brand: true, model: true, slug: true },
        }).catch(() => [])
      : [];
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
      renault: "renault-official",
    };

    if (brand === "all") {
      const results: Record<string, unknown> = {};
      for (const [b, src] of Object.entries(allowedSources)) {
        try {
          results[b] = await syncBrandVehicles(src, "MANUAL");
        } catch (e) {
          results[b] = { status: "error", message: e instanceof Error ? e.message : String(e) };
        }
      }
      return ok({
        brand: "all",
        results,
      });
    }

    const sourceName = allowedSources[brand];
    if (!sourceName) {
      return fail(`Desteklenmeyen marka: ${brand}. Geçerli markalar: kia, hyundai, togg, byd, tesla, renault, all`, 400);
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

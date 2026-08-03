import { prisma } from "@/lib/prisma";
import { handle } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const [index, tickers, vehicleStats] = await Promise.all([
      prisma.priceIndex.findMany({ orderBy: { order: "asc" } }),
      prisma.ticker.findMany({ orderBy: { order: "asc" } }),
      prisma.vehicle.aggregate({
        _avg: { price: true, rangeKm: true, batteryKwh: true, consumption: true },
        _min: { price: true },
        _max: { price: true },
        _count: true,
      }),
    ]);

    const first = index[0];
    const last = index[index.length - 1];

    return {
      index,
      tickers,
      stats: {
        vehicleCount: vehicleStats._count,
        avgPrice: Math.round(vehicleStats._avg.price ?? 0),
        minPrice: vehicleStats._min.price ?? 0,
        maxPrice: vehicleStats._max.price ?? 0,
        avgRange: Math.round(vehicleStats._avg.rangeKm ?? 0),
        avgBattery: Number((vehicleStats._avg.batteryKwh ?? 0).toFixed(1)),
        avgConsumption: Number((vehicleStats._avg.consumption ?? 0).toFixed(1)),
        yearlyChangePct:
          first && last
            ? Number(
                (((last.avgEvPrice - first.avgEvPrice) / first.avgEvPrice) * 100).toFixed(1)
              )
            : 0,
      },
    };
  });
}

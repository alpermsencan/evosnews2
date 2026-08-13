import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { upsertBatteryReport, verifyBatteryReport } from "@/lib/listings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Batarya raporu uçları. Yalnızca yönetici erişebilir (middleware korur):
 * ölçümü yetkili servis/ekspertiz girer, panel operatörü kaydeder.
 *
 * Kalan ömür ve risk seviyesi GÖVDEDEN OKUNMAZ — ölçümlerden sunucuda
 * hesaplanır (bkz. lib/battery-report.ts). Bu alanları dışarıdan kabul etmek,
 * her rapora "risk: düşük" yazılmasının önünü açardı.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const b = await req.json();

    const soh = Number(b.sohPercent);
    if (!Number.isFinite(soh) || soh <= 0 || soh > 100) {
      return fail("SOH değeri 0-100 arasında olmalıdır");
    }
    if (!b.measuredBy) return fail("Ölçümü yapan kurum zorunludur");

    const measuredAt = b.measuredAt ? new Date(b.measuredAt) : new Date();
    if (Number.isNaN(measuredAt.getTime())) return fail("Geçersiz ölçüm tarihi");

    const num = (v: unknown) => {
      const n = Number(v);
      return v === "" || v == null || !Number.isFinite(n) || n < 0 ? null : Math.round(n);
    };

    const { report, assessment } = await upsertBatteryReport(id, {
      sohPercent: soh,
      cycleCount: num(b.cycleCount),
      fastChargeRatio: num(b.fastChargeRatio),
      odometerKm: num(b.odometerKm),
      measuredBy: String(b.measuredBy).slice(0, 120),
      measuredAt,
    });

    return ok({ report, assessment }, 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Rapor kaydedilemedi", 500);
  }
}

/** PUT — raporu doğrular; rozet ve puan etkisi ancak bundan sonra devreye girer. */
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const b = await req.json().catch(() => ({}));
    const report = await verifyBatteryReport(id, b.verifiedBy || "Evos");
    return ok({ report });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Doğrulanamadı", 500);
  }
}

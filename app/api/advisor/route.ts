import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";

export const dynamic = "force-dynamic";

/**
 * POST /api/advisor
 * body: { budget, dailyKm, longTripPerMonth, homeCharging, bodyType, priority }
 * Veritabanındaki araçları puanlayıp 5 yıllık toplam maliyetle birlikte önerir.
 */
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const budget = Number(b.budget) || 2_000_000;
    const dailyKm = Number(b.dailyKm) || 50;
    const longTrips = Number(b.longTripPerMonth) || 1;
    const homeCharging = b.homeCharging !== false;
    const bodyType = b.bodyType && b.bodyType !== "farketmez" ? b.bodyType : null;
    const priority = b.priority || "denge"; // menzil | fiyat | performans | denge

    const [vehicles, priceIndex] = await Promise.all([
      prisma.vehicle.findMany({
        where: {
          price: { lte: Math.round(budget * 1.08) },
          ...(bodyType ? { bodyType } : {}),
        },
      }),
      prisma.priceIndex.findMany({ orderBy: { order: "desc" }, take: 1 }),
    ]);

    if (vehicles.length === 0)
      return ok({
        results: [],
        message:
          "Bu bütçe ve kasa tipine uygun araç bulunamadı. Bütçeyi artırmayı veya kasa tipi filtresini kaldırmayı deneyin.",
      });

    const rates = priceIndex[0];
    const acCost = rates?.acChargeCost ?? 7.9;
    const dcCost = rates?.dcChargeCost ?? 11.4;
    const fuelCost100 = rates?.fuelCost ?? 50;
    const homeCost = 2.8; // ev gece tarifesi ₺/kWh

    const yearlyKm = dailyKm * 365;
    const longTripKm = longTrips * 12 * 600;
    const totalYearlyKm = yearlyKm + longTripKm;

    const maxRange = Math.max(...vehicles.map((v) => v.rangeKm));
    const minPrice = Math.min(...vehicles.map((v) => v.price));

    const results = vehicles
      .map((v) => {
        // Şarj karışımı: evde şarj varsa %75 ev / %25 DC, yoksa %35 AC / %65 DC
        const perKwh = homeCharging
          ? homeCost * 0.75 + dcCost * 0.25
          : acCost * 0.35 + dcCost * 0.65;

        const yearlyEnergyKwh = (totalYearlyKm / 100) * v.consumption;
        const yearlyEnergyCost = Math.round(yearlyEnergyKwh * perKwh);
        const yearlyMaintenance = Math.round(v.price * 0.006 + 9000);
        const fiveYearRunning = (yearlyEnergyCost + yearlyMaintenance) * 5;
        const depreciation = Math.round(v.price * 0.42);
        const fiveYearTotal = fiveYearRunning + depreciation;

        // Benzinli eşdeğerine göre yıllık tasarruf
        const iceYearlyFuel = Math.round((totalYearlyKm / 100) * fuelCost100 * 2.1);
        const yearlySaving = iceYearlyFuel - yearlyEnergyCost;

        // Skorlama (0-100)
        // DC şarj gücü ve editör puanı her araçta dolu olmayabilir (operatör
        // panelden girer). Eksik ölçüt için varsayılan bir değer uydurmak
        // sıralamayı bozar; onun yerine ölçüt devre dışı bırakılır ve ağırlığı
        // aşağıda kalan ölçütlere orantılı olarak dağıtılır.
        const rangeScore = (v.rangeKm / maxRange) * 100;
        const priceScore = (minPrice / v.price) * 100;
        const perfScore = Math.max(0, 100 - (v.acceleration - 3.5) * 12);
        const chargeScore =
          v.dcChargeKw != null ? Math.min(100, (v.dcChargeKw / 250) * 100) : null;
        const ratingScore = v.rating != null ? (v.rating / 5) * 100 : null;
        const budgetFit = v.price <= budget ? 100 : 70;

        // Günlük kullanım menzil yeterliliği
        const dailyFit =
          v.rangeKm * 0.8 >= dailyKm * 2 ? 100 : (v.rangeKm * 0.8) / (dailyKm * 2) * 100;

        const weights =
          priority === "menzil"
            ? { rangeScore: 0.32, priceScore: 0.14, perfScore: 0.08, chargeScore: 0.2, ratingScore: 0.13, dailyFit: 0.13 }
            : priority === "fiyat"
            ? { rangeScore: 0.14, priceScore: 0.38, perfScore: 0.05, chargeScore: 0.1, ratingScore: 0.15, dailyFit: 0.18 }
            : priority === "performans"
            ? { rangeScore: 0.16, priceScore: 0.1, perfScore: 0.34, chargeScore: 0.18, ratingScore: 0.14, dailyFit: 0.08 }
            : { rangeScore: 0.22, priceScore: 0.22, perfScore: 0.14, chargeScore: 0.16, ratingScore: 0.14, dailyFit: 0.12 };

        const parts: [number | null, number][] = [
          [rangeScore, weights.rangeScore],
          [priceScore, weights.priceScore],
          [perfScore, weights.perfScore],
          [chargeScore, weights.chargeScore],
          [ratingScore, weights.ratingScore],
          [dailyFit, weights.dailyFit],
        ];

        const usable = parts.filter((p): p is [number, number] => p[0] != null);
        // Kullanılan ağırlıkların toplamı 1 olacak şekilde normalize edilir;
        // böylece verisi eksik araçlar haksız yere düşük puan almaz.
        const weightSum = usable.reduce((sum, [, w]) => sum + w, 0) || 1;
        const score =
          (usable.reduce((sum, [value, w]) => sum + value * w, 0) / weightSum) *
          (budgetFit / 100);

        const reasons: string[] = [];
        if (v.rangeKm >= 500) reasons.push(`${v.rangeKm} km menzil ile uzun yolda mola ihtiyacını azaltır`);
        if (v.dcChargeKw != null && v.dcChargeKw >= 150)
          reasons.push(`${v.dcChargeKw} kW DC şarj gücü ile molalar kısalır`);
        if (v.price <= budget * 0.9) reasons.push("Bütçenizin altında kalarak ek donanım payı bırakır");
        if (v.acceleration <= 5) reasons.push(`0-100 km/s ${v.acceleration} sn ile segmentinde hızlı`);
        if (v.consumption <= 15.5) reasons.push(`${v.consumption} kWh/100 km tüketimle işletme maliyeti düşük`);
        if (homeCharging) reasons.push("Ev şarjı ile kilometre maliyetiniz belirgin şekilde düşer");
        if (dailyFit >= 100) reasons.push("Günlük kullanımınız için haftada tek şarj yeterli olur");

        return {
          id: v.id,
          brand: v.brand,
          model: v.model,
          slug: v.slug,
          image: v.image,
          price: v.price,
          rangeKm: v.rangeKm,
          batteryKwh: v.batteryKwh,
          dcChargeKw: v.dcChargeKw,
          acceleration: v.acceleration,
          consumption: v.consumption,
          segment: v.segment,
          bodyType: v.bodyType,
          rating: v.rating,
          score: Number(score.toFixed(1)),
          costs: {
            yearlyEnergyCost,
            yearlyMaintenance,
            yearlySaving,
            fiveYearTotal,
            perKmCost: Number(((v.consumption / 100) * perKwh).toFixed(2)),
            weeklyCharges: Number(((dailyKm * 7) / (v.rangeKm * 0.85)).toFixed(1)),
          },
          reasons: reasons.slice(0, 4),
        };
      })
      .sort((a, b2) => b2.score - a.score)
      .slice(0, 6);

    return ok({
      results,
      inputs: { budget, dailyKm, longTrips, homeCharging, bodyType, priority },
      assumptions: {
        chargeMixNote: homeCharging
          ? "Şarjın %75'i evde, %25'i DC hızlı şarjda varsayıldı."
          : "Şarjın %35'i halka açık AC, %65'i DC hızlı şarjda varsayıldı.",
        yearlyKm: totalYearlyKm,
        acCost,
        dcCost,
        homeCost,
      },
    });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Öneri üretilemedi", 500);
  }
}

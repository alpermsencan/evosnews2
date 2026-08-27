import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api";
import { haversineKm } from "@/lib/geo";
import { fetchWithRetry } from "@/lib/ingest/http";
import { buildTariffIndex, matchTariff } from "@/lib/tariffs";

export const dynamic = "force-dynamic";

const ORS_ENDPOINT = "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

type Point = [number, number]; // [lng, lat]

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const fromLat = Number(sp.get("fromLat"));
  const fromLng = Number(sp.get("fromLng"));
  const toLat = Number(sp.get("toLat"));
  const toLng = Number(sp.get("toLng"));
  const vehicleId = sp.get("vehicleId");

  if (!fromLat || !fromLng || !toLat || !toLng) {
    return fail("Geçerli başlangıç ve varış koordinatları gereklidir.", 400);
  }

  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  const isMock = !apiKey || apiKey === "none" || apiKey === "mock" || apiKey === "false" || apiKey.trim() === "";
  let distanceKm = 0;
  let durationMin = 0;
  let geometry: Point[] = [];

  try {
    if (isMock) {
      // Çevrimdışı/Yedek Rota Hesaplayıcı
      const steps = 40;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Kavisli, gerçekçi bir rota hattı çizelim (hafifçe büküyoruz ki dümdüz görünmesin)
        const bend = Math.sin(t * Math.PI) * 0.03;
        const lat = fromLat + (toLat - fromLat) * t + bend;
        const lng = fromLng + (toLng - fromLng) * t - bend;
        geometry.push([lng, lat]);
      }
      const directDist = haversineKm(fromLat, fromLng, toLat, toLng);
      distanceKm = Number((directDist * 1.22).toFixed(1)); // Otoyol kıvrım payı
      durationMin = Math.round(distanceKm * 0.7); // Ortalama 85 km/h hız ile tahmini süre
    } else {
      // 1. OpenRouteService ile rotayı çek
      const routeRes = await fetchWithRetry(ORS_ENDPOINT, {
        method: "POST",
        timeoutMs: 15_000,
        headers: {
          authorization: apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          coordinates: [
            [fromLng, fromLat],
            [toLng, toLat],
          ],
          instructions: false,
        }),
      });

      const routeData = await routeRes.json();
      const feature = routeData.features?.[0];
      const summary = feature?.properties?.summary;
      geometry = feature?.geometry?.coordinates || [];

      if (!summary?.distance || !geometry?.length) {
        return fail("Rota hesaplanamadı.", 400);
      }

      distanceKm = Number((summary.distance / 1000).toFixed(1));
      durationMin = summary.duration ? Math.round(summary.duration / 60) : 0;
    }

    // 2. Seçili aracın verilerini getir
    let vehicle = null;
    if (vehicleId) {
      vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    }

    // Varsayılan tüketim: 18 kWh/100 km, Pil: 70 kWh
    const consumptionKwh100 = vehicle?.consumption || 18.0;
    const batteryCapacityKwh = vehicle?.batteryKwh || 70.0;
    const vehicleRangeWltp = vehicle?.rangeKm || 400;

    const totalEnergyRequiredKwh = (distanceKm / 100) * consumptionKwh100;

    // 3. Veritabanındaki tüm şarj istasyonlarını getir ve rotaya yakınlığına göre filtrele
    const stations = await prisma.chargeStation.findMany({
      where: { status: "aktif" },
    });

    // Rota çizgisi üzerindeki koordinatları örnekle (performans için her 10. noktayı al)
    const sampledRoutePoints = geometry.filter((_, idx) => idx % 10 === 0);

    // Her istasyon için rotaya olan minimum mesafeyi bul
    const nearbyStations = stations
      .map((station) => {
        let minDistance = Infinity;
        for (const pt of sampledRoutePoints) {
          const dist = haversineKm(pt[1], pt[0], station.lat, station.lng);
          if (dist < minDistance) minDistance = dist;
        }
        return { station, distanceToRouteKm: minDistance };
      })
      // Rota çizgisine 10 km veya daha yakın olan istasyonları filtrele
      .filter((item) => item.distanceToRouteKm <= 10)
      .sort((a, b) => a.distanceToRouteKm - b.distanceToRouteKm);

    // 4. Şarj tarifelerini al ve fiyat hesapla
    const tariffs = await prisma.operatorTariff.findMany({ where: { isActive: true } });
    const tariffIndex = buildTariffIndex(tariffs);

    // Operatör bazlı tahmini DC şarj fiyatı eşleştirmesi
    const defaultDcFiyat = 8.5; // TL/kWh varsayılan fiyat (tarifesi yoksa)
    const recommendedStops = [];
    
    // Basit durak hesaplayıcı: Aracın menzili yetmiyorsa rota üzerindeki hızlı şarj noktalarından durak öner
    const numStopsNeeded = Math.max(0, Math.ceil(totalEnergyRequiredKwh / (batteryCapacityKwh * 0.7)) - 1);
    
    // Hızlı DC şarj noktalarını seç
    const dcStations = nearbyStations
      .filter((s) => s.station.isFast || (s.station.maxPowerKw && s.station.maxPowerKw >= 50))
      .slice(0, Math.max(3, numStopsNeeded * 2)); // Alternatifleriyle önerelim

    // Önerilen istasyonlar için fiyat tahmini ekleyelim
    const formattedStops = dcStations.map((item) => {
      const tariff = matchTariff(tariffIndex, item.station.operator);
      // DC fiyatı var mı kontrol et, yoksa varsayılan
      const pricePerKwh = tariff?.dcPrice || item.station.pricePerKwh || defaultDcFiyat;
      
      return {
        id: item.station.id,
        name: item.station.name,
        operator: item.station.operator,
        city: item.station.city,
        lat: item.station.lat,
        lng: item.station.lng,
        maxPowerKw: item.station.maxPowerKw || 120,
        pricePerKwh,
        distanceToRouteKm: Number(item.distanceToRouteKm.toFixed(1)),
      };
    });

    // Ortalama ₺/kWh fiyatını bul
    const avgPrice = formattedStops.length > 0
      ? formattedStops.reduce((sum, s) => sum + s.pricePerKwh, 0) / formattedStops.length
      : defaultDcFiyat;

    const estimatedCostTl = Math.round(totalEnergyRequiredKwh * avgPrice);

    return ok({
      route: {
        distanceKm,
        durationMin,
        geometry,
      },
      vehicle: vehicle ? {
        brand: vehicle.brand,
        model: vehicle.model,
        batteryKwh: batteryCapacityKwh,
        consumption: consumptionKwh100,
        rangeKm: vehicleRangeWltp,
      } : null,
      summary: {
        totalEnergyRequiredKwh: Number(totalEnergyRequiredKwh.toFixed(1)),
        numStopsNeeded,
        estimatedCostTl,
      },
      recommendedStations: formattedStops,
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Rota hesaplama hatası", 500);
  }
}

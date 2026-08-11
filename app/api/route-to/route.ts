import { NextRequest } from "next/server";
import { fail, ok } from "@/lib/api";
import { fetchWithRetry } from "@/lib/ingest/http";

export const dynamic = "force-dynamic";

/**
 * GET /api/route-to?fromLat=&fromLng=&toLat=&toLng=
 *
 * Kullanıcının konumundan şarj istasyonuna GERÇEK yol rotasını döndürür
 * (OpenRouteService · driving-car). Anahtar tanımlı değilse veya servis
 * yanıt vermezse kuş uçuşu mesafeye düşer ve bunu `mode` alanında bildirir —
 * uydurma bir süre/mesafe üretilmez.
 */

const ORS_ENDPOINT =
  "https://api.openrouteservice.org/v2/directions/driving-car/geojson";

type OrsResponse = {
  features?: {
    geometry?: { coordinates?: [number, number][] };
    properties?: { summary?: { distance?: number; duration?: number } };
  }[];
  error?: { message?: string } | string;
};

const coord = (raw: string | null, max: number) => {
  const n = Number(raw);
  return Number.isFinite(n) && Math.abs(n) <= max ? n : null;
};

/** Haversine — düz çizgi mesafesi (km). */
function straightLineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) *
      Math.cos((bLat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const fromLat = coord(sp.get("fromLat"), 90);
  const fromLng = coord(sp.get("fromLng"), 180);
  const toLat = coord(sp.get("toLat"), 90);
  const toLng = coord(sp.get("toLng"), 180);

  if (fromLat == null || fromLng == null || toLat == null || toLng == null) {
    return fail("Geçerli başlangıç ve varış koordinatı gerekli", 400);
  }

  const fallback = {
    mode: "straight" as const,
    distanceKm: Number(straightLineKm(fromLat, fromLng, toLat, toLng).toFixed(1)),
    durationMin: null as number | null,
    // Kuş uçuşu: iki uç nokta.
    geometry: [
      [fromLng, fromLat],
      [toLng, toLat],
    ] as [number, number][],
  };

  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  if (!apiKey) {
    return ok({ ...fallback, note: "Rota servisi yapılandırılmadı" });
  }

  try {
    const res = await fetchWithRetry(ORS_ENDPOINT, {
      method: "POST",
      timeoutMs: 15_000,
      retries: 1,
      headers: {
        authorization: apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        coordinates: [
          [fromLng, fromLat],
          [toLng, toLat],
        ],
        // Ayrıntılı adım listesi istemiyoruz; özet + çizgi yeterli.
        instructions: false,
      }),
    });

    const data = (await res.json()) as OrsResponse;
    const feature = data.features?.[0];
    const summary = feature?.properties?.summary;
    const geometry = feature?.geometry?.coordinates;

    if (!summary?.distance || !geometry?.length) {
      return ok({ ...fallback, note: "Rota bulunamadı, kuş uçuşu mesafe gösteriliyor" });
    }

    return ok({
      mode: "route" as const,
      distanceKm: Number((summary.distance / 1000).toFixed(1)),
      durationMin: summary.duration ? Math.round(summary.duration / 60) : null,
      geometry,
      attribution: "Rota: OpenRouteService · © OpenStreetMap katkıcıları",
    });
  } catch (e) {
    // Servis hatasında sessizce kuş uçuşuna düşülür; kullanıcı hangi modda
    // olduğunu `mode` alanından görür.
    return ok({
      ...fallback,
      note: `Rota servisi yanıt vermedi: ${e instanceof Error ? e.message : "hata"}`,
    });
  }
}

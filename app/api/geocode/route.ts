import { NextRequest, NextResponse } from "next/server";
import { fail, ok } from "@/lib/api";
import { fetchWithRetry } from "@/lib/ingest/http";

export const dynamic = "force-dynamic";

const GEOCODE_ENDPOINT = "https://api.openrouteservice.org/geocode/search";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const text = sp.get("text");

  if (!text) return fail("Aranacak metin (text) gereklidir.", 400);

  const apiKey = process.env.OPENROUTESERVICE_API_KEY;
  const isMock = !apiKey || apiKey === "none" || apiKey === "mock" || apiKey === "false" || apiKey.trim() === "";
  
  if (isMock) {
    const TURKEY_CITIES: Record<string, { lat: number; lng: number; label: string }> = {
      istanbul: { lat: 41.0082, lng: 28.9784, label: "İstanbul, Türkiye" },
      ankara: { lat: 39.9334, lng: 32.8597, label: "Ankara, Türkiye" },
      izmir: { lat: 38.4192, lng: 27.1287, label: "İzmir, Türkiye" },
      bursa: { lat: 40.1824, lng: 29.0664, label: "Bursa, Türkiye" },
      antalya: { lat: 36.8841, lng: 30.7056, label: "Antalya, Türkiye" },
      eskisehir: { lat: 39.7767, lng: 30.5206, label: "Eskişehir, Türkiye" },
      bolu: { lat: 40.7325, lng: 31.6082, label: "Bolu, Türkiye" },
      balikesir: { lat: 39.6484, lng: 27.8826, label: "Balıkesir, Türkiye" },
      afyon: { lat: 38.7564, lng: 30.5381, label: "Afyonkarahisar, Türkiye" },
      mugla: { lat: 37.2181, lng: 28.3665, label: "Muğla, Türkiye" },
      kocaeli: { lat: 40.7652, lng: 29.9407, label: "Kocaeli, Türkiye" },
      izmit: { lat: 40.7652, lng: 29.9407, label: "İzmit, Türkiye" },
      bodrum: { lat: 37.0341, lng: 27.4305, label: "Bodrum, Muğla" },
    };

    const query = text.toLowerCase().trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ı/g, "i");
    
    const matchedKeys = Object.keys(TURKEY_CITIES).filter(key => key.includes(query) || query.includes(key));
    const results = matchedKeys.map(key => ({
      name: TURKEY_CITIES[key].label,
      lat: TURKEY_CITIES[key].lat,
      lng: TURKEY_CITIES[key].lng,
    }));
    return ok({ results });
  }

  try {
    const res = await fetchWithRetry(
      `${GEOCODE_ENDPOINT}?api_key=${apiKey}&text=${encodeURIComponent(text)}&size=5&boundary.country=TR`,
      { timeoutMs: 10_000 }
    );

    const data = await res.json();
    const results = (data.features || []).map((feat: any) => ({
      name: feat.properties.label || feat.properties.name,
      lat: feat.geometry.coordinates[1],
      lng: feat.geometry.coordinates[0],
    }));

    return ok({ results });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Geocode hatası", 500);
  }
}

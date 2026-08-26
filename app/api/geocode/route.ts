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
  if (!apiKey) {
    return fail("OpenRouteService API anahtarı (.env dosyasında) tanımlanmamış.", 500);
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
